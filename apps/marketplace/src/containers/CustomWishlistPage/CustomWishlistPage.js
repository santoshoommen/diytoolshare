import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useConfiguration } from '../../context/configurationContext';
import { geocodePostcode } from '../../util/postcodeGeocoding';
import CustomWishlistForm from '../../components/CustomWishlistForm';

const CustomWishlistPage = ({ initialValues, onCreateListingDraft, onPublishListingDraft }) => {
  const history = useHistory();
  const config = useConfiguration();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async values => {
    setSubmitting(true);
    try {
      // Geocode postcode to get coordinates for map search
      let geolocation = null;
      if (values.postcode) {
        geolocation = await geocodePostcode(values.postcode);
        if (geolocation) {
          console.log('Geocoded postcode:', values.postcode, 'to coordinates:', geolocation);
          console.log('Geolocation type:', geolocation.constructor.name);
          console.log('Geolocation lat:', geolocation.lat, 'lng:', geolocation.lng);
        } else {
          console.warn('Failed to geocode postcode:', values.postcode);
        }
      }

      const listingData = {
        title: values.title?.trim(),
        description: values.description?.trim(),
        images: [],
        geolocation: geolocation, // Add geolocation for map search
        publicData: {
          listingType: 'request-a-tool',
          transactionProcessAlias: 'default-booking/release-1',
          unitType: 'day',
          categoryLevel1: values.category,
          requestStart: values.startDate,
          requestEnd: values.endDate,
          location: values.postcode ? { address: values.postcode, building: values.postcode } : null,
        },
        privateData: {},
      };

      const draftResult = await onCreateListingDraft(listingData, config);
      const draftId = draftResult?.data?.data?.id;
      if (draftId) {
        try {
          await onPublishListingDraft(draftId);
        } catch (e) {
          // ignore publish error; navigate to listings either way
        }
        history.push('/listings');
      }
    } finally {
      setSubmitting(false);
    }
  }, [onCreateListingDraft, onPublishListingDraft, config, history]);

  return <CustomWishlistForm onSubmit={handleSubmit} initialValues={initialValues} isSubmitting={submitting} />;
};

export default CustomWishlistPage;


