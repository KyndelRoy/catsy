"use client";

import dynamic from "next/dynamic";

const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import("react-leaflet").then((mod) => mod.Popup),
    { ssr: false }
);

import { useEffect, useState } from "react";

// 196 Bonifacio St, Tagum, Davao del Norte
const CAFE_POSITION: [number, number] = [7.4484, 125.8094];

export function LocationMap() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="w-full h-[250px] bg-muted rounded-xl flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Loading map...</span>
            </div>
        );
    }

    return (
        <div className="w-full h-[250px] rounded-xl overflow-hidden border border-border">
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            />
            <MapContainer
                center={CAFE_POSITION}
                zoom={17}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
                // @ts-expect-error react-leaflet SSR typing issue
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={CAFE_POSITION}>
                    <Popup>
                        <strong>Kape Tayo</strong>
                        <br />
                        196 Bonifacio St, Tagum, Davao del Norte
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
