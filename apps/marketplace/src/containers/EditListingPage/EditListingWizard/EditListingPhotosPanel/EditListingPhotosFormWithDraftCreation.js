import React, { useState, useRef, useEffect } from 'react';
import { ARRAY_ERROR } from 'final-form';
import { Form as FinalForm, Field } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import { nonEmptyArray, composeValidators, required } from '../../../../util/validators';
import { isUploadImageOverLimitError } from '../../../../util/errors';
import PropTypes from 'prop-types';

// Import shared components
import { Button, Form, AspectRatioWrapper, FieldTextInput, FieldSelect } from '../../../../components';

// Import modules from this directory
import ListingImage from './ListingImage';
import css from './EditListingPhotosForm.module.css';

const ACCEPT_IMAGES = 'image/*';

const ImageUploadError = props => {
  return props.uploadOverLimit ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.imageUploadFailed.uploadOverLimit" />
    </p>
  ) : props.uploadImageError ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.imageUploadFailed.uploadFailed" />
    </p>
  ) : null;
};

// NOTE: PublishListingError and ShowListingsError are here since Photos panel is the last visible panel
const PublishListingError = props => {
  return props.error ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.publishListingFailed" />
    </p>
  ) : null;
};

const ShowListingsError = props => {
  return props.error ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.showListingFailed" />
    </p>
  ) : null;
};

// Field component that uses file-input to allow user to select images.
export const FieldAddImage = props => {
  const { formApi, onImageUploadHandler, aspectWidth = 1, aspectHeight = 1, ...rest } = props;
  return (
    <Field form={null} {...rest}>
      {fieldprops => {
        const { accept, input, label, disabled: fieldDisabled } = fieldprops;
        const { name, type } = input;
        const onChange = e => {
          const file = e.target.files[0];
          formApi.change(`addImage`, file);
          formApi.blur(`addImage`);
          onImageUploadHandler(file);
        };
        const inputProps = { accept, id: name, name, onChange, type };
        return (
          <div className={css.addImageWrapper}>
            <AspectRatioWrapper width={aspectWidth} height={aspectHeight}>
              {fieldDisabled ? null : <input {...inputProps} className={css.addImageInput} />}
              <label htmlFor={name} className={css.addImage}>
                {label}
              </label>
            </AspectRatioWrapper>
          </div>
        );
      }}
    </Field>
  );
};

// Component that shows listing images from "images" field array
const FieldListingImage = props => {
  const { name, onRemoveImage, intl, aspectWidth, aspectHeight, variantPrefix } = props;
  return (
    <Field name={name}>
      {fieldProps => {
        const { input } = fieldProps;
        const { value } = input;
        return (
          <ListingImage
            image={value}
            onRemoveImage={onRemoveImage}
            intl={intl}
            aspectWidth={aspectWidth}
            aspectHeight={aspectHeight}
            variantPrefix={variantPrefix}
          />
        );
      }}
    </Field>
  );
};

