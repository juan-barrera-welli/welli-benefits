"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Calendar, Stethoscope, Tag, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface UserRequest {
    id: string;
    providerName: string;
    procedureOrPromo: string;
    category: string;
    timestamp: string;
    status: string;
    comments?: string;
}

export default function MisSolicitudesPage() {
    const router = useRouter()
    const [user, setUser] = useState<Record<string, unknown> | null>(null)
    const [requests, setRequests] = useState<UserRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const storedUser = localStorage.getItem("welli_user")
        if (!storedUser) {
            router.push("/login")
            return
        }

        try {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)
            fetchUserRequests(parsedUser)
        } catch (e) {
            console.error("Failed to parse user", e)
            router.push("/login")
        }
    }, [router])

    const fetchUserRequests = async (userData: Record<string, unknown>) => {
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/user-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    numeroDoc: userData.numero_doc,
                    email: userData.correo_electronico,
                })
            })

            if (!res.ok) throw new Error("Error al cargar el historial.")

            const json = await res.json()
            if (json.success) {
                setRequests(json.data || [])
            } else {
                throw new Error(json.message || "Error al procesar los datos.")
            }
        } catch (err: unknown) {
            console.error(err)
            const errorObj = err as Error;
            setError(errorObj.message || "No se pudo cargar tu historial de solicitudes en este momento.")
        } finally {
            setIsLoading(false)
        }
    }

    const getCategoryIcon = (category: string) => {
        const lowerCat = category.toLowerCase()
        if (lowerCat.includes("promoción") || lowerCat.includes("promo")) return <Tag className="h-5 w-5 text-purple-600" />
        return <Stethoscope className="h-5 w-5 text-blue-600" />
    }

    const getCategoryColor = (category: string) => {
        const lowerCat = category.toLowerCase()
        if (lowerCat.includes("promoción") || lowerCat.includes("promo")) return "bg-purple-100 text-purple-800 border-purple-200"
        return "bg-blue-100 text-blue-800 border-blue-200"
    }

    if (!user) return null

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
                        Mis Solicitudes
                    </h1>
                    <p className="text-md md:text-lg opacity-90 font-bold text-slate-800">
                        Historial de tus citas y promociones solicitadas en Welli.
                    </p>
                </div>
            </section>

            <main className="flex-1 px-4 md:px-6 pb-20 relative z-20 max-w-4xl mx-auto w-full">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC800]"></div>
                        <p className="text-slate-500 font-medium tracking-tight">Cargando tu historial...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 text-center shadow-sm">
                        <p className="font-medium text-lg">{error}</p>
                        <Button
                            variant="outline"
                            className="mt-4 border-red-200 text-red-700 hover:bg-red-100"
                            onClick={() => fetchUserRequests(user)}
                        >
                            Intentar Nuevamente
                        </Button>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border shadow-sm flex flex-col items-center justify-center">
                        <div className="bg-slate-100 p-6 rounded-full inline-flex mb-6">
                            <Clock className="h-12 w-12 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">No tienes solicitudes aún</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-8">
                            Cuando solicites una cita con uno de nuestros aliados o pidas información sobre una promoción, aparecerá aquí.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                            <Link href="/discover" className="w-full sm:w-auto">
                                <Button className="w-full bg-[#1A1A1A] hover:bg-black text-white rounded-full font-bold px-8 h-12 shadow-md">
                                    Ver Aliados
                                </Button>
                            </Link>
                            <Link href="/promociones" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full rounded-full font-bold px-8 h-12 border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-slate-50">
                                    Ver Promociones
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2 mb-6">
                            <p className="text-slate-600 font-medium">Tienes <span className="font-bold text-slate-900">{requests.length}</span> solicitudes registradas</p>
                        </div>

                        {requests.map((req) => (
                            <Card key={req.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl group">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row md:items-center">
                                        <div className="p-6 flex-1 flex flex-col md:flex-row md:items-center gap-4">
                                            {/* Icon Type */}
                                            <div className="hidden md:flex rounded-full bg-slate-100 p-4 shrink-0 transition-colors group-hover:bg-[#FFC800]/10">
                                                {getCategoryIcon(req.category)}
                                            </div>

                                            <div className="space-y-1 w-full">
                                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 w-full">
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getCategoryColor(req.category)}`}>
                                                        {req.category || 'General'}
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-500 flex items-center bg-slate-100 px-2 py-1 rounded-md">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        {req.timestamp.split(',')[0]}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                                    {req.providerName}
                                                </h3>
                                                <p className="text-sm font-semibold text-slate-700">
                                                    {req.procedureOrPromo}
                                                </p>
                                                {req.comments && (
                                                    <p className="text-sm text-slate-500 italic mt-1 bg-white/50 p-2 rounded-md border border-slate-100">
                                                        &quot;{req.comments}&quot;
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Sidebar */}
                                        <div className="bg-slate-50 md:bg-transparent border-t md:border-t-0 md:border-l border-slate-100 p-4 md:p-6 md:w-48 shrink-0 flex items-center md:justify-center">
                                            <div className="flex items-center text-green-600 font-semibold text-sm">
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Enviada
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
