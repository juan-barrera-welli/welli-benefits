"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Mail, Phone, User as UserIcon, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ReferPage() {
    const [user, setUser] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

    const [formData, setFormData] = useState({
        colleagueName: "",
        colleagueEmail: "",
        colleaguePhone: ""
    })

    useEffect(() => {
        const storedUser = localStorage.getItem("welli_user")
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (e) {
                console.error("Failed to parse user", e)
            }
        }
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !formData.colleagueName || !formData.colleagueEmail) return

        setIsSubmitting(true)
        setStatus("idle")

        try {
            const response = await fetch('/api/referral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    referrerName: user.nombre || 'Un colega',
                    ...formData
                })
            })

            if (response.ok) {
                setStatus("success")
                setFormData({ colleagueName: "", colleagueEmail: "", colleaguePhone: "" })
            } else {
                setStatus("error")
            }
        } catch (error) {
            console.error("Failed to send referral", error)
            setStatus("error")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
            {/* Header Banner */}
            <div className="relative h-64 bg-gradient-to-tr from-[#8C65C9] to-[#4C7DFF] overflow-hidden flex items-center justify-center">
                <div className="absolute top-6 left-6">
                    <Link href="/home">
                        <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/20">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                </div>

                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#FFC800]/20 rounded-full blur-3xl mix-blend-overlay"></div>

                <div className="relative z-10 text-center px-4">
                    <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ring-1 ring-white/30">
                        <Users className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                        Refiere un Colega
                    </h1>
                    <p className="text-white/80 font-medium mt-2 max-w-md mx-auto">
                        Invita a tus compañeros a unirse a Welli Benefits para que también puedan financiar su bienestar.
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <div className="px-6 -mt-10 relative z-20 max-w-2xl mx-auto w-full">
                <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl">
                    <CardContent className="p-8">
                        {status === "success" ? (
                            <div className="text-center py-10 animate-in fade-in slide-in-from-bottom-4">
                                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">¡Invitación Enviada!</h2>
                                <p className="text-slate-600 mb-8">
                                    Le hemos enviado un correo a tu colega con toda la información sobre Welli Benefits.
                                </p>
                                <Button
                                    onClick={() => setStatus("idle")}
                                    className="bg-[#4C7DFF] hover:bg-[#3b66df] text-white font-bold h-12 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                                >
                                    Enviar otra invitación
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900 ml-1">
                                        Nombre Completo de tu Colega *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            name="colleagueName"
                                            value={formData.colleagueName}
                                            onChange={handleChange}
                                            placeholder="Ej. María Pérez"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4C7DFF] focus:border-transparent transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900 ml-1">
                                        Correo Electrónico *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            required
                                            type="email"
                                            name="colleagueEmail"
                                            value={formData.colleagueEmail}
                                            onChange={handleChange}
                                            placeholder="maria@empresa.com"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8C65C9] focus:border-transparent transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900 ml-1">
                                        Número de Celular (Opcional)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="colleaguePhone"
                                            value={formData.colleaguePhone}
                                            onChange={handleChange}
                                            placeholder="300 000 0000"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC800] focus:border-transparent transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                {status === "error" && (
                                    <div className="bg-red-50 text-red-600 text-sm font-medium p-4 rounded-xl text-center border border-red-100">
                                        Hubo un problema al enviar la invitación. Por favor intenta de nuevo.
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !formData.colleagueName || !formData.colleagueEmail}
                                    className="w-full bg-[#FFC800] hover:bg-[#E6B400] text-black font-black text-lg h-16 rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group mt-4 relative overflow-hidden"
                                >
                                    {isSubmitting ? (
                                        <div className="h-6 w-6 border-3 border-black/20 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span className="relative z-10 flex items-center gap-2">
                                                <Mail className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                                                Enviar Invitación
                                            </span>
                                            {/* Button shine effect */}
                                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shimmer z-0" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