export const EditListingPhotosFormWithDraftCreation = ({ listingTypes = [], ...props }) => {
  const [state, setState] = useState({ imageUploadRequested: false });
  const [submittedImages, setSubmittedImages] = useState([]);
  const formRef = useRef(null);

  const onImageUploadHandler = file => {
    const { listingImageConfig, onImageUpload } = props;
    if (file) {
      setState({ imageUploadRequested: true });

      onImageUpload({ id: `${file.name}_${Date.now()}`, file }, listingImageConfig)
        .then(() => {
          setState({ imageUploadRequested: false });
        })
        .catch(() => {
          setState({ imageUploadRequested: false });
        });
    }
  };
  const intl = useIntl();

  return (
    <FinalForm
      {...props}
      mutators={{ ...arrayMutators }}
      enableReinitialize={true}
      render={formRenderProps => {
        const {
          form,
          className,
          fetchErrors,
          handleSubmit,
          invalid,
          onRemoveImage,
          disabled,
          ready,
          saveActionMsg,
          updated,
          updateInProgress,
          touched,
          errors,
          values,
          listingImageConfig,
          listingTypes,
          pristine,
        } = formRenderProps;

        const images = values.images || [];
        const { aspectWidth = 1, aspectHeight = 1, variantPrefix } = listingImageConfig;
        
        // Show other fields only after photos are added
        const hasPhotos = images && images.length > 0;

        const { publishListingError, showListingsError, updateListingError, uploadImageError } =
          fetchErrors || {};
        const uploadOverLimit = isUploadImageOverLimitError(uploadImageError);

        // imgs can contain added images (with temp ids) and submitted images with uniq ids.
        const arrayOfImgIds = imgs => imgs?.map(i => (typeof i.id === 'string' ? i.imageId : i.id));
        const imageIdsFromProps = arrayOfImgIds(images);
        const imageIdsFromPreviousSubmit = arrayOfImgIds(submittedImages);
        const imageArrayHasSameImages = isEqual(imageIdsFromProps, imageIdsFromPreviousSubmit);
        const submittedOnce = submittedImages.length > 0;
        const pristineSinceLastSubmit = submittedOnce && imageArrayHasSameImages;

        const submitReady = (updated && pristineSinceLastSubmit) || ready;
        const submitInProgress = updateInProgress || state.imageUploadRequested;
        // Check if all required fields are filled when photos are present
        // For photos tab, listing type might come from initial values or current listing
        const currentListingType = values.listingType || props.initialValues?.listingType;
        const currentTransactionProcessAlias = values.transactionProcessAlias || props.initialValues?.transactionProcessAlias;
        const currentUnitType = values.unitType || props.initialValues?.unitType;
        
        const hasRequiredFields = hasPhotos && (
          values.title && 
          values.title.trim() !== '' &&
          values.description && 
          values.description.trim() !== '' &&
          currentListingType && 
          currentTransactionProcessAlias && 
          currentUnitType
        );
        
        
        // Keep button enabled, validate on submit instead
        const submitDisabled = disabled || submitInProgress;

        const imagesError = touched.images && errors?.images && errors.images[ARRAY_ERROR];

        const classes = classNames(css.root, className);

        return (
          <Form
            className={classes}
            onSubmit={handleSubmit}
          >
            {updateListingError ? (
              <p className={css.error}>
                <FormattedMessage id="EditListingPhotosForm.updateFailed" />
              </p>
            ) : null}

            {/* Photos section - shown first */}
            <div className={css.imagesFieldArray}>
              <FieldArray
                name="images"
                validate={composeValidators(
                  nonEmptyArray(
                    intl.formatMessage({
                      id: 'EditListingPhotosForm.imageRequired',
                    })
                  )
                )}
              >
                {({ fields }) =>
                  fields.map((name, index) => (
                    <FieldListingImage
                      key={name}
                      name={name}
                      onRemoveImage={imageId => {
                        fields.remove(index);
                        onRemoveImage(imageId);
                      }}
                      intl={intl}
                      aspectWidth={aspectWidth}
                      aspectHeight={aspectHeight}
                      variantPrefix={variantPrefix}
                    />
                  ))
                }
              </FieldArray>

              <FieldAddImage
                id="addImage"
                name="addImage"
                accept={ACCEPT_IMAGES}
                label={
                  <span className={css.chooseImageText}>
                    <span className={css.chooseImage}>
                      <FormattedMessage id="EditListingPhotosForm.chooseImage" />
                    </span>
                    <span className={css.imageTypes}>
                      <FormattedMessage id="EditListingPhotosForm.imageTypes" />
                    </span>
                  </span>
                }
                type="file"
                disabled={state.imageUploadRequested}
                formApi={form}
                onImageUploadHandler={onImageUploadHandler}
                aspectWidth={aspectWidth}
                aspectHeight={aspectHeight}
              />
            </div>

            {imagesError ? <div className={css.arrayError}>{imagesError}</div> : null}

            <ImageUploadError
              uploadOverLimit={uploadOverLimit}
              uploadImageError={uploadImageError}
            />

            <p className={css.tip}>
              <FormattedMessage id="EditListingPhotosForm.addImagesTip" />
            </p>

            {/* Essential fields for draft creation - shown only after photos are added */}
            {hasPhotos && (
              <div className={css.draftFields}>
                <FieldTextInput
                  id="title"
                  name="title"
                  label={intl.formatMessage({ id: 'EditListingPhotosForm.title' })}
                  placeholder={intl.formatMessage({ id: 'EditListingPhotosForm.titlePlaceholder' })}
                  validate={required(intl.formatMessage({ id: 'EditListingPhotosForm.titleRequired' }))}
                  disabled={disabled}
                />

                <FieldTextInput
                  id="description"
                  name="description"
                  label={intl.formatMessage({ id: 'EditListingPhotosForm.description' })}
                  placeholder={intl.formatMessage({ id: 'EditListingPhotosForm.descriptionPlaceholder' })}
                  validate={required(intl.formatMessage({ id: 'EditListingPhotosForm.descriptionRequired' }))}
                  disabled={disabled}
                />

                {/* Category selection */}
                <FieldSelect
                  id="categoryLevel1"
                  name="publicData.categoryLevel1"
                  label="Category"
                  validate={required('Please select a category')}
                  disabled={disabled}
                >
                  <option value="">Select category</option>
                  <option value="General_DIY__Home_Improvement">General DIY & Home Improvement</option>
                  <option value="Carpentry__Woodworking">Carpentry & Woodworking</option>
                  <option value="Plumbing__Bathrooms">Plumbing & Bathrooms</option>
                  <option value="Electrical__Lighting">Electrical & Lighting</option>
                  <option value="Garden__Outdoor">Garden & Outdoor</option>
                  <option value="Automotive__Garage">Automotive & Garage</option>
                  <option value="Cleaning__Maintenance">Cleaning & Maintenance</option>
                  <option value="Building__Masonry">Building & Masonry</option>
                  <option value="Craft__Upcycling">Craft & Upcycling</option>
                </FieldSelect>

                {/* Collection or Delivery selection */}
                <FieldSelect
                  id="collectionDelivery"
                  name="publicData.Collection_or_Delivery"
                  label="Collection or Delivery"
                  validate={required('Please select collection or delivery option')}
                  disabled={disabled}
                >
                  <option value="">Select option</option>
                  <option value="Collect_from_My_Home">Collect from My Home</option>
                  <option value="I_can_deliver_locally">I can deliver locally</option>
                </FieldSelect>
                
                {/* Hidden fields for other required data */}
                <Field name="publicData.listingType" render={() => null} />
                <Field name="publicData.transactionProcessAlias" render={() => null} />
                <Field name="publicData.unitType" render={() => null} />
                <Field name="publicData.categoryLevel2" render={() => null} />
                <Field name="publicData.categoryLevel3" render={() => null} />
                <Field name="privateData" render={() => null} />
              </div>
            )}

            <PublishListingError error={publishListingError} />
            <ShowListingsError error={showListingsError} />

            <Button
              className={css.submitButton}
              type="submit"
              inProgress={submitInProgress}
              disabled={submitDisabled}
              ready={submitReady}
            >
              Next
            </Button>
          </Form>
        );
      }}
    />
  );
};

// Removed defaultProps - using default parameters instead

EditListingPhotosFormWithDraftCreation.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  ready: PropTypes.bool,
  fetchErrors: PropTypes.object,
  initialValues: PropTypes.object,
  onImageUpload: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onRemoveImage: PropTypes.func.isRequired,
  saveActionMsg: PropTypes.string,
  updated: PropTypes.bool,
  updateInProgress: PropTypes.bool,
  listingImageConfig: PropTypes.object.isRequired,
  listingTypes: PropTypes.array,
};

export default EditListingPhotosFormWithDraftCreation;
