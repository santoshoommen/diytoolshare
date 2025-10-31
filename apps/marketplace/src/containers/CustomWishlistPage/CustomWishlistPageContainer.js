import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';

import {
  requestCreateListingDraft,
  requestPublishListingDraft,
} from '../EditListingPage/EditListingPage.duck';

import CustomWishlistPage from './CustomWishlistPage';

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const postcode = currentUser?.attributes?.profile?.publicData?.postcode || '';
  return {
    initialValues: {
      postcode,
    },
    currentUser,
  };
};

const mapDispatchToProps = dispatch => ({
  onCreateListingDraft: (values, config) => dispatch(requestCreateListingDraft(values, config)),
  onPublishListingDraft: listingId => dispatch(requestPublishListingDraft(listingId)),
});

const CustomWishlistPageContainer = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(CustomWishlistPage);

export default CustomWishlistPageContainer;


