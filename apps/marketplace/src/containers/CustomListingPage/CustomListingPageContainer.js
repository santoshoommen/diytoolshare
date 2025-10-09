import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';

import { 
  requestCreateListingDraft,
  requestUpdateListing,
  requestImageUpload,
  requestShowListing
} from '../EditListingPage/EditListingPage.duck';

import CustomListingPage from './CustomListingPage';

const mapStateToProps = (state, ownProps) => {
  const { 
    createListingDraftInProgress,
    createListingDraftError,
    updateListingInProgress,
    updateListingError,
    uploadImageInProgress,
    uploadImageError,
    showListingsInProgress,
    showListingsError,
    listing
  } = state.EditListingPage;

  return {
    listing,
    errors: {
      createListingDraftError,
      updateListingError,
      uploadImageError,
      showListingsError
    },
    fetchInProgress: createListingDraftInProgress || updateListingInProgress || showListingsInProgress,
    uploadInProgress: uploadImageInProgress
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onCreateListingDraft: (values, config) => dispatch(requestCreateListingDraft(values, config)),
    onUpdateListing: (tab, values) => dispatch(requestUpdateListing(tab, values)),
    onImageUpload: (imageData, imageConfig) => dispatch(requestImageUpload(imageData, imageConfig)),
    onShowListings: () => dispatch(requestShowListing())
  };
};

const CustomListingPageContainer = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(CustomListingPage);

export default CustomListingPageContainer;
