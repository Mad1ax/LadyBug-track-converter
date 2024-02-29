import React from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';

const LeafletMap = ({ markers, markerCenter }) => {

  
  function ChangeView({ center, zoom }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
  }

  const customIcon = new Icon({
    // iconUrl: markerIcon,
    iconUrl: require('../img/location-pin.png'),
    iconSize: [32, 32],
  });


  return (
    <div
      style={{
        height: '50vh',
        width: '95%',
        margin: '1%',
        border: '2px solid #ced4da',
        borderRadius: '2px',
      }}
    >
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={markerCenter.center}
        zoom={markerCenter.zoom}
        scrollWheelZoom={true}
      >
        <ChangeView center={markerCenter.center} zoom={markerCenter.zoom} /> 
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        {markers.map((marker) => (
          <Marker key={marker.key} position={marker.geocode} icon={customIcon}>
            <Popup>{marker.popup}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
