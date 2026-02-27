"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { HelpCircle } from "lucide-react"
import { ProgressBar } from "@/components/onboarding/progress-bar"
import { Navbar } from "@/components/layout/navbar"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter, useSearchParams } from "next/navigation"
import { ONBOARDING_STEPS, ONBOARDING_ROUTES } from "@/lib/constants"

const formSchema = z.object({
    firstName: z.string().min(2, "El nombre es requerido"),
    lastName: z.string().min(2, "El apellido es requerido"),
    email: z.string().email("Correo inválido"),
    altPhone: z.string().optional(),
})

export default function PersonalDataPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const country = searchParams.get("country") || "CO"

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "Juan Camilo",
            lastName: "Barrera Paris",
            email: "olivia@untitledui.com",
            altPhone: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        router.push(`${ONBOARDING_ROUTES.IDENTITY_VERIFICATION}?country=${country}`)
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar backHref={`${ONBOARDING_ROUTES.SELECTION}?country=${country}`} />

            <div className="flex-1 px-6 pt-4 pb-8">
                <div className="max-w-lg mx-auto space-y-6">
                    <div className="w-full pt-4">
                        <ProgressBar currentStep={ONBOARDING_STEPS.PERSONAL_DATA} totalSteps={ONBOARDING_STEPS.TOTAL} />
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                            Cuéntanos un poco sobre ti
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Por favor, revisa que tus datos sean correctos. Así podremos darte una respuesta acertada.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Nombre(s)</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Apellidos</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Correo electrónico</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input {...field} type="email" className="pr-10" />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help hover:text-primary transition-colors" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="bg-white border-gray-200 text-black shadow-lg">
                                                                <p className="max-w-[200px]">Enviaremos información importante de tu crédito a este correo.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="altPhone"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Otro número de Whatsapp</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-4 relative">
                                                <Select defaultValue={country === "CO" ? "+57" : "+51"}>
                                                    <SelectTrigger className="w-[100px]">
                                                        <SelectValue placeholder={country === "CO" ? "+57" : "+51"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="+57">🇨🇴 +57</SelectItem>
                                                        <SelectItem value="+51">🇵🇪 +51</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <div className="relative flex-1">
                                                    <Input
                                                        {...field}
                                                        placeholder="3103916755"
                                                        className="pr-10"
                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help hover:text-primary transition-colors" />
                                                                </TooltipTrigger>
                                                                <TooltipContent className="bg-white border-gray-200 text-black shadow-lg">
                                                                    <p className="max-w-[200px]">Un número de respaldo (familiar o amigo) en caso de que no podamos contactarte.</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-4 space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-[#FFC800] hover:bg-[#FFC800]/90 text-black font-bold shadow-sm"
                                >
                                    Siguiente
                                </Button>

                                <Button
                                    type="button"
                                    onClick={() => router.push(`${ONBOARDING_ROUTES.SELECTION}?country=${country}`)}
                                    variant="ghost"
                                    className="w-full text-muted-foreground font-medium mb-12"
                                >
                                    Volver
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>

            <div className="fixed bottom-0 w-full h-24 overflow-hidden z-10 pointer-events-none">
                <div className="absolute top-0 left-[-10%] right-[-10%] h-[200%] bg-[#FFC800] rounded-t-[100%] flex flex-col items-center justify-start pt-6">
                    <div className="relative h-10 w-28 invert filter brightness-0 opacity-90">
                        <Image
                            src="/images/welli-brand-logo.png"
                            alt="Welli Logo"
                            fill
                            style={{ objectFit: "contain" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
