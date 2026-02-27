"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Search, Coins, DollarSign } from "lucide-react"
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
import { RiskAnalysisLoader } from "@/components/onboarding/risk-analysis-loader"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { ONBOARDING_STEPS, ONBOARDING_ROUTES } from "@/lib/constants"
import { formatCurrency, CountryCode } from "@/lib/financial"
import { useFinancials } from "@/hooks/use-financials"

const formSchema = z.object({
    institution: z.string().min(2, "Requerido"),
    procedure: z.string().min(2, "Requerido"),
    cost: z.string().min(2, "Requerido"),
    discountCode: z.string().optional(),
    patient: z.enum(["self", "other"], {
        message: "Debes seleccionar una opción",
    }),
    beneficiaryFirstName: z.string().optional(),
    beneficiaryLastName: z.string().optional(),
    beneficiaryDocType: z.string().optional(),
    beneficiaryDocNumber: z.string().optional(),
}).refine((data) => {
    if (data.patient === "other") {
        return !!data.beneficiaryFirstName && !!data.beneficiaryLastName && !!data.beneficiaryDocType && !!data.beneficiaryDocNumber;
    }
    return true;
}, {
    message: "Todos los datos del beneficiario son obligatorios",
    path: ["beneficiaryFirstName"],
});

export default function ProcedureDetailsPage() {
    const router = useRouter()
    const { country, currencySymbol } = useFinancials()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            institution: "",
            procedure: "",
            cost: "",
            discountCode: "",
            patient: "self",
            beneficiaryFirstName: "",
            beneficiaryLastName: "",
            beneficiaryDocType: country === "CO" ? "C.C" : "D.N.I",
            beneficiaryDocNumber: "",
        },
    })

    const patientType = form.watch("patient");

    const handleCostInput = (value: string) => {
        const number = value.replace(/[^0-9]/g, "");
        if (!number) return "";
        return new Intl.NumberFormat("en-US").format(Number(number));
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        const rawAmount = values.cost.replace(/,/g, "");

        setTimeout(() => {
            setIsSubmitting(false)
            router.push(`${ONBOARDING_ROUTES.CREDIT_OFFER}?amount=${rawAmount}&country=${country}`)
        }, 5000)
    }

    if (isSubmitting) {
        return <RiskAnalysisLoader />
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar backHref={`${ONBOARDING_ROUTES.IDENTITY_VERIFICATION}?country=${country}`} />

            <div className="flex-1 px-6 pt-4 pb-8">
                <div className="max-w-lg mx-auto space-y-6">
                    <div className="w-full pt-4">
                        <ProgressBar currentStep={ONBOARDING_STEPS.PROCEDURE_DETAILS} totalSteps={ONBOARDING_STEPS.TOTAL} />
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                            Estas en el último paso
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed px-2">
                            Para finalizar, por favor comparte los detalles del procedimiento que quieres financiar.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="institution"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>¿Cual es el medico o Institución?</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input {...field} placeholder="Welli plastica" className="pr-10" />
                                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="procedure"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>¿Cuales es el procedimiento?</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input {...field} placeholder="Ortodoncia" className="pr-10" />
                                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cost"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>¿Costo que deseas financiar?</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{currencySymbol}</div>
                                                <Input
                                                    {...field}
                                                    placeholder="0.00"
                                                    className="pl-9 pr-10"
                                                    onChange={(e) => {
                                                        const formatted = handleCostInput(e.target.value);
                                                        field.onChange(formatted);
                                                    }}
                                                />
                                                <Coins className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="discountCode"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>¿Tienes un cupón?</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ingresa tu cupón" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="patient"
                                render={({ field }) => (
                                    <FormItem className="space-y-3 pt-2">
                                        <FormLabel className="text-base font-semibold">¿Quién recibirá el tratamiento?</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex gap-8"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="self" id="self" />
                                                    <label htmlFor="self" className="text-sm font-medium cursor-pointer">Yo mismo</label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="other" id="other" />
                                                    <label htmlFor="other" className="text-sm font-medium cursor-pointer">Otra persona</label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {patientType === "other" && (
                                <div className="space-y-6 pt-4 border-t border-border">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="beneficiaryFirstName"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel>Nombre beneficiario</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Ej. Juan" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="beneficiaryLastName"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel>Apellido beneficiario</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Ej. Perez" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Documento beneficiario</label>
                                        <div className="flex gap-4">
                                            <FormField
                                                control={form.control}
                                                name="beneficiaryDocType"
                                                render={({ field: typeField }) => (
                                                    <FormItem className="shrink-0">
                                                        <Select onValueChange={typeField.onChange} defaultValue={typeField.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="w-[100px]">
                                                                    <SelectValue placeholder="Tipo" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {country === "CO" ? (
                                                                    <>
                                                                        <SelectItem value="C.C">C.C</SelectItem>
                                                                        <SelectItem value="C.E">C.E</SelectItem>
                                                                        <SelectItem value="T.I">T.I</SelectItem>
                                                                        <SelectItem value="R.C">R.C</SelectItem>
                                                                        <SelectItem value="P.P.T">P.P.T</SelectItem>
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
                                                name="beneficiaryDocNumber"
                                                render={({ field: numField }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Input
                                                                {...numField}
                                                                placeholder="Número de documento"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-[#FFC800] hover:bg-[#FFC800]/90 text-black font-bold shadow-sm"
                                >
                                    Siguiente
                                </Button>

                                <Button
                                    type="button"
                                    onClick={() => router.push(`${ONBOARDING_ROUTES.IDENTITY_VERIFICATION}?country=${country}`)}
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

            <div className="fixed bottom-0 w-full h-24 overflow-hidden z-20 pointer-events-none">
                <div className="absolute top-0 left-[-10%] right-[-10%] h-[200%] bg-[#FFC800] rounded-t-[100%] flex flex-col items-center justify-start pt-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
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
