import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MapPin, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ProviderCardProps {
    provider: {
        id: string;
        name: string;
        specialty: string;
        image?: string;
        rating: number;
        locations: { address: string; agendaUrl?: string; city?: string; department?: string; country?: string }[];
    };
    variant?: "home" | "discover";
    className?: string;
    selectedCity?: string;
    selectedDepartment?: string;
    selectedCountry?: string;
}

export function ProviderCard({ provider, variant = "home", className, selectedCity, selectedDepartment, selectedCountry }: ProviderCardProps) {
    const isDiscover = variant === "discover";

    // Lógica para contar cuántas ubicaciones cumplen el filtro de ciudad/departamento
    const getSedeText = () => {
        let matchingLocations = provider.locations || [];

        if (selectedCountry) {
            matchingLocations = matchingLocations.filter(loc => loc.country === selectedCountry);
        }
        if (selectedDepartment && selectedDepartment !== "Todas") {
            matchingLocations = matchingLocations.filter(loc => loc.department === selectedDepartment);
        }
        if (selectedCity && selectedCity !== "Todas") {
            matchingLocations = matchingLocations.filter(loc => loc.city === selectedCity);
        }

        const count = matchingLocations.length;

        if (count > 1) {
            let areaName = "toda la red";
            if (selectedCity && selectedCity !== "Todas") areaName = selectedCity;
            else if (selectedDepartment && selectedDepartment !== "Todas") areaName = selectedDepartment;
            else if (selectedCountry === "CO") areaName = "Colombia";
            else if (selectedCountry === "PE") areaName = "Perú";

            return `${count} Sedes en ${areaName}`;
        } else if (count === 1) {
            return matchingLocations[0].address || 'Ofrece servicio aquí';
        } else {
            return provider.locations[0]?.address || 'Sin dirección';
        }
    };

    // Construir URL con params
    const buildProviderUrl = () => {
        const params = new URLSearchParams();
        if (selectedCity && selectedCity !== "Todas") params.append("city", selectedCity);
        if (selectedDepartment && selectedDepartment !== "Todas") params.append("department", selectedDepartment);

        const queryString = params.toString();
        return `/providers/${provider.id}${queryString ? `?${queryString}` : ''}`;
    }


    return (
        <Card className={cn("overflow-hidden border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_1px_0_rgba(255,255,255,0.4)] hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] group bg-white/95 backdrop-blur-xl h-full flex flex-col", className)}>
            <Link href={buildProviderUrl()} className="block relative h-44 bg-white/20 shrink-0 overflow-hidden">
                {provider.image ? (
                    <>
                        <img
                            src={provider.image}
                            alt={provider.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent flex items-center justify-center backdrop-blur-[2px] hidden">
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] opacity-60">Próximamente fotos</span>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent flex items-center justify-center backdrop-blur-[2px]">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] opacity-60">Próximamente fotos</span>
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-2xl px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-lg border border-white/40 text-slate-800 z-10">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    {provider.rating}
                </div>
            </Link>

            <CardContent className={cn("flex flex-col flex-1", isDiscover ? "p-6" : "p-5")}>
                <Link href={buildProviderUrl()} className={cn("space-y-4", isDiscover ? "flex-1" : "")}>
                    <div className="space-y-1">
                        <h3 className="font-black text-lg text-slate-900 group-hover:text-[#4C7DFF] transition-colors line-clamp-1 leading-tight">
                            {provider.name}
                        </h3>
                        <p className={cn("font-black uppercase tracking-[0.15em] text-[#8C65C9]", isDiscover ? "text-[10px]" : "text-xs")}>
                            {provider.specialty}
                        </p>
                    </div>

                    <div className={cn("flex items-center text-slate-500 font-medium mt-4 mb-2", isDiscover ? "text-xs bg-slate-50 p-2 rounded-lg" : "text-sm")}>
                        <MapPin className={cn("mr-2 text-[#4C7DFF] shrink-0", isDiscover ? "h-3.5 w-3.5 mr-1.5" : "h-4 w-4")} />
                        <span className="line-clamp-1">{getSedeText()}</span>
                    </div>
                </Link>

                {isDiscover ? (
                    <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                        <Badge variant="secondary" className="bg-[#FFF9E5] text-[#E6B400] border-none text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                            Crédito Welli
                        </Badge>
                        <Link href={buildProviderUrl()}>
                            <div className="h-8 w-8 rounded-full bg-[#4C7DFF]/5 flex items-center justify-center group-hover:bg-[#4C7DFF] group-hover:text-white transition-all text-slate-400">
                                <ChevronRight className="h-5 w-5" />
                            </div>
                        </Link>
                    </div>
                ) : (
                    <div className="pt-4 border-t border-white/30 flex items-center justify-between mt-auto">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Usa tu crédito Welli</span>
                        <Link href={buildProviderUrl()}>
                            <div className="flex items-center text-[#4C7DFF] font-black text-sm group-hover:translate-x-1 transition-transform">
                                Solicitar cita <ChevronRight className="h-4 w-4 ml-1" />
                            </div>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
