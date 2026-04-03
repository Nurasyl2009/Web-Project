import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, StreetViewPanorama, MarkerF } from '@react-google-maps/api';

const cityCoords = {
  'Париж': { lat: 48.8584, lng: 2.2945 },
  'Рим': { lat: 41.8902, lng: 12.4922 },
  'Берлин': { lat: 52.5163, lng: 13.3777 },
  'Мадрид': { lat: 40.4179, lng: -3.7142 }
};

const containerStyle = {
  width: '100%',
  height: '100%'
};

function ThreeDMap({ cityName, onClose, t }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: ""
  });

  const [viewMode, setViewMode] = useState('street');
  const center = cityCoords[cityName] || { lat: 48.8566, lng: 2.3522 };

  if (!isLoaded) return <div className="map-loading">Loading...</div>;

  return (
    <div className="three-d-modal">
      <div className="three-d-modal__content">
        <div className="three-d-modal__header">
          <h3>3D: {cityName}</h3>
          <div className="three-d-modal__controls">
            <button
              className={`btn-toggle ${viewMode === 'street' ? 'active' : ''}`}
              onClick={() => setViewMode('street')}
            >
              {t.cityRoute.streetView}
            </button>
            <button
              className={`btn-toggle ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              {t.cityRoute.satelliteView}
            </button>
            <button className="btn-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="three-d-modal__body">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={16}
            mapTypeId={viewMode === 'map' ? 'satellite' : 'roadmap'}
            options={{
              tilt: 45,
              heading: 0,
              mapTypeControl: false,
              streetViewControl: false
            }}
          >
            {viewMode === 'street' && (
              <StreetViewPanorama
                position={center}
                visible={true}
                options={{
                  addressControl: false,
                  showRoadLabels: false,
                  zoomControl: true
                }}
              />
            )}
            {viewMode === 'map' && <MarkerF position={center} />}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}

export default ThreeDMap;
