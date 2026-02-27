"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, Send, Star, MapPin, ChevronRight } from "lucide-react"
import { PROVIDERS } from "@/lib/constants"
import { useRouter } from "next/navigation"
import Image from "next/image"

type Message = {
    id: string
    text: string
    sender: "bot" | "user"
    functionCall?: Record<string, unknown>
    functionResponse?: Record<string, unknown>
}

// Reuse the new improved tokenized search logic
function searchProviders(procedure: string, city: string, zone: string) {
    const procLower = procedure?.toLowerCase() || ""
    const cityLower = city?.toLowerCase() || ""
    const zoneLower = zone?.toLowerCase() || ""

    const stopWords = ["cerca", "a", "de", "el", "la", "los", "las", "en", "por", "barrio", "sector", "zona", "al", "del", "un", "una"]
    const zoneTokens = zoneLower
        .split(/\s+/)
        .filter((word: string) => word.length > 2 && !stopWords.includes(word))

    let matches = PROVIDERS.filter(p => {
        const matchesProc = !procLower || p.procedures?.some((proc: string) => proc.toLowerCase().includes(procLower)) ||
            p.specialty.toLowerCase().includes(procLower) ||
            p.name.toLowerCase().includes(procLower)

        const matchesCity = !cityLower || p.locations.some(loc => loc.city?.toLowerCase().includes(cityLower) || loc.department?.toLowerCase().includes(cityLower))

        return matchesProc && matchesCity
    })

    if (zoneTokens.length > 0) {
        const exactMatches = matches.filter(p => {
            const addressMatch = p.locations.some(loc =>
                zoneTokens.some((token: string) => loc.address.toLowerCase().includes(token))
            )
            const nameMatch = zoneTokens.some((token: string) => p.name.toLowerCase().includes(token))
            return addressMatch || nameMatch
        })
        if (exactMatches.length > 0) matches = exactMatches
    }

    return matches;
}

