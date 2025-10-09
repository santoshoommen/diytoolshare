import React, { useState, useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { useConfiguration } from '../../context/configurationContext';
import { createSlug } from '../../util/urlHelpers';
import CustomListingForm from '../../components/CustomListingForm';
import css from './CustomListingPage.module.css';

const CustomListingPage = ({ 
  onCreateListingDraft, 
  onUpdateListing, 
  onImageUpload,
  listing,
  errors = {},
  fetchInProgress = false 
}) => {
  const history = useHistory();
  const intl = useIntl();
  const config = useConfiguration();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = useCallback(async (formData) => {
    setIsSubmitting(true);
    
    // Debug: Log the form data to see what's being submitted
    console.log('Form data received:', formData);
    console.log('Postcode value:', formData.postcode);
    console.log('Has postcode:', !!formData.postcode);
    
    try {
      // First, upload any images that have files
      let uploadedImages = [];
      if (formData.images && formData.images.length > 0) {
        for (const image of formData.images) {
          if (image.file) {
            // Upload the image file
            const uploadResult = await onImageUpload({
              id: image.id,
              file: image.file
            }, config.layout.listingImage);
            if (uploadResult?.data?.data?.id) {
              const imageId = uploadResult.data.data.id.uuid || uploadResult.data.data.id;
              uploadedImages.push(imageId);
            }
          } else if (image.id && !image.id.startsWith('temp-')) {
            // This is already an uploaded image with a real UUID
            uploadedImages.push(image.id);
          }
        }
      }

      // Prepare the data for the API
      const listingData = {
        title: formData.title,
        description: formData.description,
        images: uploadedImages, // Use the uploaded image UUIDs
        publicData: {
          ...formData.publicData,
          // Location data
          location: formData.postcode ? { address: formData.postcode } : null,
        },
        privateData: formData.privateData,
        price: formData.price,
        // Location coordinates (required for location tab completion)
        // Only include geolocation if we have a postcode
        ...(formData.postcode && {
          geolocation: {
            lat: 51.5074, // Default to London coordinates for now
            lng: -0.1278
          }
        }),
        // Availability plan (required for availability tab completion)
        availabilityPlan: {
          type: 'availability-plan/time',
          timezone: 'Europe/London', // Default timezone
          entries: [
            // Create availability entries for each day that's selected
            ...Object.entries(formData.availability)
              .filter(([day, isAvailable]) => isAvailable)
              .map(([day, isAvailable]) => ({
                dayOfWeek: day.substring(0, 3), // Convert 'monday' to 'mon', etc.
                startTime: '09:00',
                endTime: '17:00',
                seats: 1
              }))
          ]
        }
      };

      // Debug: Log the final listing data
      console.log('Final listing data:', listingData);
      console.log('Geolocation included:', !!listingData.geolocation);

      // If editing existing listing
      if (listing?.id) {
        await onUpdateListing('photos', { ...listingData, id: listing.id });
      } else {
        // Create new listing
        const result = await onCreateListingDraft(listingData, config);
        
        // Debug: Log the result structure
        console.log('Create listing result:', result);
        console.log('Listing ID:', result?.data?.data?.id);
        
        // Redirect to the listings management page after successful creation
        if (result?.data?.data?.id) {
          console.log('Listing created successfully, redirecting to listings page');
          history.push('/listings');
        }
      }
    } catch (error) {
      console.error('Error submitting listing:', error);
      // Error handling is done by the parent component
    } finally {
      setIsSubmitting(false);
    }
  }, [listing, onCreateListingDraft, onUpdateListing, onImageUpload, config, history]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (listing?.id) {
      history.push(`/l/${listing.id}`);
    } else {
      history.push('/');
    }
  }, [history, listing]);

  // Handle image upload
  const handleImageUpload = useCallback(async (file) => {
    try {
      const result = await onImageUpload({ id: `${file.name}_${Date.now()}`, file });
      return result;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }, [onImageUpload]);

  // Prepare initial values (memoized to prevent infinite re-renders)
  const initialValues = useMemo(() => {
    return listing ? {
      title: listing.attributes?.title || '',
      description: listing.attributes?.description || '',
      category: listing.attributes?.publicData?.categoryLevel1 || '',
      collectionDelivery: listing.attributes?.publicData?.Collection_or_Delivery || 'Collect_from_My_Home',
      postcode: listing.attributes?.publicData?.location?.address || '',
      dailyPrice: listing.attributes?.price ? (listing.attributes.price.amount / 100).toString() : '',
      images: listing.images || [],
      availability: listing.attributes?.publicData?.availability || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      }
    } : {
      // Default values for new listings
      title: '',
      description: '',
      category: '',
      collectionDelivery: 'Collect_from_My_Home',
      postcode: '',
      dailyPrice: '',
      images: [],
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      }
    };
  }, [listing]);

  // Debug: Log the initial values being passed to the form
  console.log('Initial values being passed to form:', initialValues);
  console.log('Postcode in initial values:', initialValues.postcode);

  return (
    <div className={css.root}>
      <CustomListingForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialValues={initialValues}
        isSubmitting={isSubmitting || fetchInProgress}
        onImageUpload={handleImageUpload}
      />
      
      {/* Error Display */}
      {errors.createListingDraftError && (
        <div className={css.errorMessage}>
          <FormattedMessage id="CustomListingPage.createListingError" />
        </div>
      )}
      
      {errors.updateListingError && (
        <div className={css.errorMessage}>
          <FormattedMessage id="CustomListingPage.updateListingError" />
        </div>
      )}
    </div>
  );
};

export default CustomListingPage;
