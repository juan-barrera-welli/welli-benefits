"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [idType, setIdType] = useState("CC")
  const [documentNumber, setDocumentNumber] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentNumber, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || "Ocurrió un error inesperado al iniciar sesión.")
        return
      }

      if (data.success && data.user) {
        // Save basic session context
        localStorage.setItem("welli_user", JSON.stringify(data.user))

        // Notify other components (like Navbar) that user explicitly logged in
        window.dispatchEvent(new Event("welli_user_updated"))

        router.push("/home")
      }
    } catch (err) {
      console.error(err)
      setErrorMsg("Error de conexión con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-65px)] bg-slate-50 items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#4C7DFF]/15 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#8C65C9]/15 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-[#FFC800]/5 blur-[100px] rounded-full animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 transition-all animate-in fade-in zoom-in-95 duration-700">
        <Card className="border border-white/40 shadow-2xl rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-white/40 backdrop-blur-2xl">
          <CardHeader className="pt-8 sm:pt-10 pb-2 px-6 sm:px-10 flex flex-col items-center text-center">
            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-tr from-[#8C65C9] to-[#4C7DFF] rounded-[1.25rem] sm:rounded-[1.5rem] flex items-center justify-center shadow-2xl mb-4 sm:mb-6 transform hover:rotate-3 transition-transform duration-500">
              <Image src="/images/welli-logo-white.png" alt="Welli" width={60} height={60} className="w-[60%] h-auto object-contain" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-0.5 sm:mb-1">Welli Benefits</CardTitle>
            <CardDescription className="text-sm sm:text-base text-slate-600 font-bold opacity-80">Gestiona tu bienestar corporativo</CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-10 pb-8 sm:pb-10 pt-4 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold px-4 py-3 rounded-2xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                  <span className="mt-0.5 text-base leading-none">⚠️</span>
                  <p>{errorMsg}</p>
                </div>
              )}

              <div className="space-y-2.5">
                <Label htmlFor="id-type" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tipo de Identificación</Label>
                <Select value={idType} onValueChange={(val: string | null) => val && setIdType(val)}>
                  <SelectTrigger id="id-type" className="h-12 sm:h-14 bg-white/50 border-white/40 rounded-xl sm:rounded-2xl focus:ring-[#4C7DFF] backdrop-blur-sm text-slate-900 font-bold shadow-sm">
                    <SelectValue placeholder="Selecciona tipo de ID" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/90">
                    <SelectItem value="CC" className="rounded-xl font-bold py-3 text-slate-700">🇨🇴 Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="CE" className="rounded-xl font-bold py-3 text-slate-700">🇨🇴 Cédula de Extranjería</SelectItem>
                    <SelectItem value="DNI" className="rounded-xl font-bold py-3 text-slate-700">🇵🇪 DNI (Perú)</SelectItem>
                    <SelectItem value="PTP" className="rounded-xl font-bold py-3 text-slate-700">🇵🇪 PTP (Perú)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="id-number" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Número de Documento</Label>
                <Input
                  id="id-number"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ej. 1029384756"
                  className="h-12 sm:h-14 bg-white/50 border-white/40 rounded-xl sm:rounded-2xl focus-visible:ring-[#4C7DFF] backdrop-blur-sm shadow-sm text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-medium"
                  required
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contraseña</Label>
                  <button type="button" className="text-[10px] font-black text-[#4C7DFF] hover:underline uppercase tracking-wider">¿La olvidaste?</button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 sm:h-14 bg-white/50 border-white/40 rounded-xl sm:rounded-2xl pr-12 sm:pr-14 focus-visible:ring-[#4C7DFF] backdrop-blur-sm shadow-sm text-slate-900 font-bold placeholder:text-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#4C7DFF] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 sm:h-14 bg-[#FFC800]/30 backdrop-blur-3xl hover:bg-[#FFC800]/40 text-black font-black text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-[0_8px_32px_0_rgba(255,200,0,0.15),inset_0_1px_1px_0_rgba(255,255,255,0.5)] border border-white/50 mt-2 sm:mt-4 transition-all hover:ring-2 hover:ring-[#FFC800]/50 active:scale-95 group relative overflow-hidden"
                disabled={loading}
              >
                <div className="absolute inset-0 bg-[#FFC800]/40 z-[-1] transition-opacity group-hover:bg-[#FFC800]/50" />
                {loading ? "Iniciando..." : "Ingresar"}
              </Button>
            </form>

            {/* 
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200/30" />
              </div>
              <span className="relative px-6 bg-transparent text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">O ingresa con</span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              <Button
                variant="outline"
                className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/30 text-slate-800 shadow-[0_4px_16px_0_rgba(0,0,0,0.05),inset_0_1px_1px_0_rgba(255,255,255,0.4)] transition-all hover:bg-white/15 hover:ring-1 hover:ring-white/50 active:scale-95 gap-2 sm:gap-3"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/30 text-slate-800 shadow-[0_4px_16px_0_rgba(0,0,0,0.05),inset_0_1px_1px_0_rgba(255,255,255,0.4)] transition-all hover:bg-white/15 hover:ring-1 hover:ring-white/50 active:scale-95 gap-2 sm:gap-3"
              >
                <div className="h-6 w-6 bg-[#25D366]/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-white/20">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                  </svg>
                </div>
                WhatsApp
              </Button>
            </div>
*/}

            <div className="text-center pt-4">
              <span className="text-sm text-slate-500 font-bold opacity-70">¿No tienes cuenta? </span>
              <Link href="/register" className="text-sm font-black text-[#4C7DFF] hover:underline uppercase tracking-wider">Regístrate gratis</Link>
            </div>
          </CardContent>
        </Card>

        {/* Secondary branding/trust badges */}
        <div className="mt-12 flex items-center justify-center gap-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-700 pointer-events-none">
          <Image src="/images/welli-brand-logo.png" alt="Trusted" width={110} height={44} style={{ objectFit: "contain" }} className="brightness-0" />
          <div className="h-6 w-px bg-slate-300" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-slate-800" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Seguridad Welli</span>
          </div>
        </div>
      </div>
    </div >
  )
}
