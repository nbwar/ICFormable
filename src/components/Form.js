import React, { Component } from 'react'
import PropTypes            from 'prop-types'

class Form extends Component {
  static propTypes = {
    children    : PropTypes.node,
    formProps   : PropTypes.object,
    onSubmit    : PropTypes.func,
    serverErrors: PropTypes.object
  }

  static childContextTypes = {
    ICFormable: PropTypes.object
  }

  state = {
    serverErrors: null
  }

  getChildContext() {
    return {
      ICFormable: {
        registerComponent  : this.registerComponent,
        unregisterComponent: this.unregisterComponent
      }
    }
  }

  constructor() {
    super()
    this.model          = {}
    this.formComponents = {}
  }

  componentDidMount() {
    this.updateModel()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.serverErrors && !_.isEqual(this.state.serverErrors, nextProps.serverErrors)) {
      this.setState({serverErrors: nextProps.serverErrors}, () => {
        this.setErrorsOnFormComponents(this.state.serverErrors)
      })
    }
  }

  registerComponent = (component) => {
    this.formComponents[component.props.name] = component
  }

  unregisterComponent = (component) => {
    delete this.formComponents[component.props.name]
    delete this.model[component.props.name]
  }

  setErrorsOnFormComponents(serverErrors) {
    Object.keys(serverErrors).forEach( (name) => {
      const component = this.formComponents[name]
      component.setState({
        isValid: false,
        serverError: serverErrors[name]
      })
    })
  }

  formIsValid() {
    const components = Object.values(this.formComponents)
    return components.every( component => component.validate() )
  }

  updateModel() {
    Object.keys(this.formComponents).forEach((name) => {
      const component = this.formComponents[name]
      if (component.props.disabled) {
        delete this.model[name]
      } else {
        this.model[name] = component.getValue()
      }
    })
  }

  handleSubmit = (e) => {
    e && e.preventDefault()
    this.updateModel()

    if (this.formIsValid()) {
      this.setState({serverErrors: null}, () => {
        this.props.onSubmit && this.props.onSubmit(this.model)
      })
    }
  }

  render() {
    const {
      children,
      formProps
    } = this.props

    return (
      <form {...formProps} onSubmit={this.handleSubmit}>
        {children}
      </form>
    )
  }
}

export default Form
