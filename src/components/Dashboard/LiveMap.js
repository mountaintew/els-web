import React, { useState, useEffect } from 'react'
import Geocode from "react-geocode";
import { GoogleMap, InfoWindow, useLoadScript, LoadScript, Marker, MarkerClusterer } from '@react-google-maps/api';
import mapStyle from './mapStyle';
import { TrafficLayer } from '@react-google-maps/api';
import firebase from '../../util/firebase';
import useSound from 'use-sound';
import alerton from './Sfx/alertsound.wav'
import alertoff from './Sfx/alertoff.wav'

import anim from './Sfx/anim.svg'
const containerStyle = {
    width: '100',
    height: '500px'
};

const libraries = ["places"];

const options = {
    zoomControl: true,
    styles: [{
        "featureType": "poi.business",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },]
}

function LiveMap(props) {
    const [alarm, {stop, isPlaying}] = useSound(
        alerton,
        { volume: 0.80 }
    );
    const [alarmoff] = useSound(
        alertoff,
        { volume: 0.80 }
    );

    const center = props.center
    const dbRef = firebase.database();
    const [markers, setMarkers] = useState([]);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries
    })



    useEffect(() => {
        const ref = dbRef.ref('/Markers');

        ref.on('value', (snapshot) => {
            if (snapshot.exists()) {

                const perMark = snapshot.val();
                const markList = [];
                for (let id in perMark) {
                    markList.push({ id, ...perMark[id] });
                }
                setMarkers(markList)
                
                
                // Object.keys(snapshot.val()).map((numbers) => {
                //     dbRef.ref('/Markers/' + numbers).on('value', (snapshot) => {
                //         // console.log(snapshot.child('firstname').val())  
                //     });
                // })
            } else {
                setMarkers([])
            }
        });
    }, [])

    if (loadError) return "Error loading map";
    if (!isLoaded) return "Loading Map...";
    const getMs = markers ? (<pre>{JSON.stringify(markers, null, 2)}</pre>) : 'asd'

    return (
        <div>
            <GoogleMap
                mapContainerStyle={containerStyle}
                zoom={16}
                center={props.center}
                options={options}

            >
                <TrafficLayer />
                {
                    markers.map(marker =>
                        <Marker
                            key={marker.id}
                            position={{
                                lat: parseFloat(marker.lat),
                                lng: parseFloat(marker.lng)
                            }}
                            title={marker.id}
                            onUnmount={alarmoff}
                            onLoad={alarm}
                            onClick={() => { }}
                        />
                    )
                }
            </GoogleMap>
            {/* stop sound after removed  */}
            {/* {getMs} */}
        </div >
    )
}

export default LiveMap