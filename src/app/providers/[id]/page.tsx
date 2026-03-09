"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { PROVIDERS, ALL_PROVIDERS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Star, Calendar, ShieldCheck, ArrowLeft, Heart, Share2, Info, Tag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import beneficiosData from "@/lib/data/beneficios.json"

interface ProviderLocation {
    name?: string;
    address: string;
    city?: string;
    department: string;
    url?: string;
    originalId?: string;
}

interface ProviderData {
    id: string;
    name: string;
    specialty: string;
    rating: number | string;
    reviews: number | string;
    procedures: string[];
    locations: ProviderLocation[];
    providerEmail?: string;
    banner?: string;
    logo?: string;
}

export default function ProviderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const providerId = params.id
    const provider = [...PROVIDERS, ...ALL_PROVIDERS].find(p => p.id === providerId) as ProviderData | undefined;

    const isMacro = provider?.id?.startsWith('macro-');

    const [user, setUser] = useState<Record<string, unknown> | null>(null)
    const [isRequesting, setIsRequesting] = useState(false)
    const [requestStatus, setRequestStatus] = useState<"idle" | "success" | "error">("idle")
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    // Params for filtering Sub-sedes
    const [urlDepartment, setUrlDepartment] = useState<string | null>(null);
    const [urlCity, setUrlCity] = useState<string | null>(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        setUrlDepartment(searchParams.get('department'));
        setUrlCity(searchParams.get('city'));
    }, []);

    const filteredLocations = provider?.locations ? provider.locations.filter(loc => {
        const matchDept = urlDepartment && urlDepartment !== "Todas" ? loc.department === urlDepartment : true;
        const matchCity = urlCity && urlCity !== "Todas" ? loc.city === urlCity : true;
        return matchDept && matchCity;
    }) : [];

    const activePromos = provider ? beneficiosData.filter(promo =>
        provider.name.toLowerCase().includes(promo.nombre_comercial.toLowerCase()) ||
        promo.nombre_comercial.toLowerCase().includes(provider.name.toLowerCase())
    ) : [];

    // Consultation Form States
    const [showConsultationForm, setShowConsultationForm] = useState(false)
    const [selectedProcedure, setSelectedProcedure] = useState<string>("")
    const [preferredTime, setPreferredTime] = useState<string>("")
    const [specificDate, setSpecificDate] = useState<string>("")
    const [comments, setComments] = useState<string>("")

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

    const handleRequest = async () => {
        if (!provider || !user) return;

        setIsRequesting(true);
        setRequestStatus("idle");

        try {
            const response = await fetch('/api/request-appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user,
                    provider,
                    providerEmail: provider.providerEmail,
                    procedure: selectedProcedure || 'Consulta General',
                    preferredTime: preferredTime === 'specific' ? specificDate : preferredTime,
                    comments: comments
                })
            });

            if (response.ok) {
                setRequestStatus("success");
                setShowSuccessModal(true);
            } else {
                setRequestStatus("error");
            }
        } catch (error) {
            console.error("Request failed", error);
            setRequestStatus("error");
        } finally {
            setIsRequesting(false);
        }
    }

    if (!provider) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <h2 className="text-2xl font-bold">Proveedor no encontrado</h2>
                <Link href="/discover">
                    <Button>Volver a la búsqueda</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-white pb-24">
            {/* Top Banner / Image */}
            <div className="relative h-64 md:h-96 bg-slate-100 overflow-hidden">
                {provider.banner ? (
                    <>
                        <img
                            src={provider.banner}
                            alt={`${provider.name} banner`}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-300 hidden" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-300" />
                )}
                <div className="absolute top-6 left-6 flex gap-2">
                    <Link href="/discover">
                        <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur border-none">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
                <div className="absolute top-6 right-6 flex gap-2">
                    <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur border-none">
                        <Share2 className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur border-none">
                        <Heart className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Profile Header */}
            <div className="px-6 -mt-10 relative z-10 max-w-4xl mx-auto w-full">
                <Card className="border-none shadow-xl rounded-3xl overflow-hidden p-6 bg-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{provider.name}</h1>
                                <ShieldCheck className="h-6 w-6 text-[#4C7DFF] fill-[#4C7DFF]/10 shrink-0" />
                            </div>

                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm font-medium text-slate-600">
                                <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    {provider.rating} ({provider.reviews} reseñas)
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    {filteredLocations.length > 1
                                        ? `${filteredLocations.length} Sedes disponibles`
                                        : filteredLocations[0]?.address
                                    }
                                </span>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <div className="bg-[#8C65C9]/10 text-[#8C65C9] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                    {provider.specialty}
                                </div>
                                <div className="bg-[#FFC800]/20 text-[#E6B400] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                    Paga con Welli
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:block">
                            <Image
                                src="/images/welli-brand-logo.png"
                                alt="Partner"
                                width={60}
                                height={60}
                                className="grayscale opacity-30"
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Details Sections */}
            <div className="px-6 py-10 max-w-4xl mx-auto w-full space-y-10">
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900">Sobre el centro</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Somos un centro médico especializado en {provider.specialty.toLowerCase()}, comprometidos con brindar atención de calidad y bienestar integral a nuestros pacientes. Contamos con tecnología de punta y un equipo profesional altamente calificado.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900">Servicios Destacados</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {provider.procedures.slice(0, 4).map((service, i) => (
                            <Card key={i} className="border-slate-100 shadow-none rounded-2xl p-4 flex items-center gap-4 bg-slate-50">
                                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <ShieldCheck className="h-5 w-5 text-[#4C7DFF]" />
                                </div>
                                <span className="font-semibold text-slate-700">{service}</span>
                            </Card>
                        ))}
                    </div>
                </section>

                {activePromos.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Tag className="h-6 w-6 text-[#FFC800]" />
                            <h2 className="text-xl font-bold text-slate-900">Promociones Vigentes</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activePromos.map((promo, i) => (
                                <Link href="/promociones" key={i}>
                                    <Card className="border border-slate-100 shadow-sm rounded-2xl p-0 overflow-hidden relative group cursor-pointer hover:border-[#FFC800] transition-colors">
                                        <div className="flex flex-col md:flex-row h-full">
                                            {promo.image && (
                                                <div className="w-full md:w-32 h-32 md:h-full shrink-0 relative bg-slate-100">
                                                    <img
                                                        src={promo.image}
                                                        alt={promo.nombre_descuento}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-4 flex flex-col justify-center flex-1 space-y-2 bg-white">
                                                <span className="inline-block bg-[#FFC800]/10 text-[#E6B400] text-xs font-black uppercase tracking-wider px-2 py-1 rounded-md self-start">
                                                    {promo.tipo_promocion} DCTO
                                                </span>
                                                <h3 className="font-bold text-slate-900 leading-tight line-clamp-2">
                                                    {promo.nombre_descuento}
                                                </h3>
                                                <p className="text-xs text-slate-500 font-medium">Click para ver detalles</p>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <section className="space-y-4" id="ubicaciones">
                    <h2 className="text-xl font-bold text-slate-900">Ubicaciones</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {filteredLocations.length === 0 ? (
                            <p className="text-slate-500 text-sm">No hay sedes en la ubicación seleccionada.</p>
                        ) : (
                            filteredLocations.map((loc, i) => (
                                <Card key={i} className="border-slate-100 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between bg-white hover:border-[#4C7DFF] transition-all group gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#4C7DFF]/5">
                                            <MapPin className="h-5 w-5 text-slate-400 group-hover:text-[#4C7DFF]" />
                                        </div>
                                        <div>
                                            {loc.name && <p className="font-bold text-slate-900">{loc.name}</p>}
                                            <p className="text-sm text-slate-700">{loc.address}</p>
                                            <p className="text-xs text-slate-500">{loc.city ? `${loc.city}, ` : ''}{loc.department}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-auto md:ml-0">
                                        {isMacro && loc.originalId && (
                                            <Link href={`/providers/${loc.originalId}`}>
                                                <Button variant="default" size="sm" className="bg-[#FFC800]/80 backdrop-blur-md hover:bg-[#E6B400] text-black shadow-lg shadow-[#FFC800]/20 font-bold rounded-xl h-9">
                                                    Agendar Aquí
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </section>


                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Información Welli</h2>
                        <Link href="/help" className="text-slate-400">
                            <Info className="h-5 w-5" />
                        </Link>
                    </div>
                    <Card className="bg-gradient-to-r from-[#8C65C9] to-[#4C7DFF] border-none rounded-3xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                                <Image src="/images/welli-logo-white.png" alt="Welli" width={30} height={30} />
                            </div>
                            <div>
                                <h4 className="font-bold">Financia tu tratamiento</h4>
                                <p className="text-xs opacity-80">Hasta 12 cuotas mensuales</p>
                            </div>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#FFC800]" />
                                Aprobación en minutos
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#FFC800]" />
                                Sin costos ocultos
                            </li>
                        </ul>
                    </Card>
                </section>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 p-6 z-40">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
                    {/* <div className="hidden sm:block">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Citas disponibles</span>
                        <p className="font-bold text-slate-900">Desde maňana, 8:00 AM</p>
                    </div> */}
                    {isMacro ? (
                        <Button
                            onClick={() => {
                                const section = document.getElementById('ubicaciones');
                                if (section) section.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full sm:flex-1 font-bold h-14 rounded-2xl text-lg shadow-lg gap-2 bg-[#FFC800]/80 backdrop-blur-md hover:bg-[#E6B400] text-black shadow-[#FFC800]/20"
                        >
                            Ver Sedes para Agendar
                        </Button>
                    ) : provider.providerEmail ? (
                        <>
                            <Button
                                onClick={() => setShowConsultationForm(true)}
                                disabled={isRequesting || !user || requestStatus === "success"}
                                className={`w-full sm:flex-1 font-bold h-14 rounded-2xl text-lg shadow-lg gap-2 ${requestStatus === "success"
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-[#FFC800]/80 backdrop-blur-md hover:bg-[#E6B400] text-black shadow-[#FFC800]/20"
                                    }`}
                            >
                                {isRequesting ? (
                                    <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : requestStatus === "success" ? (
                                    <ShieldCheck className="h-5 w-5" />
                                ) : (
                                    <Calendar className="h-5 w-5" />
                                )}
                                {requestStatus === "success" ? "Solicitud Enviada ✓" : "Solicitar Cita"}
                            </Button>
                            {requestStatus === "error" && (
                                <p className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-red-500 bg-white px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                                    Hubo un error al enviar. Intenta de nuevo.
                                </p>
                            )}
                        </>
                    ) : (
                        <Button className="w-full sm:flex-1 bg-[#FFC800] hover:bg-[#E6B400] text-black font-bold h-14 rounded-2xl text-lg shadow-lg gap-2 opacity-50 cursor-not-allowed">
                            <Calendar className="h-5 w-5" /> Solicitar cita (Próximamente)
                        </Button>
                    )}
                </div>
            </div >

            {/* Success Feedback Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md text-center p-8 bg-white border-none shadow-2xl rounded-3xl">
                    <DialogHeader className="flex flex-col items-center space-y-4">
                        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-2">
                            <ShieldCheck className="h-10 w-10 text-green-500" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-slate-900">
                            ¡Solicitud Enviada Exitosamente!
                        </DialogTitle>
                        <DialogDescription className="text-base text-slate-600 leading-relaxed font-medium">
                            Tu solicitud de beneficio fue enviada a la clínica. Te contactarán lo antes posible para agendar la cita y empezar a financiar tu bienestar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-8 flex justify-center w-full">
                        <Button
                            onClick={() => {
                                setShowSuccessModal(false)
                                router.push('/home')
                            }}
                            className="bg-[#4C7DFF] hover:bg-[#3b66df] text-white font-bold h-12 px-8 rounded-full"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a navegar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Consultation Request Form Dialog */}
            <Dialog open={showConsultationForm} onOpenChange={setShowConsultationForm}>
                <DialogContent className="sm:max-w-md bg-white border-none rounded-3xl shadow-2xl overflow-hidden p-0">
                    <div className="bg-gradient-to-r from-[#8C65C9] to-[#4C7DFF] p-6 text-white text-center">
                        <div className="mx-auto w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3">
                            <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black">
                            Detalles de tu cita
                        </DialogTitle>
                        <DialogDescription className="text-white/80 mt-1">
                            {provider.name}
                        </DialogDescription>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-800 ml-1">
                                ¿Qué procedimiento te interesa? *
                            </label>
                            <Select value={selectedProcedure} onValueChange={setSelectedProcedure}>
                                <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 bg-slate-50 font-medium">
                                    <SelectValue placeholder="Selecciona un procedimiento" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-[200px]">
                                    {provider.procedures?.length > 0 ? (
                                        <>
                                            <SelectItem value="Consulta General" className="font-medium">Consulta General / Valoración</SelectItem>
                                            {provider.procedures.map((proc: string) => (
                                                <SelectItem key={proc} value={proc} className="font-medium">
                                                    {proc}
                                                </SelectItem>
                                            ))}
                                        </>
                                    ) : (
                                        <SelectItem value="Consulta General" className="font-medium">Consulta General / Valoración</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-800 ml-1">
                                ¿Cuándo deseas sacar la cita? *
                            </label>
                            <Select value={preferredTime} onValueChange={setPreferredTime}>
                                <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 bg-slate-50 font-medium">
                                    <SelectValue placeholder="Selecciona una opción" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    <SelectItem value="Lo antes posible" className="font-medium">Lo antes posible</SelectItem>
                                    <SelectItem value="Esta semana" className="font-medium">Esta semana</SelectItem>
                                    <SelectItem value="La semana que viene" className="font-medium">La semana que viene</SelectItem>
                                    <SelectItem value="specific" className="font-medium">Especificar fecha</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {preferredTime === 'specific' && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <label className="text-sm font-bold text-slate-800 ml-1">
                                    Selecciona la fecha *
                                </label>
                                <input
                                    type="date"
                                    value={specificDate}
                                    onChange={(e) => setSpecificDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full h-12 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8C65C9] text-slate-900"
                                />
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-800 ml-1">
                                Cuéntanos un poco más (Opcional)
                            </label>
                            <Textarea
                                placeholder="Ej. Me duele una muela del lado izquierdo desde ayer..."
                                className="min-h-[100px] resize-none rounded-xl border-slate-200 bg-slate-50 p-4 focus-visible:ring-[#8C65C9] text-base"
                                value={comments}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComments(e.target.value)}
                            />
                        </div>

                        <Button
                            onClick={handleRequest}
                            disabled={isRequesting || !selectedProcedure || !preferredTime || (preferredTime === 'specific' && !specificDate)}
                            className="w-full bg-[#FFC800] hover:bg-[#E6B400] text-black font-black text-lg h-14 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                        >
                            {isRequesting ? (
                                <div className="h-5 w-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    Confirmar y Enviar
                                    <ShieldCheck className="h-5 w-5" />
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-center text-slate-500 font-medium">
                            Tus datos se enviarán de forma segura a la clínica para contactarte.
                        </p>
                    </div>
                </DialogContent>
            </Dialog >
        </div >
    )
}
