"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { SplashScreen } from "@/components/ui/splash-screen"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { sendWhatsappOTP, verifyWhatsappOTP } from "@/app/actions/auth"
import { toast } from "sonner"
import { WHATSAPP_SUPPORT_URL } from "@/lib/constants"

// ... Schemas remain same ...
const registerSchema = z.object({
  country: z.enum(["+57", "+51"]),
  phone: z.string().min(10, {
    message: "El número debe tener al menos 10 dígitos.",
  }),
  policy: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar la política de tratamiento de datos.",
  }),
  terms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones.",
  }),
})

const resumeSchema = z.object({
  country: z.enum(["+57", "+51"]),
  phone: z.string().min(10, {
    message: "El número debe tener al menos 10 dígitos.",
  }),
  policy: z.boolean().optional(),
  terms: z.boolean().optional(),
})

type RegisterSchemaType = z.infer<typeof registerSchema>
type ResumeSchemaType = z.infer<typeof resumeSchema>

export default function WelcomePage() {
  const [loading, setLoading] = useState(true)
  // View states: landing -> (register|resume) -> otp
  const [view, setView] = useState<'landing' | 'register' | 'resume' | 'otp'>('landing')
  const [phoneData, setPhoneData] = useState<{ country: string, phone: string } | null>(null)

  const router = useRouter()

  const finishLoading = () => {
    setLoading(false)
  }

  useEffect(() => {
    const backupTimer = setTimeout(() => {
      setLoading(false)
    }, 3500)
    return () => clearTimeout(backupTimer)
  }, [])

  return (
    <>
      {loading && <SplashScreen finishLoading={finishLoading} />}

      <div className="flex flex-col min-h-screen bg-white overflow-x-hidden relative">
        {/* Header with Gradient */}
        <div className="relative w-full h-[45vh] bg-gradient-to-b from-[#8C65C9] to-[#4C7DFF] flex items-end justify-center overflow-visible">
          {/* Top Left: Logo Always Visible */}
          <div className="absolute top-6 left-6 z-30">
            <Image
              src="/images/welli-logo-white.png"
              alt="Welli Logo"
              width={80}
              height={30}
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Character */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[15%] z-20">
            <Image
              src="/images/welcome-character-v2.png"
              alt="Welli Mascot"
              width={320}
              height={320}
              priority
              className="drop-shadow-xl"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        {/* White Hill Overlay */}
        <div className="relative bg-white h-32 w-[140%] -ml-[20%] rounded-t-[100%] -mt-16 z-10"></div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center px-8 text-center space-y-4 relative z-10 -mt-2 pb-8 w-full max-w-md mx-auto">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Bienvenidos a Welli
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed px-4">
              Tu espacio seguro para financiar tu bienestar y cuidar tu salud.
            </p>
          </div>

          {view === 'landing' ? (
            <LandingView setView={setView} />
          ) : view === 'otp' ? (
            // OTP View is controlled by the Modal Overlay logic below, but we can render a placeholder or nothing here
            // Actually, layout wise, if we want the "Blurred" effect over the Form, we should keep rendering the Form but put the Overlay on top?
            // Or just render the Overlay and blur the main content container?
            // Let's render the Overlay as a fixed div outside this flow
            <div className="h-4" />
          ) : (
            <AuthForm
              view={view} // Casting to narrow type as 'register' | 'resume'
              setView={setView}
              setPhoneData={setPhoneData}
            />
          )}
        </div>

        {/* OTP MODAL OVERLAY */}
        {view === 'otp' && phoneData && (
          <OtpOverlay
            phoneData={phoneData}
            onClose={() => setView('landing')} // Or go back to register?
          />
        )}
      </div>
    </>
  )
}

function LandingView({ setView }: { setView: any }) {
  return (
    <div className="w-full max-w-xs space-y-4 pt-4">
      <Button
        onClick={() => setView('register')}
        className="w-full bg-[#FFC800] hover:bg-[#E6B400] text-black font-bold h-12 rounded-xl text-md shadow-sm"
      >
        Solicitar mi credito
      </Button>

      <Button
        onClick={() => setView('resume')}
        variant="secondary"
        className="w-full bg-slate-400 hover:bg-slate-500 text-white font-semibold h-12 rounded-xl text-md shadow-sm"
      >
        Retomar mi solicitud
      </Button>

      <div className="text-sm pt-2">
        <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
        <button onClick={() => setView('resume')} className="font-semibold text-blue-600 hover:underline">
          Ingresa aquí
        </button>
      </div>

      <div className="py-6 text-center text-sm">
        <span className="text-muted-foreground">¿Tienes algún problema? </span>
        <Link href={WHATSAPP_SUPPORT_URL} target="_blank" className="font-semibold text-blue-600 hover:underline">
          Contactar soporte
        </Link>
      </div>
    </div>
  )
}

