import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import * as validators from '../../../util/validators';
import { getPropsForCustomUserFieldInputs } from '../../../util/userHelpers';

import { Form, PrimaryButton, FieldTextInput, CustomExtendedDataField } from '../../../components';

import FieldSelectUserType from '../FieldSelectUserType';
import UserFieldDisplayName from '../UserFieldDisplayName';
import UserFieldPhoneNumber from '../UserFieldPhoneNumber';

import css from './SignupForm.module.css';

const getSoleUserTypeMaybe = userTypes =>
  Array.isArray(userTypes) && userTypes.length === 1 ? userTypes[0].userType : null;

const SignupFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    initialValues={{ userType: props.preselectedUserType || getSoleUserTypeMaybe(props.userTypes) }}
    render={formRenderProps => {
      const {
        rootClassName,
        className,
        formId,
        handleSubmit,
        inProgress,
        invalid,
        intl,
        termsAndConditions,
        preselectedUserType,
        userTypes,
        userFields,
        values,
      } = formRenderProps;

      const { userType } = values || {};

      // email
      const emailRequired = validators.required(
        intl.formatMessage({
          id: 'SignupForm.emailRequired',
        })
      );
      const emailValid = validators.emailFormatValid(
        intl.formatMessage({
          id: 'SignupForm.emailInvalid',
        })
      );

      // password
      const passwordRequiredMessage = intl.formatMessage({
        id: 'SignupForm.passwordRequired',
      });
      const passwordMinLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooShort',
        },
        {
          minLength: validators.PASSWORD_MIN_LENGTH,
        }
      );
      const passwordMaxLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooLong',
        },
        {
          maxLength: validators.PASSWORD_MAX_LENGTH,
        }
      );
      const passwordMinLength = validators.minLength(
        passwordMinLengthMessage,
        validators.PASSWORD_MIN_LENGTH
      );
      const passwordMaxLength = validators.maxLength(
        passwordMaxLengthMessage,
        validators.PASSWORD_MAX_LENGTH
      );
      const passwordRequired = validators.requiredStringNoTrim(passwordRequiredMessage);
      const passwordValidators = validators.composeValidators(
        passwordRequired,
        passwordMinLength,
        passwordMaxLength
      );

      // Custom user fields. Since user types are not supported here,
      // only fields with no user type id limitation are selected.
      const userFieldProps = getPropsForCustomUserFieldInputs(userFields, intl, userType);

      const noUserTypes = !userType && !(userTypes?.length > 0);
      const userTypeConfig = userTypes.find(config => config.userType === userType);
      const showDefaultUserFields = userType || noUserTypes;
      const showCustomUserFields = (userType || noUserTypes) && userFieldProps?.length > 0;

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = invalid || submitInProgress;

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <FieldSelectUserType
            name="userType"
            userTypes={userTypes}
            hasExistingUserType={!!preselectedUserType}
            intl={intl}
          />

          {showDefaultUserFields ? (
            <div className={css.defaultUserFields}>
              <FieldTextInput
                type="email"
                id={formId ? `${formId}.email` : 'email'}
                name="email"
                autoComplete="email"
                label={intl.formatMessage({
                  id: 'SignupForm.emailLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'SignupForm.emailPlaceholder',
                })}
                validate={validators.composeValidators(emailRequired, emailValid)}
              />
              <div className={css.name}>
                <FieldTextInput
                  className={css.firstNameRoot}
                  type="text"
                  id={formId ? `${formId}.fname` : 'fname'}
                  name="fname"
                  autoComplete="given-name"
                  label={intl.formatMessage({
                    id: 'SignupForm.firstNameLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'SignupForm.firstNamePlaceholder',
                  })}
                  validate={validators.required(
                    intl.formatMessage({
                      id: 'SignupForm.firstNameRequired',
                    })
                  )}
                />
                <FieldTextInput
                  className={css.lastNameRoot}
                  type="text"
                  id={formId ? `${formId}.lname` : 'lname'}
                  name="lname"
                  autoComplete="family-name"
                  label={intl.formatMessage({
                    id: 'SignupForm.lastNameLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'SignupForm.lastNamePlaceholder',
                  })}
                  validate={validators.required(
                    intl.formatMessage({
                      id: 'SignupForm.lastNameRequired',
                    })
                  )}
                />
              </div>

              <UserFieldDisplayName
                formName="SignupForm"
                className={css.row}
                userTypeConfig={userTypeConfig}
                intl={intl}
              />

              <FieldTextInput
                className={css.password}
                type="password"
                id={formId ? `${formId}.password` : 'password'}
                name="password"
                autoComplete="new-password"
                label={intl.formatMessage({
                  id: 'SignupForm.passwordLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'SignupForm.passwordPlaceholder',
                })}
                validate={passwordValidators}
              />

              <UserFieldPhoneNumber
                formName="SignupForm"
                className={css.row}
                userTypeConfig={userTypeConfig}
                intl={intl}
              />
            </div>
          ) : null}

          {showCustomUserFields ? (
            <div className={css.customFields}>
              {userFieldProps.map(({ key, ...fieldProps }) => (
                <CustomExtendedDataField key={key} {...fieldProps} formId={formId} />
              ))}
            </div>
          ) : null}

          <div className={css.bottomWrapper}>
            {termsAndConditions}
            <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
              <FormattedMessage id="SignupForm.signUp" />
            </PrimaryButton>
          </div>
        </Form>
      );
    }}
  />
);

