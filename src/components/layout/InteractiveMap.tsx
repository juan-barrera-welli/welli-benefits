"use client"

import { useState, useCallback, useMemo, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import type { Provider } from '@/types/provider'
import { Star, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '2.5rem'
}

type InteractiveMapProps = {
    providers: Provider[]
    center?: { lat: number, lng: number }
}

export function InteractiveMap({ providers, center: defaultCenter }: InteractiveMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        // Se cargará del .env de Vercel/Localhost
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    })

    const [map, setMap] = useState<google.maps.Map | null>(null)
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

    const onUnmount = useCallback(function callback(_map: google.maps.Map) {
        setMap(null)
    }, [])

    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)

    // Request user location on component mount
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(newLocation);
                    // Center map dynamically if loaded
                    if (map) {
                        map.panTo(newLocation);
                        map.setZoom(13);
                    }
                },
                (error) => {
                    console.error("Error obtaining geolocation:", error);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }
    }, [map]);

    // Define center dynamically based on providers or fallback to Bogota
    const center = useMemo(() => {
        if (defaultCenter) return defaultCenter;

        // Find the first provider with valid coordinates
        const validProvider = providers.find(p => p.locations?.[0]?.lat && p.locations?.[0]?.lng);
        if (validProvider && validProvider.locations[0]) {
            return {
                lat: Number(validProvider.locations[0].lat),
                lng: Number(validProvider.locations[0].lng)
            }
        }

        // Fallback to Bogota coordinates
        return { lat: 4.6097, lng: -74.0817 }
    }, [providers, defaultCenter])

    if (!isLoaded) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 animate-pulse">
                <div className="flex flex-col items-center gap-3">
                    <MapPin className="h-8 w-8 text-slate-300 animate-bounce" />
                    <span className="text-slate-400 font-bold text-sm">Cargando mapa interactivo...</span>
                </div>
            </div>
        )
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={userLocation || center}
            zoom={userLocation ? 13 : 12}
            onLoad={setMap}
            onUnmount={onUnmount}
            options={{
                disableDefaultUI: false, // Allows user controls
                styles: [
                    { featureType: 'all', elementType: 'labels', stylers: [{ visibility: 'on' }] },
                    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
                    { featureType: 'water', stylers: [{ color: '#e9e9e9' }] }
                ]
            }}
        >
            {/* User Location Marker */}
            {userLocation && (
                <Marker
                    position={userLocation}
                    icon={{
                        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20" cy="20" r="14" fill="#10B981" fill-opacity="0.2"/>
                                <circle cx="20" cy="20" r="8" fill="white" stroke="#10B981" stroke-width="2"/>
                                <circle cx="20" cy="20" r="4" fill="#10B981"/>
                            </svg>
                        `),
                        scaledSize: new window.google.maps.Size(40, 40),
                        anchor: new window.google.maps.Point(20, 20)
                    }}
                    title="Tu Ubicación Actual"
                    zIndex={100}
                />
            )}

            {/* Render a marker for each location of every provider */}
            {providers.map((provider) => (
                provider.locations?.map((loc, idx: number) => {
                    if (!loc.lat || !loc.lng) return null;
                    const position = { lat: Number(loc.lat), lng: Number(loc.lng) }

                    return (
                        <Marker
                            key={`${provider.id}-${idx}`}
                            position={position}
                            onClick={() => setSelectedProvider(provider)}
                            animation={window.google.maps.Animation.DROP}
                            // Custom icon simulating the WELLI brand pin
                            icon={{
                                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="40" height="40" rx="16" fill="white" stroke="#4C7DFF" stroke-width="2"/>
                                        <path d="M28 17C28 22.5 20 30 20 30C20 30 12 22.5 12 17C12 12.5817 15.5817 9 20 9C24.4183 9 28 12.5817 28 17Z" fill="#4C7DFF" fill-opacity="0.1" stroke="#4C7DFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <circle cx="20" cy="17" r="3" stroke="#4C7DFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                `),
                                scaledSize: new window.google.maps.Size(40, 40),
                                anchor: new window.google.maps.Point(20, 20)
                            }}
                        />
                    )
                })
            ))}

            {selectedProvider && selectedProvider.locations?.[0] && (
                <InfoWindow
                    position={{
                        lat: Number(selectedProvider.locations[0].lat),
                        lng: Number(selectedProvider.locations[0].lng)
                    }}
                    onCloseClick={() => setSelectedProvider(null)}
                >
                    <div className="p-1 min-w-[200px]">
                        <p className="text-[10px] font-black text-[#8C65C9] uppercase">{selectedProvider.category}</p>
                        <h4 className="font-bold text-sm text-slate-900 mt-0.5">{selectedProvider.name}</h4>
                        <div className="flex items-center mt-1.5 gap-1 bg-yellow-50 w-fit px-1.5 py-0.5 rounded-md">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-[10px] font-bold text-yellow-700">{selectedProvider.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{selectedProvider.locations[0].address}</p>

                        <Button
                            className="w-full mt-3 h-8 text-[10px] rounded-lg bg-[#4C7DFF] hover:bg-[#3b66d6] text-white font-bold"
                            onClick={() => window.open(`/providers/${selectedProvider.id}`, '_blank')}
                        >
                            Ver Perfil Completo
                        </Button>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    )
}
