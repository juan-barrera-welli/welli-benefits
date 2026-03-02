"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CATEGORIES, PROVIDERS, PROMOS } from "@/lib/constants"
import { Star, ChevronLeft, ChevronRight, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ProviderCard } from "@/components/ui/provider-card"
import beneficiosData from "@/lib/data/beneficios.json"
import Fuse from "fuse.js"

export default function HomePage() {
    const router = useRouter()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)

    const featuredProviders = PROVIDERS.filter(p => p.featured)

    const searchSuggestions = searchQuery.length >= 3
        ? new Fuse(PROVIDERS, {
            keys: ["name", "specialty", "category", "description", "procedures"],
            threshold: 0.4,
            ignoreLocation: true
        }).search(searchQuery).map(res => res.item).slice(0, 5)
        : [];

    // Get unique categories that actually have providers
    const activeCategoryIds = new Set(PROVIDERS.map(p => p.category).filter(Boolean));
    const homeCategories = CATEGORIES.filter(c => activeCategoryIds.has(c.id));

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % featuredProviders.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + featuredProviders.length) % featuredProviders.length)
    }

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`)
        } else {
            router.push(`/discover`)
        }
    }

    const handleSuggestionClick = (providerId: string) => {
        router.push(`/providers/${providerId}`)
    }

    return (
        <div className="flex flex-col pb-20">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-[#8C65C9] to-[#4C7DFF] pt-12 pb-32 px-6 text-white">
                <div className="max-w-4xl mx-auto space-y-8 relative z-20 flex flex-col items-center text-center">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                            Tu bienestar, <br />
                            <span className="text-[#FFC800]">al alcance de tu mano.</span>
                        </h1>
                        <p className="text-lg md:text-xl opacity-90 max-w-xl mx-auto">
                            Descubre los mejores aliados médicos y servicios de salud para usar tu línea de crédito Welli.
                        </p>
                    </div>

                    <div className="relative w-full max-w-2xl mx-auto z-40">
                        <div className="flex items-center bg-black/20 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] p-2 gap-3 relative z-30">
                            <Search className="text-white/60 h-5 w-5 ml-3 shrink-0" />
                            <Input
                                placeholder="¿Qué servicio buscas hoy? (ej. Dentista)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="flex-1 h-12 bg-transparent text-white border-0 shadow-none text-lg focus-visible:ring-0 placeholder:text-white/40 font-medium pl-1"
                            />
                            <Button
                                onClick={handleSearch}
                                className="bg-[#FFC800]/80 backdrop-blur-3xl hover:bg-[#FFC800] text-black font-black rounded-full h-12 px-8 shadow-[0_4px_12px_rgba(255,200,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-white/30 transition-all hover:scale-105 active:scale-95 shrink-0"
                            >
                                Buscar
                            </Button>
                        </div>

                        {/* Dropdown Suggestions */}
                        {showSuggestions && searchQuery.length >= 3 && (
                            <div className="absolute top-[110%] left-0 right-0 bg-white shadow-2xl rounded-2xl border border-slate-100 overflow-hidden text-left z-[100]">
                                {searchSuggestions.length > 0 ? (
                                    <ul className="py-2">
                                        {searchSuggestions.map((p) => (
                                            <li
                                                key={p.id}
                                                onClick={() => handleSuggestionClick(p.id)}
                                                className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                                            >
                                                <div className="h-10 w-10 shrink-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                                                    {p.image ? (
                                                        <img
                                                            src={p.image}
                                                            alt={p.name}
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <Star className="h-4 w-4 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-900 truncate">{p.name}</p>
                                                    <p className="text-sm text-slate-500 truncate">{p.specialty}</p>
                                                </div>
                                            </li>
                                        ))}
                                        <li
                                            onClick={handleSearch}
                                            className="px-4 py-3 bg-slate-50 hover:bg-slate-100 cursor-pointer text-center text-sm font-semibold text-[#4C7DFF] transition-colors"
                                        >
                                            Ver todos los resultados para &quot;{searchQuery}&quot;
                                        </li>
                                    </ul>
                                ) : (
                                    <div className="p-6 text-center text-slate-500">
                                        No se encontraron aliados para &quot;{searchQuery}&quot;
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
                        <Link href="/discover" className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-6 rounded-full border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 shadow-lg">
                            <Star className="h-4 w-4 text-[#FFC800] fill-[#FFC800]" />
                            Directorio de Aliados
                        </Link>
                    </div>
                </div>

                {/* Decorative Mascot */}
                <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 opacity-20 hidden md:block">
                    <Image
                        src="/images/welli-mascot-hi.png"
                        alt="Welli Mascot"
                        width={400}
                        height={400}
                    />
                </div>
            </section>

            {/* Categories */}
            <section className="px-6 -mt-16 relative z-10 w-full overflow-hidden">
                <div className="max-w-[100vw] mx-auto flex lg:justify-center overflow-x-auto pb-6 pt-2 gap-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {/* Spacer for proper centering on ultra-wide screens, but padding handles the start */}
                    <div className="shrink-0 w-2 lg:hidden" />
                    {homeCategories.map((cat) => (
                        <Link key={cat.id} href={`/discover?category=${cat.id}`} className="group min-w-[110px] w-[110px] shrink-0 snap-start">
                            <Card className="hover:shadow-2xl hover:-translate-y-2 transition-all border border-white/50 rounded-[2rem] h-[130px] flex flex-col items-center justify-center p-3 text-center cursor-pointer bg-white/95 backdrop-blur-xl shadow-lg group-hover:bg-white">
                                <span className="text-3xl md:text-4xl mb-3 group-hover:scale-125 transition-transform duration-300 drop-shadow-sm">{cat.icon}</span>
                                <span className="text-[10px] md:text-[11px] font-black text-slate-800 uppercase tracking-wider line-clamp-2 leading-tight px-1">{cat.name}</span>
                            </Card>
                        </Link>
                    ))}

                    <div className="shrink-0 w-6" />
                </div>
            </section>

            {/* Featured Providers */}
            <section className="px-6 pt-12">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Aliados Destacados</h2>
                            <p className="text-xs font-bold text-slate-500">Los mejores especialistas seleccionados para ti</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={prevSlide}
                                    className="rounded-full h-12 w-12 border-white/30 bg-white/10 backdrop-blur-2xl hover:bg-white/20 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.4)] active:scale-90"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={nextSlide}
                                    className="rounded-full h-12 w-12 border-white/30 bg-white/10 backdrop-blur-2xl hover:bg-white/20 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.4)] active:scale-90"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </Button>
                            </div>
                            <Link href="/discover" className="text-sm font-black text-[#4C7DFF] flex items-center hover:scale-105 active:scale-95 transition-all bg-white/90 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                                Ver todos <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        </div>
                    </div>

                    <div className="relative overflow-visible">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-full">
                            {/* Mobile View: 1 item based on currentIndex */}
                            <div className="flex md:hidden min-w-full">
                                {featuredProviders.slice(currentIndex % featuredProviders.length, (currentIndex % featuredProviders.length) + 1).map((provider, idx) => (
                                    <div key={`${provider.id}-${idx}`} className="w-full">
                                        <ProviderCard provider={provider} variant="home" />
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View: Grid approach but sliding logic */}
                            {featuredProviders.slice(currentIndex % featuredProviders.length, (currentIndex % featuredProviders.length) + 4).map((provider, idx) => (
                                <div key={`${provider.id}-${idx}`} className="hidden md:block">
                                    <ProviderCard provider={provider} variant="home" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Exclusive Promos */}
            <section className="px-6 pt-20 pb-10">
                <div className="max-w-6xl mx-auto space-y-8 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Beneficios Exclusivos</h2>
                            <p className="text-slate-500 font-bold px-1">Promociones para usuarios Welli Benefits</p>
                        </div>
                        <div className="flex gap-2.5 bg-white/40 backdrop-blur-md p-2 rounded-full border border-white/20">
                            <Link href="/promociones" className="text-sm font-black text-[#4C7DFF] flex items-center hover:scale-105 active:scale-95 transition-all bg-white/90 backdrop-blur-xl px-5 py-2 rounded-full border border-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                                Ver todas las promociones <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {beneficiosData.slice(0, 3).map((promo, idx) => (
                            <Card key={idx} className="border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_1px_0_rgba(255,255,255,0.4)] rounded-[3rem] overflow-hidden group hover:scale-[1.02] transition-all duration-500 bg-white/95 backdrop-blur-xl flex flex-col">
                                <Link href="/promociones" className="flex-1 flex flex-col">
                                    <div className="relative h-56 shrink-0 overflow-hidden bg-slate-100/50">
                                        {promo.image ? (
                                            <>
                                                <Image
                                                    src={promo.image}
                                                    alt={promo.nombre_comercial}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        const nextSibling = (e.target as HTMLImageElement).nextElementSibling;
                                                        if (nextSibling) {
                                                            nextSibling.classList.remove('hidden');
                                                        }
                                                    }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold tracking-widest text-[10px] uppercase hidden backdrop-blur-[2px] bg-slate-100/80">
                                                    {promo.nombre_comercial}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold tracking-widest text-[10px] uppercase">
                                                {promo.nombre_comercial}
                                            </div>
                                        )}
                                        <div
                                            className="absolute top-6 left-6 text-white font-black text-xl px-5 py-2.5 rounded-[1.5rem] shadow-2xl z-10 animate-pulse-slow bg-gradient-to-r from-[#FFC800] to-[#FF9000]"
                                        >
                                            {promo.tipo_promocion}
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white to-transparent" />
                                    </div>
                                    <CardContent className="p-8 pt-0 relative -top-4 flex flex-col flex-1 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8C65C9]">
                                                {promo.nombre_comercial}
                                            </p>
                                            <h3 className="font-black text-2xl text-slate-900 leading-tight">
                                                {promo.nombre_descuento}
                                            </h3>
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed opacity-80 flex-1">
                                            {promo.descripcion_descuento}
                                        </p>
                                    </CardContent>
                                </Link>
                                <div className="p-8 pt-0 mt-auto">
                                    <Link href="/promociones" className="block w-full">
                                        <Button variant="outline" className="w-full rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/40 text-slate-800 shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_2px_0_rgba(255,255,255,0.3)] transition-all hover:bg-white/15 hover:ring-1 hover:ring-white/50 active:scale-95 font-black h-14 text-lg">
                                            Ver y Obtener Oferta
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
