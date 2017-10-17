import React, { Component } from 'react'
import PropTypes            from 'prop-types'
import Validator            from 'validator'

export default (Component) => {
  return class FormComponent extends Component {
    static propTypes = {
      name           : PropTypes.string.isRequired,
      disabled       : PropTypes.bool,
      required       : PropTypes.bool,
      regexValidation: PropTypes.string,
      validations    : PropTypes.object
    }

    static contextTypes = {
      ICFormable: PropTypes.object
    }

    state = {
      isValid: true,
      serverError: null
    }

    componentWillMount() {
      this.context.ICFormable && this.context.ICFormable.registerComponent(this)
    }

    componentWillUnmount() {
      this.context.ICFormable && this.context.ICFormable.unregisterComponent(this)
    }

    getValue = () => {
      if (this.FormComponent.state && Object.prototype.hasOwnProperty.call(this.FormComponent.state, 'value')) {
        // If component uses state to store value
        return this.FormComponent.state.value
      } else if (this.FormComponent.refs && this.FormComponent.refs.input) {
        // If component uses ref to store input value
        return this.FormComponent.refs.input.value
      }

      return console.error('Using FormComponent with no way to retrieve FormComponent value')
    }

    hasValue = () => {
      const value = this.getValue()
      return value !== '' && value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0)
    }

    validate() {
      const {
        regexValidation,
        required,
        validations
      } = this.props

      const { serverError } = this.state
      const value           = this.getValue()
      let isValid           = true

      // Check if has no validations
      if (!validations && !required && !serverError && !regexValidation) {
        return isValid
      }

      // Check required validation
      if (required && !this.hasValue()) {
        isValid = false
      }

      // Check Validator.js validations
      if (isValid && value && validations) {
        Object.keys(validations).forEach( (validateMethod) => {
          const options = validations[validateMethod]
          const args    = [value].concat(options).filter( v => v ) // Remove null options

          if (!Validator[validateMethod].apply(Validator, args)) {
            isValid = false
          }
        })
      }

      // Check regex validation
      if (isValid && value && regexValidation) {
        const re = new RegExp(regexValidation)
        isValid  = re.test(value)
      }

      this.setState({isValid: isValid, serverError: null})
      return isValid
    }

    render() {
      const {
        isValid,
        serverError
      } = this.state

      const formComponentProps = {
        isValid      : isValid,
        ref          : (node) => {this.FormComponent = node},
        serverError  : serverError,
        ...this.props
      }

      return <Component {...formComponentProps} />
    }
  }
}

