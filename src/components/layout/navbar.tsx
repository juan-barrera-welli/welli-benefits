"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, memo } from "react"
import { Sparkles, Menu, X, ArrowLeft } from "lucide-react"
import { ProfileMenu } from "./ProfileMenu"
import { cn } from "@/lib/utils"

interface NavbarProps {
    backHref?: string
    showMenu?: boolean
    className?: string
}

import { usePathname } from "next/navigation"

export const Navbar = memo(function Navbar({ backHref, showMenu = true, className }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const pathname = usePathname()
    const isLoginPage = pathname === "/"

    useEffect(() => {
        const loadUser = () => {
            const storedUser = localStorage.getItem("welli_user")
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser))
                } catch (e) {
                    console.error("Error parsing user context", e)
                }
            } else {
                setUser(null)
            }
            setIsLoading(false)
        }

        // Initial load
        loadUser()

        // Listen for standard storage events (e.g. login/logout from another tab)
        window.addEventListener("storage", loadUser)

        // Listen for our custom login event (triggered in the same tab)
        window.addEventListener("welli_user_updated", loadUser)

        return () => {
            window.removeEventListener("storage", loadUser)
            window.removeEventListener("welli_user_updated", loadUser)
        }
    }, [])

    return (
        <header className={cn("sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm w-full", className)}>
            <div className="flex items-center gap-3 md:gap-6 shrink-0">
                {showMenu && !isLoginPage && (
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="h-9 w-9 md:h-10 md:w-10 flex items-center justify-center bg-black/5 backdrop-blur-md border border-white/20 rounded-full hover:bg-black/10 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.05)] active:scale-90 md:hidden flex-shrink-0"
                    >
                        {isMenuOpen ? <X className="h-5 w-5 text-slate-600" /> : <Menu className="h-5 w-5 text-slate-600" />}
                    </button>
                )}
                {backHref && (
                    <Link href={backHref} className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                )}
                <Link href={isLoginPage ? "/" : "/home"} className="relative h-8 w-24">
                    <Image
                        src="/images/welli-brand-logo.png"
                        alt="Welli Logo"
                        fill
                        style={{ objectFit: "contain" }}
                        className="brightness-0"
                    />
                </Link>

                {showMenu && !isLoginPage && (
                    <div className="hidden md:flex items-center gap-6 ml-4">
                        <Link href="/home" className={`text-sm transition-colors ${pathname === '/home' ? 'text-[#8C65C9] font-black' : 'text-slate-600 font-semibold hover:text-slate-900'}`}>
                            Inicio
                        </Link>
                        <Link href="/discover" className={`text-sm transition-colors ${pathname === '/discover' ? 'text-[#8C65C9] font-black' : 'text-slate-600 font-semibold hover:text-[#8C65C9]'}`}>
                            Nuestros Aliados
                        </Link>
                        <Link href="/promociones" className={`text-sm transition-colors ${pathname === '/promociones' ? 'text-[#8C65C9] font-black' : 'text-slate-600 font-semibold hover:text-[#8C65C9]'}`}>
                            Promociones
                        </Link>
                        <Link href="/referir" className={`text-sm transition-colors ${pathname === '/referir' ? 'text-[#8C65C9] font-black' : 'text-slate-600 font-semibold hover:text-[#8C65C9]'}`}>
                            Referir un Colega
                        </Link>
                        <Link href="/assistant" className="flex items-center text-sm font-bold text-white bg-gradient-to-r from-[#8C65C9] to-[#4C7DFF] hover:shadow-md px-4 py-2 rounded-full transition-all active:scale-95 shadow-[0_4px_12px_rgba(76,125,255,0.2)]">
                            <Sparkles className="h-4 w-4 mr-1.5" /> Recomendaciones con IA
                        </Link>
                    </div>
                )}
            </div>

            {showMenu && !isLoginPage && (
                <div className="flex items-center gap-2">
                    {isLoading ? (
                        <div className="flex items-center bg-slate-100 rounded-full pl-4 pr-1 py-1 border border-slate-200 shadow-sm h-[40px] md:h-[48px]">
                            <div className="hidden md:block w-20 h-6 bg-slate-200 rounded-md animate-pulse mr-3 border-r border-slate-300 pr-3" />
                            <div className="w-16 md:w-20 h-6 bg-slate-200 rounded-md animate-pulse" />
                            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse ml-2 md:ml-3 shrink-0" />
                        </div>
                    ) : user ? (
                        <div className="flex items-center bg-slate-100 rounded-full pl-3 pr-1 md:pl-4 md:pr-1.5 py-1 md:py-1.5 border border-slate-200 shadow-sm animate-in fade-in max-w-full overflow-hidden shrink">
                            <div className="hidden md:flex flex-col mr-3 border-r border-slate-300 pr-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Hola,</span>
                                <span className="text-sm font-black text-slate-800 leading-tight truncate max-w-[100px]">{user.nombre?.split(' ')[0]}</span>
                            </div>
                            <div className="flex flex-col items-end md:items-start shrink">
                                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Monto Máximo</span>
                                <span className="text-xs md:text-sm font-black text-[#8C65C9] leading-tight truncate max-w-[80px] md:max-w-none">{user.monto_maximo ? `$${Number(user.monto_maximo).toLocaleString('es-CO')}` : '$0'}</span>
                            </div>
                            <div className="ml-2 md:ml-3 flex-shrink-0">
                                <ProfileMenu user={user} onUserUpdate={setUser} />
                            </div>
                        </div>
                    ) : (
                        <Link href="/home" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
                            Mi Cuenta
                        </Link>
                    )}
                </div>
            )}

            {/* Glass Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white/80 backdrop-blur-xl border-b border-white/20 p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300 z-50">
                    <nav className="flex flex-col gap-4">
                        <Link href="/assistant" className="text-lg font-bold text-white flex items-center p-3 bg-gradient-to-r from-[#8C65C9] to-[#4C7DFF] shadow-md rounded-xl transition-transform active:scale-95">
                            <Sparkles className="h-5 w-5 mr-2" /> Recomendaciones con IA
                        </Link>
                        <Link href="/home" className={`text-lg font-bold p-2 rounded-xl transition-colors ${pathname === '/home' ? 'text-[#8C65C9] bg-slate-50' : 'text-slate-800 hover:bg-black/5'}`}>Inicio</Link>
                        <Link href="/discover" className={`text-lg font-bold p-2 rounded-xl transition-colors ${pathname === '/discover' ? 'text-[#8C65C9] bg-slate-50' : 'text-slate-800 hover:bg-black/5'}`}>Nuestros Aliados</Link>
                        <Link href="/promociones" className={`text-lg font-bold p-2 rounded-xl transition-colors ${pathname === '/promociones' ? 'text-[#8C65C9] bg-slate-50' : 'text-slate-800 hover:bg-black/5'}`}>Promociones</Link>
                        <Link href="/referir" className={`text-lg font-bold p-2 rounded-xl transition-colors ${pathname === '/referir' ? 'text-[#8C65C9] bg-slate-50' : 'text-slate-800 hover:bg-black/5'}`}>Referir un Colega</Link>
                        <Link href="/profile" className={`text-lg font-bold p-2 rounded-xl transition-colors ${pathname === '/profile' ? 'text-[#8C65C9] bg-slate-50' : 'text-slate-800 hover:bg-black/5'}`}>Mi Perfil</Link>
                        <div className="h-px bg-black/5 my-2" />
                        <button onClick={() => { localStorage.removeItem("welli_user"); window.location.href = "/"; }} className="text-left text-lg font-bold text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors">Cerrar Sesión</button>
                    </nav>
                </div>
            )}
        </header>
    )
})
