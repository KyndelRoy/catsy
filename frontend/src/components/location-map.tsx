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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ShoppingBag, Map } from "lucide-react";
import Link from "next/link";

// 196 Bonifacio St, Tagum, Davao del Norte
const CAFE_POSITION: [number, number] = [7.4484, 125.8094];

export function LocationMap() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="w-full h-[400px] bg-muted border-y border-border flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Loading map...</span>
            </div>
        );
    }

    return (
        <div className="w-full h-[400px] relative border-y border-border">
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            />
            {/* Floating Actions Card */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-10 z-[400] pointer-events-none">
                <Card className="w-[280px] md:w-[320px] shadow-xl border-border bg-background/95 backdrop-blur-sm pointer-events-auto">
                    <CardContent className="p-6 space-y-4 flex flex-col justify-center">
                        <div className="space-y-1 pb-2 border-b border-border">
                            <h3 className="font-semibold text-lg">Visit Us</h3>
                            <p className="text-sm text-muted-foreground">
                                196 Bonifacio St, Tagum, Davao del Norte
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Link href="/reserve" className="w-full">
                                <Button className="w-full justify-start gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Reserve Table
                                </Button>
                            </Link>
                            <Link href="/order" className="w-full">
                                <Button variant="secondary" className="w-full justify-start gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    Order Pick Up
                                </Button>
                            </Link>
                            <a
                                href="https://maps.google.com/?q=7.4484,125.8094"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                            >
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <Map className="h-4 w-4" />
                                    Google Map
                                </Button>
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <MapContainer
                center={CAFE_POSITION}
                zoom={17}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={CAFE_POSITION}>
                    <Popup>
                        <strong>Catsy Coffee</strong>
                        <br />
                        196 Bonifacio St, Tagum, Davao del Norte
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
