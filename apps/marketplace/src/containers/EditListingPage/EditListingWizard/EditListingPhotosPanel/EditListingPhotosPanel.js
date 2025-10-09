import React from 'react';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../../../util/types';

// Import shared components
import { H3, ListingLink } from '../../../../components';

// Import modules from this directory
import EditListingPhotosForm from './EditListingPhotosForm';
import EditListingPhotosFormWithDraftCreation from './EditListingPhotosFormWithDraftCreation';
import css from './EditListingPhotosPanel.module.css';

const getInitialValues = (params, listing, isFirstTab) => {
  const { images = [] } = params;
  const baseValues = { images };
  
  // If this is the first tab, include title, description, and complete publicData for draft creation
  if (isFirstTab) {
    const { title, description, publicData } = listing?.attributes || {};
    const initialValues = {
      ...baseValues,
      title: title || '',
      description: description || '',
      publicData: publicData || {
        listingType: 'list-your-tool',
        transactionProcessAlias: 'default-booking/release-1',
        unitType: 'day',
        categoryLevel1: 'General_DIY__Home_Improvement',
        categoryLevel2: null,
        categoryLevel3: null,
        Collection_or_Delivery: 'Collect_from_My_Home'
      },
      privateData: {}
    };
    
    return initialValues;
  }
  
  return baseValues;
};

/**
 * The EditListingPhotosPanel component.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {Object} props.errors - The errors object
 * @param {boolean} props.disabled - Whether the form is disabled
 * @param {boolean} props.ready - Whether the form is ready
 * @param {Array} props.images - The images array
 * @param {propTypes.ownListing} props.listing - The listing object
 * @param {Function} props.onImageUpload - The image upload function
 * @param {string} props.submitButtonText - The submit button text
 * @param {boolean} props.panelUpdated - Whether the panel is updated
 * @param {boolean} props.updateInProgress - Whether the update is in progress
 * @param {Function} props.onSubmit - The submit function
 * @param {Function} props.onRemoveImage - The remove image function
 * @param {Object} props.listingImageConfig - The listing image config
 * @returns {JSX.Element}
 */
const EditListingPhotosPanel = props => {
  const {
    className,
    rootClassName,
    errors,
    disabled,
    ready,
    listing,
    onImageUpload,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    onSubmit,
    onRemoveImage,
    listingImageConfig,
    listingTypes,
    isFirstTab,
  } = props;

  const rootClass = rootClassName || css.root;
  const classes = classNames(rootClass, className);
  const isPublished = listing?.id && listing?.attributes?.state !== LISTING_STATE_DRAFT;

  return (
    <div className={classes}>
      <H3 as="h1">
        {isPublished ? (
          <FormattedMessage
            id="EditListingPhotosPanel.title"
            values={{ listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> }}
          />
        ) : (
          <FormattedMessage
            id="EditListingPhotosPanel.createListingTitle"
            values={{ lineBreak: <br /> }}
          />
        )}
      </H3>
      {isFirstTab ? (
        <EditListingPhotosFormWithDraftCreation
          className={css.form}
          disabled={disabled}
          ready={ready}
          fetchErrors={errors}
          initialValues={getInitialValues(props, listing, isFirstTab)}
          onImageUpload={onImageUpload}
          onSubmit={values => {
            const { addImage, ...updateValues } = values;
            onSubmit(updateValues);
          }}
          onRemoveImage={onRemoveImage}
          saveActionMsg={submitButtonText}
          updated={panelUpdated}
          updateInProgress={updateInProgress}
          listingImageConfig={listingImageConfig}
          listingTypes={listingTypes}
        />
      ) : (
        <EditListingPhotosForm
          className={css.form}
          disabled={disabled}
          ready={ready}
          fetchErrors={errors}
          initialValues={getInitialValues(props, listing, isFirstTab)}
          onImageUpload={onImageUpload}
          onSubmit={values => {
            const { addImage, ...updateValues } = values;
            onSubmit(updateValues);
          }}
          onRemoveImage={onRemoveImage}
          saveActionMsg={submitButtonText}
          updated={panelUpdated}
          updateInProgress={updateInProgress}
          listingImageConfig={listingImageConfig}
        />
      )}
    </div>
  );
};

export default EditListingPhotosPanel;
