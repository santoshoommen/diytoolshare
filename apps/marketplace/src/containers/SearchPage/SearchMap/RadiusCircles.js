import React, { useEffect, useRef } from 'react';

/**
 * Component to draw radius circles on the map
 * Shows 3, 5, and 10-mile radius circles around the user's postcode
 * Creates a layered opacity effect for visual hierarchy
 */
const RadiusCircles = ({ map, center, isVisible = false }) => {
  const circlesRef = useRef([]);

  useEffect(() => {
    if (!map || !center || !isVisible) {
      // Remove existing circles if map is not available or circles should be hidden
      circlesRef.current.forEach(circle => {
        if (circle && map) {
          map.removeLayer(circle.id);
          map.removeSource(circle.id);
        }
      });
      circlesRef.current = [];
      return;
    }

    // Convert miles to degrees (approximate)
    const latDelta = (miles) => miles / 69; // 1 degree latitude ≈ 69 miles
    const lngDelta = (miles) => miles / (69 * Math.cos(center.lat * Math.PI / 180));

    // Define the three radius circles with layered opacity effect
    const radiusConfigs = [
      { miles: 3, color: '#3B82F6', opacity: 0.2, width: 1, fillOpacity: 0.05 },    // Blue - 3 miles (very subtle)
      { miles: 5, color: '#10B981', opacity: 0.3, width: 2, fillOpacity: 0.1 },    // Green - 5 miles (slight opacity)
      { miles: 10, color: '#EF4444', opacity: 0.5, width: 2, fillOpacity: 0.2 }    // Red - 10 miles (more opacity)
    ];

    // Remove existing circles first
    circlesRef.current.forEach(circle => {
      if (circle && map) {
        map.removeLayer(circle.id);
        map.removeSource(circle.id);
      }
    });
    circlesRef.current = [];

    // Create new circles with fill areas for opacity overlay
    radiusConfigs.forEach((config, index) => {
      const circleId = `radius-circle-${config.miles}`;
      const fillId = `radius-fill-${config.miles}`;
      
      // Calculate circle coordinates
      const latDeltaVal = latDelta(config.miles);
      const lngDeltaVal = lngDelta(config.miles);
      
      // Create a circle using multiple points to approximate a circle
      const points = [];
      const numPoints = 64; // Number of points to create a smooth circle
      
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        const lat = center.lat + latDeltaVal * Math.cos(angle);
        const lng = center.lng + lngDeltaVal * Math.sin(angle);
        points.push([lng, lat]);
      }
      
      // Close the circle
      points.push(points[0]);

      // Add the circle source to the map
      if (map.getSource(circleId)) {
        map.removeSource(circleId);
      }
      
      map.addSource(circleId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: points
          }
        }
      });

      // Add the fill source for opacity overlay
      if (map.getSource(fillId)) {
        map.removeSource(fillId);
      }
      
      map.addSource(fillId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [points] // Note: Polygon needs array of arrays
          }
        }
      });

      // Add the fill layer first (so it appears behind the line)
      if (map.getLayer(fillId)) {
        map.removeLayer(fillId);
      }
      
      map.addLayer({
        id: fillId,
        type: 'fill',
        source: fillId,
        paint: {
          'fill-color': config.color,
          'fill-opacity': config.fillOpacity
        }
      });

      // Add the circle line layer on top
      if (map.getLayer(circleId)) {
        map.removeLayer(circleId);
      }
      
      map.addLayer({
        id: circleId,
        type: 'line',
        source: circleId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': config.color,
          'line-width': config.width,
          'line-opacity': config.opacity
        }
      });

      // Store reference to both the circle and fill
      circlesRef.current.push({
        id: circleId,
        fillId: fillId,
        source: map.getSource(circleId),
        fillSource: map.getSource(fillId),
        layer: map.getLayer(circleId),
        fillLayer: map.getLayer(fillId)
      });
    });

    // Cleanup function
    return () => {
      circlesRef.current.forEach(circle => {
        if (circle && map) {
          // Remove both line and fill layers
          if (map.getLayer(circle.id)) {
            map.removeLayer(circle.id);
          }
          if (map.getLayer(circle.fillId)) {
            map.removeLayer(circle.fillId);
          }
          // Remove both sources
          if (map.getSource(circle.id)) {
            map.removeSource(circle.id);
          }
          if (map.getSource(circle.fillId)) {
            map.removeSource(circle.fillId);
          }
        }
      });
      circlesRef.current = [];
    };
  }, [map, center, isVisible]);

  // This component doesn't render anything visible
  return null;
};

export default RadiusCircles;
