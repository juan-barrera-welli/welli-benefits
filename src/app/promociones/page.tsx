"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sparkles, Tag, AlertCircle, ChevronRight, X, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import beneficiosData from "@/lib/data/beneficios.json"
import { PROVIDERS } from "@/lib/constants"

export default function PromocionesPage() {
    const router = useRouter()
    const [loadingPromo, setLoadingPromo] = useState<string | null>(null)
    const [successPromo, setSuccessPromo] = useState<string | null>(null)
    const [errorPromo, setErrorPromo] = useState<string | null>(null)

    const handleRequestPromo = async (promo: any) => {
        try {
            setLoadingPromo(promo.nombre_comercial)
            setErrorPromo(null)
            setSuccessPromo(null)

            const userStr = localStorage.getItem("welli_user")
            if (!userStr) {
                router.push("/login")
                return
            }
            const user = JSON.parse(userStr)

            // Find matching provider to get email
            const providerMatches = PROVIDERS.filter(p =>
                p.name.toLowerCase().includes(promo.nombre_comercial.toLowerCase()) ||
                promo.nombre_comercial.toLowerCase().includes(p.name.toLowerCase())
            );

            const providerEmail = providerMatches.length > 0 && providerMatches[0].providerEmail
                ? providerMatches[0].providerEmail
                : "juancamilobp08@gmail.com"; // Fallback by default to avoid failing in demo

            const payload = {
                user,
                promo,
                providerEmail
            }

            const res = await fetch("/api/request-promo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                throw new Error("Error en la solicitud")
            }

            setSuccessPromo(promo.nombre_comercial)

            // Revert back to normal after 4 seconds
            setTimeout(() => setSuccessPromo(null), 4000)

        } catch (err: any) {
            console.error(err)
            setErrorPromo("Hubo un error enviando la solicitud.")
        } finally {
            setLoadingPromo(null)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <section className="bg-gradient-to-b from-[#FFC800] to-slate-50 pt-10 pb-12 px-6 text-center relative">
                <div className="absolute top-6 left-6 md:left-12 z-20 md:top-10">
                    <Link href="/home" className="flex items-center text-slate-800 hover:text-black font-bold bg-white/60 hover:bg-white/90 shadow-sm backdrop-blur-md px-4 py-2 rounded-full transition-all">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Volver
                    </Link>
                </div>
                <div className="max-w-3xl mx-auto space-y-4 relative z-10 pt-12 md:pt-4">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-slate-900">
                        Beneficios Exclusivos
                    </h1>
                    <p className="text-md md:text-lg opacity-90 font-bold text-slate-800">
                        Aprovecha estas promociones por ser usuario de Welli.
                    </p>
                </div>
            </section>

            {/* Promos Grid */}
            <main className="flex-1 px-6 pb-20 relative z-20">
                <div className="max-w-6xl mx-auto">
                    {beneficiosData.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {beneficiosData.map((promo, idx) => {
                                // Find matching provider
                                const providerMatches = PROVIDERS.filter(p =>
                                    p.name.toLowerCase().includes(promo.nombre_comercial.toLowerCase()) ||
                                    promo.nombre_comercial.toLowerCase().includes(p.name.toLowerCase())
                                );
                                const matchingProviderId = providerMatches.length > 0 ? providerMatches[0].id : null;

                                return (
                                    <Dialog key={idx}>
                                        <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-300 bg-white flex flex-col cursor-pointer">
                                            <DialogTrigger asChild>
                                                <div className="flex-1 flex flex-col h-full">
                                                    <div className="relative h-40 shrink-0 bg-slate-100 overflow-hidden">
                                                        {promo.image ? (
                                                            <>
                                                                <img
                                                                    src={promo.image}
                                                                    alt={promo.nombre_comercial}
                                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                                        const nextSibling = (e.target as HTMLImageElement).nextElementSibling;
                                                                        if (nextSibling) {
                                                                            nextSibling.classList.remove('hidden');
                                                                        }
                                                                    }}
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold tracking-[0.2em] text-2xl uppercase hidden backdrop-blur-[2px] bg-slate-100/80">
                                                                    {promo.nombre_comercial}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-black tracking-[0.2em] text-2xl uppercase opacity-40">
                                                                {promo.nombre_comercial}
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                                                        <div
                                                            className="absolute bottom-3 left-3 text-white font-black text-lg px-4 py-1.5 rounded-xl shadow-lg z-10 bg-gradient-to-r from-[#FFC800] to-[#FF9000]"
                                                        >
                                                            {promo.tipo_promocion}
                                                        </div>
                                                        <div className="absolute top-3 right-3 h-8 w-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md z-10">
                                                            <Tag className="h-4 w-4 text-[#8C65C9]" />
                                                        </div>
                                                    </div>

                                                    <CardContent className="p-5 flex flex-col flex-1 gap-2">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#8C65C9] line-clamp-1">
                                                                {promo.nombre_comercial}
                                                            </p>
                                                            <h3 className="font-bold text-lg text-slate-900 leading-tight line-clamp-2">
                                                                {promo.nombre_descuento}
                                                            </h3>
                                                        </div>
                                                    </CardContent>

                                                    <div className="p-5 pt-0 mt-auto border-t border-slate-100 flex items-center justify-between">
                                                        <span className="text-xs font-semibold text-slate-400">Solo usuarios Welli</span>
                                                        <div className="flex items-center text-[#4C7DFF] font-bold text-sm group-hover:translate-x-1 transition-transform">
                                                            Ver Detalles <ChevronRight className="h-4 w-4 ml-0.5" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </DialogTrigger>

                                            {/* Modal for Details */}
                                            <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden gap-0 bg-white border-0 shadow-2xl">
                                                <div className="relative h-48 bg-slate-100 w-full overflow-hidden shrink-0">
                                                    {promo.banner || promo.image ? (
                                                        <img
                                                            src={promo.banner || promo.image}
                                                            alt={promo.nombre_comercial}
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                const nextSibling = (e.target as HTMLImageElement).nextElementSibling;
                                                                if (nextSibling) {
                                                                    nextSibling.classList.remove('hidden');
                                                                }
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`absolute inset-0 flex items-center justify-center text-slate-400 font-bold tracking-widest text-xl uppercase bg-slate-100/90 backdrop-blur-md ${(promo.banner || promo.image) ? 'hidden' : ''}`}>
                                                        {promo.nombre_comercial}
                                                    </div>
                                                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
                                                    <div className="absolute bottom-4 left-6 right-6">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#FFC800] mb-1 drop-shadow-md">
                                                            {promo.nombre_comercial}
                                                        </p>
                                                        <DialogTitle className="text-2xl font-black text-white leading-tight drop-shadow-md">
                                                            {promo.nombre_descuento}
                                                        </DialogTitle>
                                                    </div>
                                                </div>

                                                <div className="p-6 space-y-6 max-h-[50vh] overflow-y-auto">
                                                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFC800]/20 to-[#FF9000]/10 text-[#FF9000] px-4 py-2 rounded-xl font-black text-lg">
                                                        <Tag className="h-5 w-5" />
                                                        {promo.tipo_promocion} de Descuento
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h4 className="font-bold text-slate-900">Sobre la promoción</h4>
                                                        <p className="text-slate-600 text-sm leading-relaxed">
                                                            {promo.descripcion_descuento}
                                                        </p>
                                                    </div>

                                                    {promo.condiciones && (
                                                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                                                            <div className="flex items-start gap-2 text-orange-800">
                                                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-orange-500" />
                                                                <div>
                                                                    <h5 className="font-bold text-xs mb-1">Términos y condiciones</h5>
                                                                    <p className="text-xs font-medium leading-relaxed opacity-90">
                                                                        {promo.condiciones}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {errorPromo && loadingPromo !== promo.nombre_comercial && (
                                                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-4 py-3 rounded-xl mb-4">
                                                            {errorPromo}
                                                        </div>
                                                    )}

                                                </div>
                                                <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-[2rem] space-y-3">
                                                    {successPromo === promo.nombre_comercial ? (
                                                        <Button disabled className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-black h-12 text-md shadow-lg shadow-emerald-500/20">
                                                            Solicitud Enviada ✓
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onClick={() => handleRequestPromo(promo)}
                                                            disabled={loadingPromo === promo.nombre_comercial}
                                                            className="w-full rounded-2xl bg-[#8C65C9] hover:bg-[#7A54B4] text-white shadow-lg transition-transform active:scale-95 font-black h-12 text-md"
                                                        >
                                                            {loadingPromo === promo.nombre_comercial ? "Enviando Solicitud..." : "Solicitar Promoción"}
                                                        </Button>
                                                    )}

                                                    {matchingProviderId && (
                                                        <Link href={`/providers/${matchingProviderId}`} className="block w-full">
                                                            <Button
                                                                variant="outline"
                                                                className="w-full rounded-2xl border-[#8C65C9] text-[#8C65C9] hover:bg-[#8C65C9]/5 font-bold h-12 text-md"
                                                            >
                                                                Ver Perfil de la Clínica
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Card>
                                    </Dialog>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
                            <Tag className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No hay promociones en este momento</h3>
                            <p className="text-slate-500">Vuelve pronto para descubrir nuevos beneficios exclusivos.</p>
                        </div>
                    )}
                </div>
            </main>
        </div >
    )
}
