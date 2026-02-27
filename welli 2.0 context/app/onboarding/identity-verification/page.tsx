"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ProgressBar } from "@/components/onboarding/progress-bar"
import { Navbar } from "@/components/layout/navbar"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { ONBOARDING_STEPS, ONBOARDING_ROUTES } from "@/lib/constants"
import { formatCurrency, CountryCode } from "@/lib/financial"

const formSchema = z.object({
    day: z.string().min(1, "Requerido"),
    month: z.string().min(1, "Requerido"),
    year: z.string().min(1, "Requerido"),
    docType: z.string(),
    docNumber: z.string().min(6, "Número inválido"),
    income: z.string().min(1, "Requerido"),
    employment: z.string().min(1, "Requerido"),
})

export default function IdentityVerificationPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const country = (searchParams.get("country") as CountryCode) || "CO"

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            day: "",
            month: "",
            year: "",
            docType: country === "CO" ? "C.C" : "D.N.I",
            docNumber: "",
            income: "",
            employment: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        router.push(`${ONBOARDING_ROUTES.PROCEDURE_DETAILS}?country=${country}`)
    }

    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString())
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    const currentYear = new Date().getFullYear()
    const maxYear = currentYear - 18
    const years = Array.from({ length: 100 }, (_, i) => (maxYear - i).toString())

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar backHref={ONBOARDING_ROUTES.PERSONAL_DATA} />

            <div className="flex-1 px-6 pt-4 pb-8">
                <div className="max-w-lg mx-auto space-y-6">
                    <div className="w-full pt-4">
                        <ProgressBar currentStep={ONBOARDING_STEPS.IDENTITY_VERIFICATION} totalSteps={ONBOARDING_STEPS.TOTAL} />
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                            Validemos tu identidad
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed px-2">
                            Necesitamos estos datos para proteger tu identidad y realizar el estudio de credito.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label>Fecha de nacimiento</Label>
                                <div className="flex gap-4">
                                    <FormField
                                        control={form.control}
                                        name="day"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Dia" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {days.map((d) => (
                                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="month"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Mes" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {months.map((m) => (
                                                            <SelectItem key={m} value={m}>{m}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="year"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Año" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {years.map((y) => (
                                                            <SelectItem key={y} value={y}>{y}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Número de Documento</Label>
                                <div className="flex gap-4">
                                    <FormField
                                        control={form.control}
                                        name="docType"
                                        render={({ field: typeField }) => (
                                            <FormItem>
                                                <Select onValueChange={typeField.onChange} defaultValue={typeField.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-[80px]">
                                                            <SelectValue placeholder="C.C" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {country === "CO" ? (
                                                            <>
                                                                <SelectItem value="C.C">C.C</SelectItem>
                                                                <SelectItem value="C.E">C.E</SelectItem>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <SelectItem value="D.N.I">D.N.I</SelectItem>
                                                                <SelectItem value="C.E">C.E</SelectItem>
                                                            </>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="docNumber"
                                        render={({ field: numField }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <Input
                                                        {...numField}
                                                        placeholder="1011111122"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="income"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <Label>¿Cuales son tus ingresos mensuales?</Label>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={country === "CO" ? "Selecciona un rango" : "Selecciona un rango"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="<2m">{country === "CO" ? "Menos de 2,000,000 COP" : "Menos de 2,000 PEN"}</SelectItem>
                                                <SelectItem value="2m-5m">{country === "CO" ? "Entre 2,000,000 y 5,000,000 COP" : "Entre 2,000 y 5,000 PEN"}</SelectItem>
                                                <SelectItem value=">5m">{country === "CO" ? "Más de 5,000,000 COP" : "Más de 5,000 PEN"}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="employment"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <Label>¿Cual es tu situación laboral?</Label>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Empleado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="empleado">Empleado</SelectItem>
                                                <SelectItem value="independiente">Independiente</SelectItem>
                                                <SelectItem value="desempleado">Desempleado</SelectItem>
                                                <SelectItem value="estudiante">Estudiante</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-6 space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-[#FFC800] hover:bg-[#FFC800]/90 text-black font-bold shadow-sm"
                                >
                                    Siguiente
                                </Button>

                                <Button
                                    type="button"
                                    onClick={() => router.push(`${ONBOARDING_ROUTES.PERSONAL_DATA}?country=${country}`)}
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
                    <div className="relative h-10 w-28 invert filter brightness-0 opacity-90" >
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
