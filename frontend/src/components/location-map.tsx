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
import Link from "next/link";
import Image from "next/image";

// 196 Bonifacio St, Tagum, Davao del Norte
const CAFE_POSITION: [number, number] = [7.4484, 125.8094];

const LocationCard = ({ className }: { className?: string }) => (
    <Card className={`relative w-full md:w-[336px] shadow-2xl border-none bg-[#1A1A1A]/95 backdrop-blur-md text-white rounded-[2rem] overflow-hidden ${className}`}>
        <button className="absolute top-4 right-4 z-20 h-8 w-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 transition-colors">
            <span className="text-white/60 text-xl font-light">×</span>
        </button>
        <CardContent className="p-5 md:p-5 space-y-5">
            {/* Images Row */}
            <div className="grid grid-cols-2 gap-3 h-24 md:h-28">
                <div className="relative rounded-2xl overflow-hidden">
                    <Image
                        src="/hero-sectionbg.jpg" // Using existing bg as placeholder
                        alt="Cafe Exterior"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="relative rounded-2xl overflow-hidden">
                    <Image
                        src="/logo.jpg" // Using logo as placeholder
                        alt="Cafe Interior"
                        fill
                        className="object-cover"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-5">
                <div className="space-y-1.5">
                    <h3 className="font-bold text-xl md:text-2xl tracking-tight">Find Your Spot</h3>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-wider text-zinc-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                            OPEN NOW UNTIL 21:00
                        </div>
                        <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-wider text-zinc-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            CURRENTLY FULL - CHECK BACK SOON
                        </div>
                    </div>
                </div>

                <div className="space-y-0.5">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-600 uppercase">Address</p>
                    <p className="text-xs md:text-sm font-medium leading-relaxed">
                        1495 Manuel B. Suaybaguio Sr. St,<br />
                        Tagum City
                    </p>
                </div>

                <div className="flex flex-col gap-2.5 pt-1">
                    <Link href="/reserve" className="w-full">
                        <Button className="w-full h-11 bg-white text-black hover:bg-zinc-200 rounded-2xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                            Reserve Table <span className="text-base">↗</span>
                        </Button>
                    </Link>
                    <a
                        href="https://maps.google.com/?q=7.4484,125.8094"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                    >
                        <Button variant="outline" className="w-full h-11 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-white rounded-2xl font-bold text-xs tracking-widest uppercase">
                            Google Map
                        </Button>
                    </a>
                </div>
            </div>
        </CardContent>
    </Card>
);

export function LocationMap() {

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <div className="flex flex-col w-full bg-black">
            <div className="w-full h-[360px] md:h-[520px] relative">
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                />

                {/* Desktop Floating Actions Card */}
                <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-12 lg:right-24 z-[400] pointer-events-none">
                    <div className="pointer-events-auto">
                        <LocationCard />
                    </div>
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
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <Marker position={CAFE_POSITION}>
                        <Popup>
                            <strong>Catsy Coffee</strong>
                            <br />
                            1495 Manuel B. Suaybaguio Sr. St
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>

            {/* Mobile Actions Card - Flow Below Map */}
            <div className="md:hidden px-4 py-10 bg-black">
                <LocationCard />
            </div>
        </div>
    );
}
