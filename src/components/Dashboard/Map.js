import React from 'react'
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import { propTypes } from 'qrcode.react';

const containerStyle = {
    width: '100',
    height: '500px'
};
function Map(props) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    })

    if (loadError) return "Error Loading Map"
    if (!isLoaded) return "Loading Map"
 
    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            zoom={16}
            center={props.location}
            >
                <Marker
                    key={props.location.lat}
                    position={props.location}
                />

        </GoogleMap>
    )
}

export default Map
