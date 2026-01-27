'use client';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';

// Fix for icon issues in Leaflet
function fixLeafletIcon() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

interface LocationMarkerProps {
    position: [number, number];
    setPosition: (pos: [number, number]) => void;
}

function LocationMarker({ position, setPosition }: LocationMarkerProps) {
    const map = useMap();

    useMapEvents({
        click(e: any) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        fixLeafletIcon();
    }, []);

    return position ? (
        <Marker position={position} />
    ) : null;
}

interface MapControllerProps {
    position: [number, number];
}

function MapController({ position }: MapControllerProps) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(position, map.getZoom(), { animate: true, duration: 1.5 });
    }, [position, map]);
    return null;
}

interface MapContentProps {
    position: [number, number];
    setPosition: (pos: [number, number]) => void;
}

export default function MapContent({ position, setPosition }: MapContentProps) {
    return (
        <MapContainer
            center={position}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
            <MapController position={position} />
        </MapContainer>
    );
}