function AuthForm({ view, setView, setPhoneData }: { view: 'register' | 'resume', setView: any, setPhoneData: any }) {
  const schema = view === 'resume' ? resumeSchema : registerSchema
  const [isSubmitting, setIsSubmitting] = useState(false)

  // @ts-ignore
  const form = useForm<z.infer<typeof schema>>({
    // @ts-ignore
    resolver: zodResolver(schema),
    defaultValues: {
      country: "+51",
      phone: "",
      policy: false,
      terms: false,
    },
  })

  async function onSubmit(values: any) {
    setIsSubmitting(true)
    // Store phone data
    setPhoneData({ country: values.country, phone: values.phone })

    // Call Server Action
    const result = await sendWhatsappOTP(values.phone)

    setIsSubmitting(false)
    if (result.success) {
      setView('otp')
    } else {
      alert("Error enviando código")
    }
  }

  return (
    <div className="w-full text-left pt-2 relative">
      <span className="text-sm font-medium text-gray-700 ml-1">Ingresa tu número de Whatsapp</span>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* ... Form Fields same as before ... */}
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="flex-shrink-0 w-[110px]">
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-white border-input min-w-[110px]">
                        <SelectValue placeholder="🇵🇪 +51" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="+57">
                        <span className="flex items-center gap-2">🇨🇴 +57</span>
                      </SelectItem>
                      <SelectItem value="+51">
                        <span className="flex items-center gap-2">🇵🇪 +51</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="3103916755"
                      type="tel"
                      className="h-12 bg-white border-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {view === 'register' && (
            <div className="space-y-3 pt-2">
              <FormField
                control={form.control}
                name="policy"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs font-normal text-muted-foreground">
                        He leído y acepto la <Link href="https://www.welli.com.co/autorizacion" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Política de Tratamiento de Datos.</Link>
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs font-normal text-muted-foreground">
                        He leído y acepto los <Link href="https://www.welli.com.co/terminos-condiciones" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Términos y Condiciones</Link> de Welli.
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#FFC800] hover:bg-[#E6B400] text-black font-bold h-12 rounded-xl text-md shadow-sm mt-4"
          >
            {isSubmitting ? 'Enviando...' : (view === 'register' ? 'Validar mi numero' : 'Ingresar')}
          </Button>

          <div className="w-full flex justify-center mt-6">
            <button
              type="button"
              onClick={() => setView('landing')}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800 flex items-center transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}

function OtpOverlay({ phoneData, onClose }: { phoneData: { country: string, phone: string }, onClose: () => void }) {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const router = useRouter()

  // Timer logic
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResend = async () => {
    if (countdown > 0) return;
    setCountdown(60)
    // Mock re-send
    await sendWhatsappOTP(phoneData.phone)

    // Use alert for now or sonner if available
    alert("Código reenviado")
  }

  async function handleVerify() {
    if (otp.length !== 4) return
    setIsVerifying(true)
    const normalizedCountry = phoneData.country.replace('+', '')
    const countryCode = normalizedCountry === "57" ? "CO" : "PE"

    const result = await verifyWhatsappOTP(phoneData.phone, otp)
    if (result.success) {
      toast.success("Verificación exitosa")
      router.push(`/onboarding?country=${countryCode}`)
    } else {
      alert('Codigo invalido')
      setIsVerifying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center space-y-6">
        <div className="h-12 w-12 bg-[#FFF9E5] rounded-full flex items-center justify-center mb-2">
          {/* Chat bubble icon similar to mockup */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#FFC800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Ingresa el código de 4 dígitos</h2>
          <p className="text-sm text-gray-500">Enviamos un código a tu Whatsapp</p>
        </div>

        <div className="py-2">
          <InputOTP
            maxLength={4}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup className="gap-3">
              {[0, 1, 2, 3].map((index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="h-14 w-12 rounded-lg border-2 border-gray-200 text-2xl font-semibold shadow-sm focus:border-[#FFC800] focus:ring-0 active:border-[#FFC800]"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="text-sm">
          <span className="text-gray-500">¿No lo recibiste? </span>
          <button
            onClick={handleResend}
            disabled={countdown > 0}
            className={`font-semibold underline decoration-gray-400 ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-black'}`}
          >
            {countdown > 0 ? `Re-enviar en ${countdown}s` : "Re-enviar code"}
          </button>
        </div>

        <Button
          onClick={handleVerify}
          disabled={otp.length !== 4 || isVerifying}
          className="w-full bg-[#FFC800] hover:bg-[#E6B400] text-black font-bold h-12 rounded-xl text-md shadow-sm"
        >
          {isVerifying ? 'Verificando...' : 'Validar y continuar'}
        </Button>
      </div>
    </div>
  )
}
