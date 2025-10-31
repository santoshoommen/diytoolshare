import React, { Component, useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { parse } from '../../../util/urlHelpers';

import { useConfiguration } from '../../../context/configurationContext';
import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { createResourceLocatorString } from '../../../util/routes';
import { createSlug } from '../../../util/urlHelpers';
import { propTypes } from '../../../util/types';
import { obfuscatedCoordinates, getMapProviderApiAccess } from '../../../util/maps';
import { useUKFocusedMap } from './useUKFocusedMap';
import { getSearchPageResourceLocatorStringParams } from '../SearchPage.shared';
import { validFilterParams } from '../SearchPage.shared';
import { isOriginInUse } from '../../../util/search';
import { types as sdkTypes } from '../../../util/sdkLoader';

import { hasParentWithClassName } from './SearchMap.helpers.js';
import * as searchMapMapbox from './SearchMapWithMapbox';
import * as searchMapGoogleMaps from './SearchMapWithGoogleMaps';
import ReusableMapContainer from './ReusableMapContainer';
import css from './SearchMap.module.css';

const REUSABLE_MAP_HIDDEN_HANDLE = 'reusableMapHidden';

const getSearchMapVariant = mapProvider => {
  const isGoogleMapsInUse = mapProvider === 'googleMaps';
  return isGoogleMapsInUse ? searchMapGoogleMaps : searchMapMapbox;
};
const getSearchMapVariantHandles = mapProvider => {
  const searchMapVariant = getSearchMapVariant(mapProvider);
  return {
    labelHandle: searchMapVariant.LABEL_HANDLE,
    infoCardHandle: searchMapVariant.INFO_CARD_HANDLE,
  };
};
const getFitMapToBounds = mapProvider => {
  const searchMapVariant = getSearchMapVariant(mapProvider);
  return searchMapVariant.fitMapToBounds;
};
const getSearchMapVariantComponent = mapProvider => {
  const searchMapVariant = getSearchMapVariant(mapProvider);
  return searchMapVariant.default;
};

const withCoordinatesObfuscated = (listings, offset) => {
  return listings.map(listing => {
    const { id, attributes, ...rest } = listing;
    const origGeolocation = attributes.geolocation;
    const cacheKey = id ? `${id.uuid}_${origGeolocation.lat}_${origGeolocation.lng}` : null;
    const geolocation = obfuscatedCoordinates(origGeolocation, offset, cacheKey);
    return {
      id,
      ...rest,
      attributes: {
        ...attributes,
        geolocation,
      },
    };
  });
};

export class SearchMapComponent extends Component {
  constructor(props) {
    super(props);

    this.listings = [];
    this.mapRef = null;
    this.userHasInteracted = false; // Track if user has manually interacted with map
    this.lastFittedBounds = null; // Track last bounds we fitted to
    this.isProgrammaticFit = false; // Track when we're programmatically fitting to ignore those events

    let mapReattachmentCount = 0;

    if (typeof window !== 'undefined') {
      if (window.mapReattachmentCount) {
        mapReattachmentCount = window.mapReattachmentCount;
      } else {
        window.mapReattachmentCount = 0;
      }
    }

    this.state = { infoCardOpen: null, mapReattachmentCount };

    this.createURLToListing = this.createURLToListing.bind(this);
    this.onListingInfoCardClicked = this.onListingInfoCardClicked.bind(this);
    this.onListingClicked = this.onListingClicked.bind(this);
    this.onMapClicked = this.onMapClicked.bind(this);
    this.onMapLoadHandler = this.onMapLoadHandler.bind(this);
    this.handleMapMoveEnd = this.handleMapMoveEnd.bind(this);
  }

  handleMapMoveEnd(viewportBoundsChanged, data) {
    // If user manually changed the viewport (not a programmatic fit), mark as interacted
    if (viewportBoundsChanged && !this.isProgrammaticFit) {
      this.userHasInteracted = true;
    }
    // Reset the flag after handling the event
    this.isProgrammaticFit = false;
    // Forward to parent handler if it exists
    if (this.props.onMapMoveEnd) {
      this.props.onMapMoveEnd(viewportBoundsChanged, data);
    }
  }

  componentDidUpdate(prevProps) {
    // Only refit if:
    // 1. Map is loaded
    // 2. Bounds prop actually changed (reference inequality)
    // 3. New bounds exist
    // 4. User hasn't manually interacted with the map
    // 5. We haven't already fitted to these exact bounds
    const boundsChanged = prevProps.bounds !== this.props.bounds;
    const shouldRefit = 
      this.mapRef && 
      boundsChanged && 
      this.props.bounds && 
      !this.userHasInteracted &&
      this.lastFittedBounds !== this.props.bounds;

    if (shouldRefit) {
      // Small delay to ensure map is ready for bounds update
      setTimeout(() => {
        if (this.mapRef && !this.userHasInteracted) {
          this.isProgrammaticFit = true; // Mark that we're programmatically fitting
          const fitMapToBounds = getFitMapToBounds(this.props.config.maps.mapProvider);
          fitMapToBounds(this.mapRef, this.props.bounds, { padding: 0, isAutocompleteSearch: true });
          this.lastFittedBounds = this.props.bounds;
        }
      }, 100);
    }
  }

  componentWillUnmount() {
    this.listings = [];
  }

  createURLToListing(listing) {
    const routes = this.props.routeConfiguration;

    const id = listing.id.uuid;
    const slug = createSlug(listing.attributes.title);
    const pathParams = { id, slug };

    return createResourceLocatorString('ListingPage', routes, pathParams, {});
  }

  onListingClicked(listings) {
    this.setState({ infoCardOpen: listings });
  }

  onListingInfoCardClicked(listing) {
    if (this.props.onCloseAsModal) {
      this.props.onCloseAsModal();
    }

    // To avoid full page refresh we need to use internal router
    const history = this.props.history;
    history.push(this.createURLToListing(listing));
  }

  onMapClicked(e) {
    // Close open listing popup / infobox, unless the click is attached to a price label
    const variantHandles = getSearchMapVariantHandles(this.props.config.maps.mapProvider);
    const labelClicked = hasParentWithClassName(e.nativeEvent.target, variantHandles.labelHandle);
    const infoCardClicked = hasParentWithClassName(
      e.nativeEvent.target,
      variantHandles.infoCardHandle
    );
    if (this.state.infoCardOpen != null && !labelClicked && !infoCardClicked) {
      this.setState({ infoCardOpen: null });
    }
  }

  onMapLoadHandler(map) {
    this.mapRef = map;

    if (this.mapRef && this.state.mapReattachmentCount === 0) {
      // map is ready, let's fit search area's bounds to map's viewport
      this.isProgrammaticFit = true; // Mark that we're programmatically fitting on initial load
      const fitMapToBounds = getFitMapToBounds(this.props.config.maps.mapProvider);
      fitMapToBounds(this.mapRef, this.props.bounds, { padding: 0, isAutocompleteSearch: true });
      this.lastFittedBounds = this.props.bounds;
    }
  }

  render() {
    const {
      id = 'searchMap',
      className,
      rootClassName,
      reusableContainerClassName,
      bounds,
      center = null,
      location,
      listings: originalListings,
      onMapMoveEnd,
      zoom = 11,
      config,
      activeListingId,
      messages,
    } = this.props;
    const classes = classNames(rootClassName || css.root, className);

    const listingsArray = originalListings || [];
    const listingsWithLocation = listingsArray.filter(l => {
      const hasGeolocation = !!l.attributes.geolocation;
      if (!hasGeolocation) {
        console.warn('Listing missing geolocation (will not appear on map):', l.id?.uuid, l.attributes?.title);
      }
      return hasGeolocation;
    });
    const listings = config.maps.fuzzy.enabled
      ? withCoordinatesObfuscated(listingsWithLocation, config.maps.fuzzy.offset)
      : listingsWithLocation;
    const infoCardOpen = this.state.infoCardOpen;

    const forceUpdateHandler = () => {
      // Update global reattachement count
      window.mapReattachmentCount += 1;
      // Initiate rerendering
      this.setState({ mapReattachmentCount: window.mapReattachmentCount });
    };
    const mapProvider = config.maps.mapProvider;
    const hasApiAccessForMapProvider = !!getMapProviderApiAccess(config.maps);
    const SearchMapVariantComponent = getSearchMapVariantComponent(mapProvider);
    const isMapProviderAvailable =
      hasApiAccessForMapProvider && getSearchMapVariant(mapProvider).isMapsLibLoaded();

    return isMapProviderAvailable ? (
      <ReusableMapContainer
        className={reusableContainerClassName}
        reusableMapHiddenHandle={REUSABLE_MAP_HIDDEN_HANDLE}
        onReattach={forceUpdateHandler}
        messages={messages}
        config={config}
      >
        <SearchMapVariantComponent
          id={id}
          className={classes}
          bounds={bounds}
          center={center}
          location={location}
          infoCardOpen={infoCardOpen}
          listings={listings}
          activeListingId={activeListingId}
          mapComponentRefreshToken={this.state.mapReattachmentCount}
          createURLToListing={this.createURLToListing}
          onClick={this.onMapClicked}
          onListingClicked={this.onListingClicked}
          onListingInfoCardClicked={this.onListingInfoCardClicked}
          onMapLoad={this.onMapLoadHandler}
          onMapMoveEnd={this.handleMapMoveEnd}
          reusableMapHiddenHandle={REUSABLE_MAP_HIDDEN_HANDLE}
          zoom={zoom}
          config={config}
          userPostcodeCenter={this.props.userPostcodeCenter}
        />
      </ReusableMapContainer>
    ) : (
      <div className={classNames(classes, reusableContainerClassName || css.defaultMapLayout)} />
    );
  }
}

/**
 * SearchMap component
 * @component
 * @param {Object} props
 * @param {string} [props.id] - The ID
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {string} [props.reusableContainerClassName] - Custom class that overrides the default class for the reusable container
 * @param {propTypes.latlngBounds} props.bounds - The bounds
 * @param {propTypes.latlng} props.center - The center
 * @param {Object} props.location - The location
 * @param {string} props.location.search - The search query params
 * @param {propTypes.uuid} props.activeListingId - The active listing ID
 * @param {Array<propTypes.listing>} props.listings - The listings
 * @param {Function} props.onCloseAsModal - The function to close as modal
 * @param {Function} props.onMapMoveEnd - The function to move end
 * @param {number} props.zoom - The zoom
 * @param {Object} props.messages - The messages for the IntlProvider
 * @returns {JSX.Element}
 */
const SearchMap = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const history = useHistory();
  const location = useLocation();
  const hasUpdatedUrlRef = useRef(false);
  
  // Apply UK-focused map behavior
  const ukFocusedProps = useUKFocusedMap({
    bounds: props.bounds,
    center: props.center,
    currentUser: props.currentUser,
    zoom: props.zoom
  });
  
  console.log('SearchMap - Original props:', props);
  console.log('SearchMap - UK focused props:', ukFocusedProps);
  
  // Update URL when postcode bounds become available (only once, on initial load)
  useEffect(() => {
    // Check if we should update the URL
    const shouldUpdateUrl = 
      ukFocusedProps.bounds && // Postcode bounds are available
      !hasUpdatedUrlRef.current && // We haven't updated yet
      location; // Location is available
    
    if (shouldUpdateUrl && location) {
      // Parse current URL params
      const { mapSearch, page, ...rest } = parse(location.search || '', {
        latlng: ['origin'],
        latlngBounds: ['bounds'],
      });
      
      // Only update if mapSearch is not already in URL
      if (!mapSearch) {
        // Get current path params - try to extract from location pathname
        // The params might not be available here, but getSearchPageResourceLocatorStringParams will handle it
        const routes = routeConfiguration;
        const { listingFields: listingFieldsConfig } = config?.listing || {};
        const { defaultFilters: defaultFiltersConfig } = config?.search || {};
        const activeListingTypes = config?.listing?.listingTypes.map(config => config.listingType);
        const listingCategories = config.categoryConfiguration.categories;
        // Extract path params from location for filterConfigs
        const { pathParams } = getSearchPageResourceLocatorStringParams(routes, location);
        const filterConfigs = {
          listingFieldsConfig,
          defaultFiltersConfig,
          listingCategories,
          activeListingTypes,
          currentPathParams: pathParams || {},
        };
        
        // Convert SDK bounds to format needed for URL
        const bounds = ukFocusedProps.bounds;
        let urlBounds = null;
        if (bounds && bounds.ne && bounds.sw) {
          // Handle both SDK format (with lat()/lng() methods) and plain objects
          const neLat = typeof bounds.ne.lat === 'function' ? bounds.ne.lat() : bounds.ne.lat;
          const neLng = typeof bounds.ne.lng === 'function' ? bounds.ne.lng() : bounds.ne.lng;
          const swLat = typeof bounds.sw.lat === 'function' ? bounds.sw.lat() : bounds.sw.lat;
          const swLng = typeof bounds.sw.lng === 'function' ? bounds.sw.lng() : bounds.sw.lng;
          
          // Create bounds in SDK format for URL encoding
          const { LatLng, LatLngBounds } = sdkTypes;
          urlBounds = new LatLngBounds(
            new LatLng(neLat, neLng),
            new LatLng(swLat, swLng)
          );
        }
        
        const originMaybe = isOriginInUse(config) && ukFocusedProps.center ? { 
          origin: ukFocusedProps.center 
        } : {};
        const dropNonFilterParams = false;
        
        const searchParams = {
          ...rest,
          ...originMaybe,
          bounds: urlBounds,
          mapSearch: true,
          ...validFilterParams(rest, filterConfigs, dropNonFilterParams),
        };
        
        const { routeName, pathParams: finalPathParams } = getSearchPageResourceLocatorStringParams(routes, location);
        
        // Update URL with bounds
        history.push(createResourceLocatorString(routeName, routes, finalPathParams, searchParams));
        hasUpdatedUrlRef.current = true;
        
        console.log('SearchMap - Updated URL with postcode bounds:', searchParams);
      }
    }
  }, [ukFocusedProps.bounds, ukFocusedProps.center, location, config, routeConfiguration, history]);
  
  // Create final props with UK-focused bounds completely overriding original bounds
  const finalProps = {
    ...props,
    ...ukFocusedProps,
    // Ensure bounds are completely overridden to prevent NaN issues
    bounds: ukFocusedProps.bounds || null,
    center: ukFocusedProps.center || props.center,
    zoom: ukFocusedProps.zoom || props.zoom
  };
  
  console.log('SearchMap - Final props being passed:', finalProps);
  
  return (
    <SearchMapComponent
      config={config}
      routeConfiguration={routeConfiguration}
      history={history}
      {...finalProps}
    />
  );
};

export default SearchMap;
