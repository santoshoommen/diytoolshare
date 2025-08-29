import { types as sdkTypes } from '../util/sdkLoader';

const { LatLng, LatLngBounds } = sdkTypes;

// An array of locations to show in the LocationAutocompleteInput when
// the input is in focus but the user hasn't typed in any search yet.
//
// Each item in the array should be an object with a unique `id` (String) and a
// `predictionPlace` (util.types.place) properties.
//
// NOTE: these are highly recommended, since they
//       1) help customers to find relevant locations, and
//       2) reduce the cost of using map providers geocoding API
const defaultLocations = [
  {
    id: 'default-london',
    predictionPlace: {
      address: 'London, UK',
      bounds: new LatLngBounds(new LatLng(51.6860, -0.1180), new LatLng(51.2868, -0.5104)),
    },
  },
  {
    id: 'default-manchester',
    predictionPlace: {
      address: 'Manchester, UK',
      bounds: new LatLngBounds(new LatLng(53.4808, -2.2426), new LatLng(53.4084, -2.2984)),
    },
  },
  {
    id: 'default-birmingham',
    predictionPlace: {
      address: 'Birmingham, UK',
      bounds: new LatLngBounds(new LatLng(52.4862, -1.8904), new LatLng(52.4549, -1.9335)),
    },
  },
  {
    id: 'default-leeds',
    predictionPlace: {
      address: 'Leeds, UK',
      bounds: new LatLngBounds(new LatLng(53.8008, -1.5491), new LatLng(53.7582, -1.6178)),
    },
  },
  {
    id: 'default-liverpool',
    predictionPlace: {
      address: 'Liverpool, UK',
      bounds: new LatLngBounds(new LatLng(53.4084, -2.9916), new LatLng(53.3606, -3.0697)),
    },
  },
  {
    id: 'default-edinburgh',
    predictionPlace: {
      address: 'Edinburgh, UK',
      bounds: new LatLngBounds(new LatLng(55.9533, -3.1883), new LatLng(55.9411, -3.2241)),
    },
  },
];
export default defaultLocations;
