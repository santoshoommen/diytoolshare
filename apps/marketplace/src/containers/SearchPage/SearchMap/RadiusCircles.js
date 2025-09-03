import React, { useEffect, useRef } from 'react';

/**
 * Component to draw radius circles on the map
 * Shows 3, 5, and 10-mile radius circles around the user's postcode
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

    // Define the three radius circles (3, 5, and 10 miles)
    const radiusConfigs = [
      { miles: 3, color: '#3B82F6', opacity: 0.3, width: 2 },   // Blue - 3 miles
      { miles: 5, color: '#10B981', opacity: 0.25, width: 2 },   // Green - 5 miles
      { miles: 10, color: '#EF4444', opacity: 0.2, width: 2 }    // Red - 10 miles
    ];

    // Remove existing circles first
    circlesRef.current.forEach(circle => {
      if (circle && map) {
        map.removeLayer(circle.id);
        map.removeSource(circle.id);
      }
    });
    circlesRef.current = [];

    // Create new circles
    radiusConfigs.forEach((config, index) => {
      const circleId = `radius-circle-${config.miles}`;
      
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

      // Add the circle layer to the map
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

      // Store reference to the circle
      circlesRef.current.push({
        id: circleId,
        source: map.getSource(circleId),
        layer: map.getLayer(circleId)
      });
    });

    // Cleanup function
    return () => {
      circlesRef.current.forEach(circle => {
        if (circle && map) {
          map.removeLayer(circle.id);
          map.removeSource(circle.id);
        }
      });
      circlesRef.current = [];
    };
  }, [map, center, isVisible]);

  // This component doesn't render anything visible
  return null;
};

export default RadiusCircles;
