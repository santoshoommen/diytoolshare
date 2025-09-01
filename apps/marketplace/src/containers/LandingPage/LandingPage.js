import React from 'react';
import loadable from '@loadable/component';
import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

import ModernLandingPage from './ModernLandingPage';
import FallbackPage from './FallbackPage';
import { ASSET_NAME } from './LandingPage.duck';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

export const LandingPageComponent = props => {
  const { pageAssetsData, inProgress, error } = props;

  // If we have console content, use it with our ModernLandingPage
  if (pageAssetsData?.[camelize(ASSET_NAME)]?.data) {
    const consoleContent = pageAssetsData[camelize(ASSET_NAME)].data;
    return <ModernLandingPage consoleContent={consoleContent} />;
  }

  // If there's an error loading console content, show fallback
  if (error) {
    return <FallbackPage error={error} />;
  }

  // If still loading, show loading state
  if (inProgress) {
    return <ModernLandingPage consoleContent={null} />;
  }

  // Default to our ModernLandingPage without console content
  return <ModernLandingPage consoleContent={null} />;
};

LandingPageComponent.propTypes = {
  pageAssetsData: object,
  inProgress: bool,
  error: propTypes.error,
};

const mapStateToProps = state => {
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  return { pageAssetsData, inProgress, error };
};

const LandingPage = compose(connect(mapStateToProps))(LandingPageComponent);

export default LandingPage;
