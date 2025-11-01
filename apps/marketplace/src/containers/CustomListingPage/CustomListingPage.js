import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { useConfiguration } from '../../context/configurationContext';
import { createSlug } from '../../util/urlHelpers';
import { geocodePostcode } from '../../util/postcodeGeocoding';
import { getDefaultTimeZoneOnBrowser } from '../../util/dates';
import CustomListingForm from '../../components/CustomListingForm';
import css from './CustomListingPage.module.css';

const CustomListingPage = ({ 
  onCreateListingDraft, 
  onUpdateListing, 
  onImageUpload,
  onPublishListingDraft,
  listing,
  currentUser,
  errors = {},
  fetchInProgress = false 
}) => {
  const history = useHistory();
  const intl = useIntl();
  const config = useConfiguration();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract postcode from current user's profile
  const userPostcode = currentUser?.attributes?.profile?.publicData?.postcode || '';
  console.log('User postcode from profile:', userPostcode);

  // Handle form submission
  const handleSubmit = useCallback(async (formData) => {
    setIsSubmitting(true);
    
    // Debug: Log the form data to see what's being submitted
    console.log('Form data received:', formData);
    console.log('Postcode value:', formData.postcode);
    console.log('Has postcode:', !!formData.postcode);
    console.log('Availability data:', formData.availability);
    console.log('Daily price from form:', formData.dailyPrice);
    console.log('Price object from form:', formData.price);
    
    try {
      // Use images from form data - they should already be uploaded and have proper IDs
      console.log('Form images:', formData.images);
      console.log('Images being sent to API:', formData.images);

      // Geocode postcode to get coordinates for map search
      let geolocation = null;
      if (formData.postcode) {
        geolocation = await geocodePostcode(formData.postcode);
        if (geolocation) {
          console.log('Geocoded postcode:', formData.postcode, 'to coordinates:', geolocation);
          console.log('Geolocation type:', geolocation.constructor.name);
          console.log('Geolocation lat:', geolocation.lat, 'lng:', geolocation.lng);
        } else {
          console.warn('Failed to geocode postcode:', formData.postcode);
        }
      }

      // Convert availability boolean object to availabilityPlan structure
      // This is required for booking listings to show availability forms on the listing page
      const availability = formData.availability || {};
      const timezone = typeof window !== 'undefined' ? getDefaultTimeZoneOnBrowser() : 'Europe/London';
      
      // Map day names from boolean object to availabilityPlan entries
      const dayMap = {
        monday: 'mon',
        tuesday: 'tue',
        wednesday: 'wed',
        thursday: 'thu',
        friday: 'fri',
        saturday: 'sat',
        sunday: 'sun'
      };
      
      const availabilityEntries = Object.keys(dayMap).reduce((entries, dayName) => {
        if (availability[dayName] !== false) {
          entries.push({
            dayOfWeek: dayMap[dayName],
            startTime: '00:00',
            endTime: '00:00', // '00:00' means the start of the next day (end of current day) - correct format for full-day availability
            seats: 1
          });
        }
        return entries;
      }, []);

      // Prepare the data for the API - only include allowed fields
      const listingData = {
        title: formData.title,
        description: formData.description,
        images: formData.images, // This will be processed by imageIds function in the duck
        geolocation: geolocation, // Add geolocation for map search
        // Add availabilityPlan for booking listings - this is required for booking forms to show
        availabilityPlan: {
          type: 'availability-plan/time',
          timezone: timezone,
          entries: availabilityEntries.length > 0 ? availabilityEntries : [
            // Default: available all week if no specific availability is set
            // Note: endTime '00:00' means the start of the next day (end of current day) - correct format for full-day availability
            { dayOfWeek: 'mon', startTime: '00:00', endTime: '00:00', seats: 1 },
            { dayOfWeek: 'tue', startTime: '00:00', endTime: '00:00', seats: 1 },
            { dayOfWeek: 'wed', startTime: '00:00', endTime: '00:00', seats: 1 },
            { dayOfWeek: 'thu', startTime: '00:00', endTime: '00:00', seats: 1 },
            { dayOfWeek: 'fri', startTime: '00:00', endTime: '00:00', seats: 1 },
            { dayOfWeek: 'sat', startTime: '00:00', endTime: '00:00', seats: 1 },
            { dayOfWeek: 'sun', startTime: '00:00', endTime: '00:00', seats: 1 },
          ]
        },
        publicData: {
          listingType: 'list-your-tool',
          transactionProcessAlias: 'default-booking/release-1',
          unitType: 'day',
          categoryLevel1: formData.publicData?.categoryLevel1 || formData.category,
          categoryLevel2: null,
          categoryLevel3: null,
          Collection_or_Delivery: formData.publicData?.Collection_or_Delivery || formData.collectionDelivery,
          multiday_pricing_discount: formData.publicData?.multiday_pricing_discount,
          // Location data - match the structure from default form
          location: formData.postcode ? { 
            address: formData.postcode,
            building: formData.postcode // Use postcode as building for now
          } : null,
          // Price variants to match default form structure
          priceVariationsEnabled: true,
          priceVariants: [
            {
              name: "Standard for < 5days",
              priceInSubunits: Math.round(parseFloat(formData.dailyPrice || formData.price?.amount || 0) * 100)
            },
            {
              name: "For > 5days", 
              priceInSubunits: Math.round(parseFloat(formData.dailyPrice || formData.price?.amount || 0) * 100 * 0.7) // 30% discount for longer rentals
            }
          ]
        },
        privateData: {},
        // Add price data
        price: {
          amount: Math.round(parseFloat(formData.dailyPrice || formData.price?.amount || 0) * 100), // Convert to cents
          currency: 'GBP'
        }
      };

      // Debug: Log the final listing data
      console.log('Final listing data:', listingData);
      console.log('Images being sent:', listingData.images);
      console.log('Private data being sent:', listingData.privateData);
      console.log('Price being sent:', listingData.price);
      console.log('Public data being sent:', listingData.publicData);
      console.log('Location data:', listingData.publicData.location);
      console.log('Price variants:', listingData.publicData.priceVariants);
      console.log('Price variations enabled:', listingData.publicData.priceVariationsEnabled);
      console.log('Availability plan being sent:', listingData.availabilityPlan);

      // If editing existing listing
      if (listing?.id) {
        await onUpdateListing('photos', { ...listingData, id: listing.id });
      } else {
        // Create new listing draft first
        try {
          const draftResult = await onCreateListingDraft(listingData, config);
          
          // Debug: Log the result structure
          console.log('Create listing draft result:', draftResult);
          console.log('Draft Listing ID:', draftResult?.data?.data?.id);
          
          // Check if the result contains an error (Redux actions might resolve with error in state)
          if (!draftResult || !draftResult?.data?.data?.id) {
            throw new Error('Failed to create listing draft - no ID returned');
          }
          
          // If draft was created successfully, publish it immediately
          if (draftResult?.data?.data?.id) {
            console.log('Draft created successfully, now publishing...');
            
            try {
              const publishResult = await onPublishListingDraft(draftResult.data.data.id);
              console.log('Publish result:', publishResult);
              
              // Redirect to the listings management page after successful publication
              console.log('Listing published successfully, redirecting to listings page');
              history.push('/listings');
            } catch (publishError) {
              console.error('Error publishing listing:', publishError);
              // Even if publishing fails, redirect to listings page so user can manually publish
              console.log('Publishing failed, but draft exists. Redirecting to listings page.');
              history.push('/listings');
            }
          }
        } catch (createError) {
          // Re-throw to be caught by outer catch block
          console.error('Error in createListingDraft:', createError);
          throw createError;
        }
      }
    } catch (error) {
      console.error('Error submitting listing:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      // Log API validation errors if available
      if (error.response && error.response.data && error.response.data.errors) {
        console.error('API Validation Errors:', JSON.stringify(error.response.data.errors, null, 2));
      }
      
      // Log full error object for debugging
      if (error.apiErrors) {
        console.error('API Errors in error object:', JSON.stringify(error.apiErrors, null, 2));
      }
      
      // Error handling is done by the parent component via Redux
      // The error will be stored in errors.createListingDraftError
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
      // Default values for new listings - use user's postcode if available
      title: '',
      description: '',
      category: '',
      collectionDelivery: 'Collect_from_My_Home',
      postcode: userPostcode, // Use user's postcode from profile
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
  }, [listing, userPostcode]);

  // Debug: Log the initial values being passed to the form (only when listing changes)
  useEffect(() => {
    if (listing) {
      console.log('Initial values for existing listing:', initialValues);
    }
  }, [listing]);

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
          {errors.createListingDraftError.message && (
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#d32f2f' }}>
              {errors.createListingDraftError.message}
            </div>
          )}
          {errors.createListingDraftError.apiErrors && errors.createListingDraftError.apiErrors.length > 0 && (
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#d32f2f' }}>
              {errors.createListingDraftError.apiErrors.map((err, idx) => (
                <div key={idx}>
                  {err.title || err.detail || JSON.stringify(err)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {errors.updateListingError && (
        <div className={css.errorMessage}>
          <FormattedMessage id="CustomListingPage.updateListingError" />
          {errors.updateListingError.message && (
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#d32f2f' }}>
              {errors.updateListingError.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomListingPage;
