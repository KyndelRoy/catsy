import Image from "next/image";

export function HeroSection() {
    return (
        <section className="relative w-full h-[28vh] md:h-[35vh] min-h-[210px]">
            <Image
                src="/hero-sectionbg.jpg"
                alt="Catsy Coffee Hero"
                fill
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute inset-0 flex items-center justify-center py-6">
                <div className="relative h-[80%] aspect-square bg-white rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center p-2">
                    <div className="relative w-full h-full">
                        <Image
                            src="/logo.jpg"
                            alt="Catsy Coffee Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