/**
 * A component that renders the signup form.
 *
 * @component
 * @param {Object} props
 * @param {string} props.rootClassName - The root class name that overrides the default class css.root
 * @param {string} props.className - The class that extends the root class
 * @param {string} props.formId - The form id
 * @param {boolean} props.inProgress - Whether the form is in progress
 * @param {ReactNode} props.termsAndConditions - The terms and conditions
 * @param {string} props.preselectedUserType - The preselected user type
 * @param {propTypes.userTypes} props.userTypes - The user types
 * @param {propTypes.listingFields} props.userFields - The user fields
 * @returns {JSX.Element}
 */
const SignupForm = props => {
  const intl = useIntl();
  // Add useEffect to style the console-configured postcode field
  React.useEffect(() => {
    // Function to find and set up the postcode field
    const setupPostcodeField = () => {
      // Debug: Log what we're finding
      console.log('SignupForm: Looking for postcode field...');
      
      // Try multiple selectors to find the postcode field
      let postcodeField = null;
      
      // Method 1: Try by name attribute
      postcodeField = document.querySelector('textarea[name="postcode"]');
      console.log('SignupForm: Found by name="postcode":', postcodeField);
      
      // Method 2: Try by ID
      if (!postcodeField) {
        postcodeField = document.querySelector('#postcode');
        console.log('SignupForm: Found by ID="postcode":', postcodeField);
      }
      
      // Method 3: Try by looking for any textarea in the form
      if (!postcodeField) {
        const form = document.querySelector('form');
        if (form) {
          const textareas = form.querySelectorAll('textarea');
          console.log('SignupForm: All textareas found:', textareas);
          
          // Look for the one that's likely the postcode field
          for (let textarea of textareas) {
            const label = textarea.previousElementSibling;
            if (label && label.textContent && label.textContent.toLowerCase().includes('location')) {
              postcodeField = textarea;
              console.log('SignupForm: Found postcode field by label content:', postcodeField);
              break;
            }
          }
        }
      }
      
      // Method 4: Try by looking for any input/textarea with postcode-related attributes
      if (!postcodeField) {
        const allInputs = document.querySelectorAll('input, textarea');
        console.log('SignupForm: All inputs found:', allInputs);
        
        for (let input of allInputs) {
          const name = input.name || '';
          const id = input.id || '';
          const placeholder = input.placeholder || '';
          
          if (name.toLowerCase().includes('postcode') || 
              id.toLowerCase().includes('postcode') || 
              placeholder.toLowerCase().includes('postcode') ||
              placeholder.toLowerCase().includes('location')) {
            postcodeField = input;
            console.log('SignupForm: Found postcode field by attributes:', postcodeField);
            break;
          }
        }
      }

      if (postcodeField) {
        console.log('SignupForm: Successfully found postcode field:', postcodeField);
        console.log('SignupForm: Field attributes:', {
          name: postcodeField.name,
          id: postcodeField.id,
          type: postcodeField.type,
          tagName: postcodeField.tagName
        });

        const fieldContainer = postcodeField.closest('.fieldContainer') || 
                             postcodeField.closest('.field') || 
                             postcodeField.parentElement;
        
        if (fieldContainer) {
          fieldContainer.classList.add(css.postcodeField);
          console.log('SignupForm: Applied postcodeField CSS class to container');
        }

        // Prevent multi-line input and make it behave like a single-line text input
        if (postcodeField.tagName === 'TEXTAREA') {
          postcodeField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              return false;
            }
          });

          // Prevent paste of multi-line content
          postcodeField.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text');
            const singleLineText = text.replace(/\r?\n/g, ' ').trim();
            document.execCommand('insertText', false, singleLineText);
          });

          // Auto-resize to single line height
          postcodeField.style.height = '48px';
          postcodeField.addEventListener('input', () => {
            postcodeField.style.height = '48px';
          });
        }

        // Add postcode validation functionality
        let validationTimeout;
        let isValidating = false;
        let isPostcodeValid = false; // Track postcode validity state

        // Function to update submit button state
        const updateSubmitButtonState = () => {
          const form = postcodeField.closest('form');
          if (form) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
              // Check both postcode validity AND terms checkbox
              const termsCheckbox = form.querySelector('input[name="terms"]');
              const isTermsAccepted = termsCheckbox && termsCheckbox.checked;
              
              const shouldEnableButton = isPostcodeValid && isTermsAccepted;
              submitButton.disabled = !shouldEnableButton;
              
              if (!shouldEnableButton) {
                if (!isPostcodeValid) {
                  submitButton.title = 'Please enter a valid UK postcode to continue';
                } else if (!isTermsAccepted) {
                  submitButton.title = 'Please accept the terms and conditions to continue';
                }
                submitButton.style.opacity = '0.6';
                submitButton.style.cursor = 'not-allowed';
              } else {
                submitButton.title = '';
                submitButton.style.opacity = '1';
                submitButton.style.cursor = 'pointer';
              }
            }
          }
        };

        // Function to validate UK postcode format
        const validateUKPostcodeFormat = (postcode) => {
          const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
          return UK_POSTCODE_REGEX.test(postcode);
        };

        // Function to validate postcode with API
        const validatePostcodeWithAPI = async (postcode) => {
          try {
            const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
            const response = await fetch(`${apiBaseUrl}/api/postcode/validate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ postcode }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              return { isValid: false, message: errorData.message || 'Invalid UK postcode' };
            }

            const result = await response.json();
            return { isValid: result.isValid, message: result.message || 'Invalid UK postcode' };
          } catch (error) {
            return { isValid: false, message: 'Unable to validate postcode. Please try again.' };
          }
        };

        // Function to show validation message
        const showValidationMessage = (message, isError = true) => {
          // Remove existing validation message
          const existingMessage = fieldContainer.querySelector('.validation-message');
          if (existingMessage) {
            existingMessage.remove();
          }

          // Create new validation message
          const messageElement = document.createElement('div');
          messageElement.className = `validation-message ${isError ? 'error' : 'success'}`;
          messageElement.textContent = message;
          messageElement.style.cssText = `
            color: ${isError ? '#dc2626' : '#059669'};
            font-size: 12px;
            margin-top: 4px;
            display: block;
          `;

          // Insert after the input/textarea
          postcodeField.parentNode.insertBefore(messageElement, postcodeField.nextSibling);
        };

        // Function to clear validation message
        const clearValidationMessage = () => {
          const existingMessage = fieldContainer.querySelector('.validation-message');
          if (existingMessage) {
            existingMessage.remove();
          }
        };

        // Function to validate postcode
        const validatePostcode = async (postcode) => {
          if (!postcode || postcode.trim() === '') {
            clearValidationMessage();
            isPostcodeValid = false;
            updateSubmitButtonState();
            return;
          }

          // First validate format
          if (!validateUKPostcodeFormat(postcode)) {
            showValidationMessage('Please enter a valid UK postcode format (e.g., SW1A 1AA)', true);
            isPostcodeValid = false;
            updateSubmitButtonState();
            return;
          }

          // Clear format error if format is valid
          clearValidationMessage();

          // Show validating message
          showValidationMessage('Validating postcode...', false);

          // Validate with API
          const apiResult = await validatePostcodeWithAPI(postcode);
          
          if (apiResult.isValid) {
            showValidationMessage('✓ Valid UK postcode', false);
            isPostcodeValid = true;
          } else {
            showValidationMessage(apiResult.message, true);
            isPostcodeValid = false;
          }
          
          updateSubmitButtonState();
        };

        // Add validation on blur (when field loses focus)
        postcodeField.addEventListener('blur', (e) => {
          const postcode = e.target.value.trim();
          if (postcode.length >= 5) {
            validatePostcode(postcode);
          } else if (postcode.length > 0) {
            showValidationMessage('Please enter a valid UK postcode format (e.g., SW1A 1AA)', true);
            isPostcodeValid = false;
            updateSubmitButtonState();
          } else {
            clearValidationMessage();
            isPostcodeValid = false;
            updateSubmitButtonState();
          }
        });

        // Add validation on input (with debouncing)
        postcodeField.addEventListener('input', (e) => {
          const postcode = e.target.value.trim();
          
          // Clear validation message on input
          clearValidationMessage();

          // Clear existing timeout
          if (validationTimeout) {
            clearTimeout(validationTimeout);
          }

          // Set new timeout for validation
          if (postcode.length >= 5) {
            validationTimeout = setTimeout(() => {
              validatePostcode(postcode);
            }, 500); // 500ms debounce
          } else if (postcode.length > 0) {
            // Show format error immediately for short inputs
            showValidationMessage('Please enter a valid UK postcode format (e.g., SW1A 1AA)', true);
            isPostcodeValid = false;
            updateSubmitButtonState();
          } else {
            // Clear validation for empty input
            isPostcodeValid = false;
            updateSubmitButtonState();
          }
        });

        // Add required validation for form submission
        const form = postcodeField.closest('form');
        if (form) {
          // Initially disable submit button
          updateSubmitButtonState();
          
          form.addEventListener('submit', async (e) => {
            const postcode = postcodeField.value.trim();
            
            if (!postcode) {
              e.preventDefault();
              showValidationMessage('Postcode is required', true);
              postcodeField.focus();
              return;
            }

            if (!validateUKPostcodeFormat(postcode)) {
              e.preventDefault();
              showValidationMessage('Please enter a valid UK postcode format (e.g., SW1A 1AA)', true);
              postcodeField.focus();
              return;
            }

            // Validate with API before submission
            const apiResult = await validatePostcodeWithAPI(postcode);
            if (!apiResult.isValid) {
              e.preventDefault();
              showValidationMessage(apiResult.message, true);
              postcodeField.focus();
              return;
            }
          });

          // Add event listener for terms checkbox changes
          const termsCheckbox = form.querySelector('input[name="terms"]');
          if (termsCheckbox) {
            termsCheckbox.addEventListener('change', () => {
              updateSubmitButtonState();
            });
          }
        }

        console.log('SignupForm: Successfully set up postcode field with validation');
        return true; // Success
      } else {
        console.warn('SignupForm: Could not find postcode field');
        return false; // Not found
      }
    };

    // Try to set up the field immediately
    let success = setupPostcodeField();
    
    // If not found, retry with delays
    if (!success) {
      console.log('SignupForm: Postcode field not found, retrying with delays...');
      
      // Retry after 100ms
      setTimeout(() => {
        success = setupPostcodeField();
        if (!success) {
          // Retry after 500ms
          setTimeout(() => {
            success = setupPostcodeField();
            if (!success) {
              // Final retry after 1 second
              setTimeout(() => {
                setupPostcodeField();
              }, 1000);
            }
          }, 500);
        }
      }, 100);
    }
  }, []);
  return <SignupFormComponent {...props} intl={intl} />;
};

export default SignupForm;
