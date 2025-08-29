import React, { useState, useEffect } from 'react';
import { Field } from 'react-final-form';
import classNames from 'classnames';
import { ValidationError, IconSpinner } from '../../components';

import css from './FieldPostcodeInput.module.css';

const FieldPostcodeInputComponent = props => {
  const {
    rootClassName,
    className,
    inputRootClass,
    customErrorText,
    id,
    label,
    input,
    meta,
    hideErrorMessage,
    placeholder = 'Enter UK postcode (e.g., SW1A 1AA)',
    onPostcodeChange,
    ...rest
  } = props;

  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  if (label && !id) {
    throw new Error('id required when a label is given');
  }

  const { valid, invalid, touched, error } = meta;
  const errorText = customErrorText || error;

  // Error message and input error styles are only shown if the
  // field has been touched and the validation has failed.
  const hasError = !!customErrorText || !!(touched && invalid && error);

  const fieldMeta = { touched: hasError, error: errorText };

  const inputClasses = inputRootClass ||
    classNames(css.input, {
      [css.inputSuccess]: valid && validationResult?.isValid,
      [css.inputError]: hasError || (validationResult && !validationResult.isValid),
      [css.inputValidating]: isValidating,
    });

  const classes = classNames(rootClassName || css.root, className);

  // UK postcode validation function
  const validateUKPostcode = async (postcode) => {
    if (!postcode || postcode.length < 5) {
      return null;
    }

    setIsValidating(true);
    try {
      const response = await fetch('/api/postcode/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postcode }),
      });

      const result = await response.json();
      setValidationResult(result);
      
      if (result.isValid && onPostcodeChange) {
        onPostcodeChange(result);
      }
      
      return result;
    } catch (error) {
      console.error('Postcode validation error:', error);
      setValidationResult({ isValid: false, error: 'Validation failed' });
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  // Debounced validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (input.value) {
        validateUKPostcode(input.value);
      } else {
        setValidationResult(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [input.value]);

  // UK postcode suggestions
  const ukPostcodeSuggestions = [
    'SW1A 1AA', // London - Westminster
    'M1 1AA',   // Manchester
    'B1 1AA',   // Birmingham
    'LS1 1AA',  // Leeds
    'L1 1AA',   // Liverpool
    'EH1 1AA',  // Edinburgh
    'G1 1AA',   // Glasgow
    'CF1 1AA',  // Cardiff
    'BS1 1AA',  // Bristol
    'NG1 1AA',  // Nottingham
  ];

  const handleSuggestionClick = (suggestion) => {
    input.onChange(suggestion);
    setSuggestions([]);
  };

  const handleInputFocus = () => {
    if (input.value.length > 0) {
      setSuggestions(ukPostcodeSuggestions.filter(p => 
        p.toLowerCase().includes(input.value.toLowerCase())
      ));
    } else {
      setSuggestions(ukPostcodeSuggestions);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setSuggestions([]), 200);
  };

  return (
    <div className={classes}>
      {label ? <label htmlFor={id}>{label}</label> : null}
      
      <div className={css.inputWrapper}>
        <input
          className={inputClasses}
          id={id}
          type="text"
          placeholder={placeholder}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          {...input}
          {...rest}
        />
        
        {isValidating && (
          <div className={css.spinnerWrapper}>
            <IconSpinner className={css.spinner} />
          </div>
        )}
        
        {validationResult?.isValid && (
          <div className={css.validIcon}>
            ✓
          </div>
        )}
      </div>

      {/* Postcode suggestions */}
      {suggestions.length > 0 && (
        <div className={css.suggestions}>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={css.suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {/* Validation result message */}
      {validationResult && !validationResult.isValid && validationResult.message && (
        <div className={css.validationMessage}>
          {validationResult.message}
        </div>
      )}

      {/* Region info */}
      {validationResult?.isValid && validationResult.area && (
        <div className={css.regionInfo}>
          Area: {validationResult.area}
        </div>
      )}

      {hideErrorMessage ? null : <ValidationError fieldMeta={fieldMeta} />}
    </div>
  );
};

/**
 * Create Final Form field for UK postcode input with validation.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {string?} props.inputRootClass overwrite components own css.input
 * @param {string?} props.customErrorText custom error text to show
 * @param {string?} props.id unique identifier for the field
 * @param {string?} props.label label for the field
 * @param {Object} props.input Final Form input object
 * @param {Object} props.meta Final Form meta object
 * @param {boolean} props.hideErrorMessage hide error message
 * @param {string?} props.placeholder placeholder text
 * @param {Function?} props.onPostcodeChange callback when postcode is validated
 * @returns {JSX.Element} FieldPostcodeInput component
 */
const FieldPostcodeInput = props => (
  <Field component={FieldPostcodeInputComponent} {...props} />
);

export default FieldPostcodeInput;
