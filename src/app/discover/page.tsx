"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useMemo, Suspense, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CATEGORIES, PROVIDERS, ALL_PROVIDERS, DEPARTMENTS, PROCEDURES } from "@/lib/constants"
import { Search, MapPin, Star, ChevronRight, SlidersHorizontal, Map as MapIcon, List, Globe, Check, ChevronsUpDown } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ProviderCard } from "@/components/ui/provider-card"
import type { Provider } from "@/types/provider"
import Fuse from "fuse.js"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function DiscoverContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialCategory = searchParams.get("category") || ""
    const initialQuery = searchParams.get("q") || ""

    const [searchQuery, setSearchQuery] = useState(initialQuery)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(initialCategory)
    const [selectedCountry, setSelectedCountry] = useState<"CO" | "PE">("CO")
    const [selectedDepartment, setSelectedDepartment] = useState("Todas")
    const [openDept, setOpenDept] = useState(false)
    const [selectedCity, setSelectedCity] = useState("Todas")
    const [openCity, setOpenCity] = useState(false)
    const [selectedProcedure, setSelectedProcedure] = useState("Todos")
    const [openProcedure, setOpenProcedure] = useState(false)
    const [isGrouped, setIsGrouped] = useState(true)
    const [sortOrder, setSortOrder] = useState<"A-Z" | "Z-A" | "Relevancia">("Relevancia")

    const searchSuggestions = searchQuery.length >= 3
        ? new Fuse(PROVIDERS, {
            keys: ["name", "specialty", "category", "description", "procedures"],
            threshold: 0.4,
            ignoreLocation: true
        }).search(searchQuery).map(res => res.item).slice(0, 5)
        : [];

    const handleSuggestionClick = (providerId: string) => {
        router.push(`/providers/${providerId}`)
    }


    useEffect(() => {
        setSelectedProcedure("Todos")
        setSelectedCity("Todas")
    }, [selectedCategory, selectedDepartment])

    // Derive dynamic filter options from data
    const dynamicDepartments = useMemo(() => {
        const depts = new Set<string>()
        PROVIDERS.forEach(p => {
            p.locations.forEach(loc => {
                if (loc.country === selectedCountry && loc.department) {
                    depts.add(loc.department)
                }
            })
        })
        return Array.from(depts).sort()
    }, [selectedCountry])

    const dynamicCities = useMemo(() => {
        const cities = new Set<string>()
        PROVIDERS.forEach(p => {
            p.locations.forEach(loc => {
                if (loc.country === selectedCountry &&
                    (selectedDepartment === "Todas" || loc.department === selectedDepartment) &&
                    loc.city) {
                    cities.add(loc.city)
                }
            })
        })
        return Array.from(cities).sort()
    }, [selectedCountry, selectedDepartment])

    const dynamicProcedures = useMemo(() => {
        const procs = new Set<string>()
        PROVIDERS.forEach(p => {
            if (!selectedCategory || p.category === selectedCategory) {
                p.procedures?.forEach(proc => {
                    if (proc) procs.add(proc)
                })
            }
        })
        return Array.from(procs).sort()
    }, [selectedCategory])

    const filteredProviders = useMemo(() => {
        let baseProviders = isGrouped ? PROVIDERS : ALL_PROVIDERS;

        // Apply fuzzy search if a query exists
        if (searchQuery.trim().length > 0) {
            const fuse = new Fuse(baseProviders, {
                keys: ["name", "specialty", "category", "description", "procedures"],
                threshold: 0.3,
                ignoreLocation: true
            });
            baseProviders = fuse.search(searchQuery.trim()).map(res => res.item);
        }

        const filtered = baseProviders.filter((provider) => {
            const matchesCategory = selectedCategory ? provider.category === selectedCategory : true

            // Check if any location matches country, department, and city
            const matchesLocation = provider.locations.some(loc => {
                const countryMatch = loc.country === selectedCountry
                const deptMatch = selectedDepartment === "Todas" ? true : loc.department === selectedDepartment
                const cityMatch = selectedCity === "Todas" ? true : loc.city === selectedCity
                return countryMatch && deptMatch && cityMatch
            })

            const matchesProcedure = selectedProcedure === "Todos" ? true : (provider as Provider).procedures?.includes(selectedProcedure)

            return matchesCategory && matchesLocation && matchesProcedure
        })

        // Apply sorting
        if (sortOrder === "A-Z") {
            filtered.sort((a, b) => a.name.localeCompare(b.name))
        } else if (sortOrder === "Z-A") {
            filtered.sort((a, b) => b.name.localeCompare(a.name))
        }

        return filtered;
    }, [searchQuery, selectedCategory, selectedCountry, selectedDepartment, selectedCity, selectedProcedure, isGrouped, sortOrder])

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
            {/* Header Search & Filters */}
            <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200 sticky top-[60px] md:top-[72px] z-40 px-6 py-4 shadow-sm transition-all">
                <div className="w-full space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative w-full md:w-80 shrink-0 z-40">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                                placeholder="Buscar clínica o especialidad..."
                                className="pl-16 h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-[#4C7DFF]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />

                            {/* Dropdown Suggestions */}
                            {showSuggestions && searchQuery.length >= 3 && (
                                <div className="absolute top-[110%] left-0 right-0 bg-white shadow-xl rounded-xl border border-slate-100 overflow-hidden text-left z-50">
                                    {searchSuggestions.length > 0 ? (
                                        <ul className="py-2">
                                            {searchSuggestions.map((p) => (
                                                <li
                                                    key={p.id}
                                                    onClick={() => handleSuggestionClick(p.id)}
                                                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                                                >
                                                    <div className="h-8 w-8 shrink-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                                                        {p.image ? (
                                                            <img
                                                                src={p.image}
                                                                alt={p.name}
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                            />
                                                        ) : (
                                                            <Star className="h-3 w-3 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-900 text-sm truncate">{p.name}</p>
                                                        <p className="text-xs text-slate-500 truncate">{p.specialty}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-sm text-slate-500">
                                            No se encontraron aliados para &quot;{searchQuery}&quot;
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-1 gap-2 overflow-x-auto pb-2 scrollbar-none items-center [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden">
                            <Select value={selectedCategory} onValueChange={(val: string) => setSelectedCategory(val === "todas" ? "" : val)}>
                                <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl min-w-[150px]">
                                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                                        <List className="h-4 w-4 text-[#8C65C9]" />
                                        <SelectValue placeholder="Categoría" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl max-h-80">
                                    <SelectItem value="todas">Todas las categorías</SelectItem>
                                    {CATEGORIES.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={sortOrder} onValueChange={(val: any) => setSortOrder(val)}>
                                <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl min-w-[140px]">
                                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                                        <SlidersHorizontal className="h-4 w-4 text-[#8C65C9]" />
                                        <SelectValue placeholder="Ordenar" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="Relevancia">Relevancia</SelectItem>
                                    <SelectItem value="A-Z">Alfabético (A-Z)</SelectItem>
                                    <SelectItem value="Z-A">Alfabético (Z-A)</SelectItem>
                                </SelectContent>
                            </Select>

                            <Popover open={openDept} onOpenChange={setOpenDept}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openDept}
                                        className="h-11 bg-slate-50 border-slate-200 rounded-xl min-w-[200px] justify-between text-slate-700 font-semibold hover:bg-slate-100"
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <MapPin className="h-4 w-4 text-[#8C65C9] shrink-0" />
                                            <span className="truncate">{selectedDepartment === "Todas" ? "Departamento" : selectedDepartment}</span>
                                        </div>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[250px] p-0 rounded-xl">
                                    <Command>
                                        <CommandInput placeholder="Buscar departamento..." />
                                        <CommandList>
                                            <CommandEmpty>No se encontró.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="Todas"
                                                    onSelect={() => {
                                                        setSelectedDepartment("Todas")
                                                        setOpenDept(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedDepartment === "Todas" ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    Todos los Deptos
                                                </CommandItem>
                                                {dynamicDepartments.map(dept => (
                                                    <CommandItem
                                                        key={dept}
                                                        value={dept}
                                                        onSelect={() => {
                                                            setSelectedDepartment(dept)
                                                            setOpenDept(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedDepartment === dept ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {dept}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <Popover open={openCity} onOpenChange={setOpenCity}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCity}
                                        className="h-11 bg-slate-50 border-slate-200 rounded-xl min-w-[150px] justify-between text-slate-700 font-semibold hover:bg-slate-100"
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <MapIcon className="h-4 w-4 text-[#4C7DFF] shrink-0" />
                                            <span className="truncate">{selectedCity === "Todas" ? "Ciudad" : selectedCity}</span>
                                        </div>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[250px] p-0 rounded-xl">
                                    <Command>
                                        <CommandInput placeholder="Buscar ciudad..." />
                                        <CommandList>
                                            <CommandEmpty>No se encontró.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="Todas"
                                                    onSelect={() => {
                                                        setSelectedCity("Todas")
                                                        setOpenCity(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedCity === "Todas" ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    Todas las Ciudades
                                                </CommandItem>
                                                {dynamicCities.map(city => (
                                                    <CommandItem
                                                        key={city}
                                                        value={city}
                                                        onSelect={() => {
                                                            setSelectedCity(city)
                                                            setOpenCity(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedCity === city ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {city}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <Popover open={openProcedure} onOpenChange={setOpenProcedure}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openProcedure}
                                        className="h-11 bg-slate-50 border-slate-200 rounded-xl min-w-[220px] justify-between text-slate-700 font-semibold hover:bg-slate-100"
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <div className="h-4 w-4 rounded-full bg-[#FFC800]/20 flex items-center justify-center shrink-0">
                                                <div className="h-1.5 w-1.5 rounded-full bg-[#FFC800]" />
                                            </div>
                                            <span className="truncate">{selectedProcedure === "Todos" ? "Procedimiento" : selectedProcedure}</span>
                                        </div>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[280px] p-0 rounded-xl">
                                    <Command>
                                        <CommandInput placeholder="Buscar procedimiento..." />
                                        <CommandList>
                                            <CommandEmpty>No se encontró.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="Todos"
                                                    onSelect={() => {
                                                        setSelectedProcedure("Todos")
                                                        setOpenProcedure(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedProcedure === "Todos" ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    Todos los Procedimientos
                                                </CommandItem>
                                                {dynamicProcedures.map(proc => (
                                                    <CommandItem
                                                        key={proc}
                                                        value={proc}
                                                        onSelect={() => {
                                                            setSelectedProcedure(proc)
                                                            setOpenProcedure(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedProcedure === proc ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {proc}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-8 flex-1">
                <div className="w-full h-full flex flex-col space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                {selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory)?.name : "Todas las Categorías"}
                            </h1>
                            <p className="text-sm font-bold text-slate-500">
                                {filteredProviders.length} Aliados en {selectedDepartment === "Todas" ? (selectedCountry === "CO" ? "Colombia" : "Perú") : selectedDepartment}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${isGrouped ? 'text-slate-900' : 'text-slate-500'}`}>Agrupar por Empresa</span>
                                <button
                                    onClick={() => setIsGrouped(!isGrouped)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C65C9] focus-visible:ring-offset-2 ${isGrouped ? 'bg-[#8C65C9]' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isGrouped ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <Button variant="outline" className="rounded-xl border-slate-200 gap-2 h-10 font-bold text-slate-600 hidden md:flex">
                                <SlidersHorizontal className="h-4 w-4" /> Filtros Avanzados
                            </Button>
                        </div>
                    </div>

                    {filteredProviders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProviders.map((provider) => (
                                <ProviderCard
                                    key={provider.id}
                                    provider={provider}
                                    variant="discover"
                                    selectedCity={selectedCity}
                                    selectedDepartment={selectedDepartment}
                                    selectedCountry={selectedCountry}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center space-y-4">
                            <div className="text-7xl animate-bounce">🕵️</div>
                            <h3 className="text-xl font-bold text-slate-900">No encontramos proveedores aquí</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                Aún no tenemos cobertura en esta zona, pero estamos creciendo rápido. Intenta otra ubicación.
                            </p>
                            <Button
                                variant="link"
                                className="text-[#4C7DFF] font-bold text-lg"
                                onClick={() => { setSearchQuery(""); setSelectedCategory(""); setSelectedDepartment("Todas") }}
                            >
                                Ver todos los resultados
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div >
    )
}

export default function DiscoverPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="h-12 w-12 border-4 border-[#4C7DFF] border-t-transparent rounded-full animate-spin" />
                <p className="font-bold text-slate-500">Localizando especialistas...</p>
            </div>
        }>
            <DiscoverContent />
        </Suspense>
    )
}
