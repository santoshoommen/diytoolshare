import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Form, Field } from 'react-final-form';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { Button, FieldTextInput, FieldSelect, FieldCheckbox } from '../';
import { createInstance } from '../../util/sdkLoader';
import appSettings from '../../config/settings';
import * as apiUtils from '../../util/api';
import ImageClassification from '../ImageClassification/ImageClassification';
import css from './CustomListingForm.module.css';

const CustomListingForm = ({ onSubmit, onCancel, initialValues = {}, isSubmitting = false }) => {
  const intl = useIntl();
  const [uploadingImages, setUploadingImages] = useState(new Set());
  const [uploadErrors, setUploadErrors] = useState({});
  const [lastUploadedImage, setLastUploadedImage] = useState(null);
  const [classificationResult, setClassificationResult] = useState(null);
  
  // Create SDK instance for image uploads
  const sdk = useMemo(() => {
    const baseUrl = appSettings.sdk.baseUrl ? { baseUrl: appSettings.sdk.baseUrl } : {};
    const assetCdnBaseUrl = appSettings.sdk.assetCdnBaseUrl
      ? { assetCdnBaseUrl: appSettings.sdk.assetCdnBaseUrl }
      : {};
    
    return createInstance({
      transitVerbose: appSettings.sdk.transitVerbose,
      clientId: appSettings.sdk.clientId,
      secure: appSettings.usingSSL,
      typeHandlers: apiUtils.typeHandlers,
      ...baseUrl,
      ...assetCdnBaseUrl,
    });
  }, []);
  
  // Function to upload image to Sharetribe Flex
  const uploadImageToFlex = useCallback(async (file) => {
    try {
      const response = await sdk.images.upload({ image: file });
      return response.data.data.id.uuid; // Return the UUID
    } catch (err) {
      console.error('Image upload failed:', err);
      throw err;
    }
  }, [sdk]);

  // Handle classification completion
  const handleClassificationComplete = useCallback((result) => {
    setClassificationResult(result);
  }, []);

  // Handle suggestion acceptance - auto-populate form fields
  const handleSuggestionAccepted = useCallback((suggestion, formApi) => {
    if (suggestion && formApi) {
      // Auto-populate title and description
      if (suggestion.title) {
        formApi.change('title', suggestion.title);
      }
      if (suggestion.description) {
        formApi.change('description', suggestion.description);
      }
      if (suggestion.category) {
        // Category now aligned with form values in Sanity – use directly
        formApi.change('category', suggestion.category);
      }
      if (suggestion.price != null) {
        formApi.change('dailyPrice', String(suggestion.price));
      }
    }
  }, []);

  // Handle suggestion rejection
  const handleSuggestionRejected = useCallback((result) => {
    setClassificationResult(null);
  }, []);
  
  // Debug: Log the initial values received by the form (only once)
  // useEffect(() => {
  //   console.log('Form received initialValues:', initialValues);
  // }, []); // Empty dependency array to run only once

  // Memoize form initial values to prevent infinite re-renders
  const formInitialValues = useMemo(() => ({
    ...initialValues,
    availability: {
      monday: initialValues.availability?.monday ?? true,
      tuesday: initialValues.availability?.tuesday ?? true,
      wednesday: initialValues.availability?.wednesday ?? true,
      thursday: initialValues.availability?.thursday ?? true,
      friday: initialValues.availability?.friday ?? true,
      saturday: initialValues.availability?.saturday ?? true,
      sunday: initialValues.availability?.sunday ?? true,
    }
  }), [
    initialValues.title,
    initialValues.description,
    initialValues.category,
    initialValues.collectionDelivery,
    initialValues.postcode,
    initialValues.dailyPrice,
    initialValues.availability?.monday,
    initialValues.availability?.tuesday,
    initialValues.availability?.wednesday,
    initialValues.availability?.thursday,
    initialValues.availability?.friday,
    initialValues.availability?.saturday,
    initialValues.availability?.sunday
  ]);

  // Handle form submission
  const handleSubmit = useCallback((values) => {
    // Prepare data for API - pass images as array of objects with imageId/id
    const submitData = {
      title: values.title?.trim(),
      description: values.description?.trim(),
      images: values.images || [], // Pass images as-is, the duck will process them
      publicData: {
        listingType: 'list-your-tool',
        transactionProcessAlias: 'default-booking/release-1',
        unitType: 'day',
        categoryLevel1: values.category,
        categoryLevel2: null,
        categoryLevel3: null,
        Collection_or_Delivery: values.collectionDelivery
      },
      privateData: {},
      price: {
        amount: parseFloat(values.dailyPrice) * 100, // Convert to cents
        currency: 'GBP'
      },
      availability: values.availability,
      postcode: values.postcode, // Include postcode for location handling
      dailyPrice: values.dailyPrice // Include dailyPrice for price calculation
    };
    
    onSubmit(submitData);
  }, [onSubmit]);

  return (
    <div className={css.root}>
      <div className={css.header}>
        <button type="button" className={css.backButton} onClick={onCancel}>
          ← Back
        </button>
        <h1 className={css.title}>Create Your Listing</h1>
      </div>

      <Form
        initialValues={formInitialValues}
        onSubmit={handleSubmit}
        render={({ handleSubmit, values, errors, invalid, pristine, form }) => {
          
          return (
          <form className={css.form} onSubmit={handleSubmit}>
        {/* Photos Section */}
        <div className={css.section}>
          <h2 className={css.sectionTitle}>Photos</h2>
          <Field name="images" initialValue={[]}>
            {({ input }) => (
              <div className={css.photosContainer}>
                {(input.value || []).map((image, index) => (
                  <div key={index} className={css.photoItem}>
                    <img src={image.url || image} alt={`Upload ${index + 1}`} className={css.photo} />
                    {image.id && image.id.startsWith('temp-') && uploadingImages.has(image.id) && (
                      <div className={css.uploadingOverlay}>
                        <div className={css.uploadingSpinner}>⏳</div>
                        <span>Uploading...</span>
                      </div>
                    )}
                    {image.id && image.id.startsWith('temp-') && uploadErrors[image.id] && (
                      <div className={css.errorOverlay}>
                        <span className={css.errorText}>{uploadErrors[image.id]}</span>
                      </div>
                    )}
                    <button 
                      type="button" 
                      className={css.removePhoto}
                      onClick={() => {
                        const newImages = (input.value || []).filter((_, i) => i !== index);
                        input.onChange(newImages);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {(input.value || []).length < 2 && (
              <div className={css.addPhoto}>
                <input
                  type="file"
                  accept="image/*"
                  className={css.fileInput}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const tempId = `temp-${Date.now()}`;
                      
                      try {
                        // Add to uploading state
                        setUploadingImages(prev => new Set([...prev, tempId]));
                        setUploadErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors[tempId];
                          return newErrors;
                        });
                        
                        // Create a preview URL for immediate display
                        const imageUrl = URL.createObjectURL(file);
                        
                        // Upload to Sharetribe Flex
                        const imageId = await uploadImageToFlex(file);
                        
                        // Create the image object with both preview and real ID
                        const newImage = {
                          id: imageId,
                          imageId: imageId,
                          url: imageUrl, // Keep for preview
                          fileName: file.name
                        };
                        
                        // Add to existing images
                        const currentImages = input.value || [];
                        input.onChange([...currentImages, newImage]);
                        
                        // Set the last uploaded image for classification
                        setLastUploadedImage(file);
                        
                        // Remove from uploading state
                        setUploadingImages(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(tempId);
                          return newSet;
                        });
                        
                      } catch (error) {
                        console.error('Failed to upload image:', error);
                        
                        // Set error state
                        setUploadErrors(prev => ({
                          ...prev,
                          [tempId]: 'Failed to upload image. Please try again.'
                        }));
                        
                        // Remove from uploading state
                        setUploadingImages(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(tempId);
                          return newSet;
                        });
                      }
                    }
                    // Reset the input so the same file can be selected again
                    e.target.value = '';
                  }}
                />
                <div className={css.addPhotoContent}>
                  <div className={css.uploadIcon}>
                    {uploadingImages.size > 0 ? '⏳' : '↑'}
                  </div>
                  <span>
                    {uploadingImages.size > 0 ? 'Uploading...' : 'Add Photo'}
                  </span>
                </div>
              </div>
                )}
              </div>
            )}
          </Field>
        </div>

        {/* Image Classification Section */}
        {lastUploadedImage && (
          <div className={css.section}>
            <h2 className={css.sectionTitle}>AI Tool Recognition</h2>
            <ImageClassification
              imageFile={lastUploadedImage}
              onClassificationComplete={handleClassificationComplete}
              onSuggestionAccepted={(suggestion) => handleSuggestionAccepted(suggestion, form)}
              onSuggestionRejected={handleSuggestionRejected}
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Listing Details Section */}
        <div className={css.section}>
          <h2 className={css.sectionTitle}>Listing Details</h2>
          
          <div className={css.field}>
            <label className={css.label}>
              Tool Name<span className={css.required}>*</span>
            </label>
            <Field name="title" validate={value => !value ? 'Tool name is required' : undefined}>
              {({ input, meta }) => (
                <>
                  <input
                    {...input}
                    type="text"
                    placeholder="Enter tool name"
                    className={css.input}
                  />
                  {meta.error && meta.touched && <div className={css.error}>{meta.error}</div>}
                </>
              )}
            </Field>
          </div>

          <div className={css.field}>
            <label className={css.label}>
              Category<span className={css.required}>*</span>
            </label>
            <Field name="category" validate={value => !value ? 'Category is required' : undefined}>
              {({ input, meta }) => (
                <>
                  <select {...input} className={css.select}>
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
                  </select>
                  {meta.error && meta.touched && <div className={css.error}>{meta.error}</div>}
                </>
              )}
            </Field>
          </div>

          <div className={css.field}>
            <label className={css.label}>Listing Description</label>
            <Field name="description">
              {({ input }) => (
                <textarea
                  {...input}
                  className={css.textarea}
                  placeholder="Describe your tool and any important details"
                  rows={4}
                />
              )}
            </Field>
          </div>

          <div className={css.field}>
            <label className={css.label}>Collection or Delivery</label>
            <Field name="collectionDelivery">
              {({ input }) => (
                <select {...input} className={css.select}>
                  <option value="Collect_from_My_Home">Collect from My Home</option>
                  <option value="I_can_deliver_locally">I can deliver locally</option>
                </select>
              )}
            </Field>
          </div>

        </div>

        {/* Location Section */}
        <div className={css.section}>
          <h2 className={css.sectionTitle}>Location</h2>
          <div className={css.field}>
            <label className={css.label}>Postcode</label>
            <Field name="postcode">
              {({ input }) => (
                <>
                  <input
                    {...input}
                    type="text"
                    placeholder="Enter postcode"
                    className={css.input}
                    readOnly
                    disabled
                  />
                  <div className={css.helpText}>Location from your profile</div>
                </>
              )}
            </Field>
          </div>
        </div>

        {/* Pricing Section */}
        <div className={css.section}>
          <h2 className={css.sectionTitle}>Pricing</h2>
          <div className={css.field}>
            <label className={css.label}>
              Daily Price (£)<span className={css.required}>*</span>
            </label>
            <Field name="dailyPrice" validate={value => !value || parseFloat(value) <= 0 ? 'Valid daily price is required' : undefined}>
              {({ input, meta }) => (
                <>
                  <input
                    {...input}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={css.input}
                  />
                  <div className={css.helpText}>
                    This is a recommended daily price. Please review and adjust if needed.
                  </div>
                  {meta.error && meta.touched && <div className={css.error}>{meta.error}</div>}
                </>
              )}
            </Field>
          </div>
        </div>

        {/* Availability Section */}
        <div className={css.section}>
          <h2 className={css.sectionTitle}>Availability</h2>
          <p className={css.helpText}>
            We have selected all days as default. Please amend as needed.
          </p>
          <div className={css.availabilityGrid}>
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
              <Field key={day} name={`availability.${day}`} type="checkbox">
                {({ input }) => (
                  <label className={css.checkboxLabel}>
                    <input
                      {...input}
                      type="checkbox"
                      className={css.checkbox}
                    />
                    <span className={css.checkboxText}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </span>
                  </label>
                )}
              </Field>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className={css.submitSection}>
          <Button
            type="submit"
            className={css.submitButton}
            inProgress={isSubmitting}
            disabled={isSubmitting}
          >
            Publish Listing
          </Button>
        </div>
          </form>
          );
        }}
      />
    </div>
  );
};

export default CustomListingForm;