export default function AssistantPage() {
    const router = useRouter()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [recommendedProviders, setRecommendedProviders] = useState<typeof PROVIDERS>([])

    // Initial message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: "init",
                    text: "Hola, soy Claud.ia ✨, tu asistente personal de salud en Welli. ¿Qué tipo de procedimiento o especialidad estás buscando?",
                    sender: "bot"
                }
            ])
        }
    }, [messages.length])

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return

        const userText = inputValue.trim()

        if (userText.toLowerCase() === "reiniciar") {
            setMessages([{
                id: Date.now().toString(),
                text: "¡Hola de nuevo! ✨ ¿En qué puedo ayudarte ahora?",
                sender: "bot"
            }])
            setInputValue("")
            setRecommendedProviders([])
            return
        }

        const newUserMsg: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: "user"
        }

        const currentMessages = [...messages, newUserMsg]
        setMessages(currentMessages)
        setInputValue("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: currentMessages.map(m => ({
                        sender: m.sender,
                        text: m.text,
                        functionCall: m.functionCall,
                        functionResponse: m.functionResponse
                    }))
                })
            })

            const data = await response.json()

            if (data.type === "text") {
                setMessages(prev => [...prev, {
                    id: Date.now().toString() + "-bot",
                    text: data.text,
                    sender: "bot"
                }])
            } else if (data.type === "tool_call" && data.functionCall.name === "findProviders") {
                const { procedure, city, zone } = data.functionCall.args
                const matches = searchProviders(procedure, city, zone)

                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now().toString() + "-bot-tool",
                        text: `Buscando especialistas en ${procedure} por ${zone ? zone + ', ' : ''}${city}...`,
                        sender: "bot",
                        functionCall: data.functionCall.args
                    }
                ])

                setTimeout(() => {
                    if (matches.length > 0) {
                        setRecommendedProviders(matches.slice(0, 6)) // Show top 6 matches
                        setMessages(prev => [
                            ...prev,
                            {
                                id: Date.now().toString() + "-bot-results",
                                text: `¡Encontré estas excelentes opciones para ti! Las puedes ver aquí al lado 👉`,
                                sender: "bot",
                                functionResponse: { status: "success", providersFound: matches.length }
                            }
                        ])
                    } else {
                        setRecommendedProviders([])
                        setMessages(prev => [
                            ...prev,
                            {
                                id: Date.now().toString() + "-bot-results",
                                text: "Lo siento mucho, no encontré especialistas exactos con esos criterios. ¿Deseas que busquemos en otra ciudad o con otros términos?",
                                sender: "bot",
                                functionResponse: { status: "not_found", providersFound: 0 }
                            }
                        ])
                    }
                }, 800)
            }

        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, {
                id: Date.now().toString() + "-bot-err",
                text: "Ocurrió un error al conectarme. Por favor intenta de nuevo.",
                sender: "bot"
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-80px)] pt-8 pb-16 px-6 lg:px-12 flex flex-col md:flex-row gap-8 max-w-[1600px] mx-auto">
            {/* Left Panel: Copilot Chat */}
            <div className="w-full md:w-[400px] lg:w-[450px] shrink-0 flex flex-col bg-white rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-[#8C65C9]/20 overflow-hidden h-[calc(100vh-140px)]">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#8C65C9] to-[#4C7DFF] p-5 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                            <Sparkles className="h-6 w-6 text-[#FFC800]" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl leading-tight tracking-tight">Claud.ia Copilot</h3>
                            <p className="text-sm font-medium text-white/90">Inteligencia Artificial Médica</p>
                        </div>
                    </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                            {msg.sender === "bot" && (
                                <div className="h-10 w-10 md:h-8 md:w-8 rounded-full bg-gradient-to-r from-[#8C65C9] to-[#4C7DFF] flex items-center justify-center shrink-0 mr-3 mt-auto text-white shadow-md border-2 border-white">
                                    <Sparkles className="h-4 w-4 md:h-3 md:w-3" />
                                </div>
                            )}

                            <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${msg.sender === "user" ? "bg-[#4C7DFF] text-white rounded-br-sm" : "bg-white text-slate-700 border border-slate-100 rounded-bl-sm"}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="h-10 w-10 md:h-8 md:w-8 rounded-full bg-gradient-to-r from-[#8C65C9] to-[#4C7DFF] flex items-center justify-center shrink-0 mr-3 mt-auto text-white shadow-md border-2 border-white">
                                <Sparkles className="h-4 w-4 md:h-3 md:w-3 animate-spin-slow" />
                            </div>
                            <div className="bg-white border border-slate-100 rounded-[1.5rem] rounded-bl-sm px-5 py-4 flex items-center gap-1.5 shadow-sm">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100 shrink-0 relative z-10">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="Escribe tu consulta médica aquí..."
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                            className="flex-1 bg-slate-50 border border-slate-100 h-14 rounded-full px-5 pr-14 text-[15px] text-slate-800 outline-none focus:ring-2 focus:ring-[#8C65C9]/30 transition-shadow placeholder:text-slate-400"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            className={`absolute right-2 h-10 w-10 rounded-full flex items-center justify-center text-slate-900 transition-all shadow-sm ${!inputValue.trim() || isLoading ? 'bg-slate-200 opacity-50' : 'bg-[#FFC800] hover:scale-105 active:scale-95'}`}
                        >
                            <Send className="h-4 w-4 ml-0.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel: Recommendations Grid */}
            <div className="flex-1 flex flex-col h-[calc(100vh-140px)]">
                <div className="mb-6 space-y-2 shrink-0">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Opciones para ti</h1>
                    <p className="text-slate-500 font-medium">Habla con Claud.ia y ella irá agrupando aquí a los mejores especialistas acordes a tus necesidades.</p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-10 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {recommendedProviders.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-4">
                            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6">
                                <Sparkles className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-400 mb-2">Aún no hay recomendaciones</h3>
                            <p className="text-slate-400 max-w-sm">Cuéntale a Claud.ia en el panel izquierdo qué estás buscando (procedimiento, ciudad y zona).</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {recommendedProviders.map((provider) => (
                                <div
                                    key={provider.id}
                                    onClick={() => router.push(`/providers/${provider.id}`)}
                                    className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all active:scale-[0.98] group flex flex-col"
                                >
                                    <div className="relative h-48 bg-slate-100 shrink-0 overflow-hidden">
                                        {provider.image ? (
                                            <img
                                                src={provider.image}
                                                alt={provider.name}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Star className="h-8 w-8 text-slate-300" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm border border-white/20">
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> {provider.rating}
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div className="space-y-3">
                                            <div>
                                                <span className="inline-block px-3 py-1 rounded-full bg-[#8C65C9]/10 text-[#8C65C9] text-[10px] font-black uppercase tracking-wider mb-3">
                                                    {provider.specialty}
                                                </span>
                                                <h3 className="text-lg font-black text-slate-900 line-clamp-2 leading-tight group-hover:text-[#4C7DFF] transition-colors">{provider.name}</h3>
                                            </div>

                                            <div className="flex items-start text-slate-500 text-sm">
                                                <MapPin className="h-4 w-4 mr-2 text-slate-400 shrink-0 mt-0.5" />
                                                <span className="line-clamp-2 font-medium">{provider.locations[0]?.address}, {provider.locations[0]?.city}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                                            <span className="font-bold text-slate-400">Ver detalles</span>
                                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#4C7DFF] group-hover:text-white transition-colors">
                                                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
