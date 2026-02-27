"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"

const FormSchema = z.object({
    pin: z.string().min(4, {
        message: "El código debe tener 4 dígitos.",
    }),
})

function VerifyOtpContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [phone, setPhone] = useState("")

    useEffect(() => {
        // Only access searchParams in client effect to avoid hydration mismatch if suspense boundary issues
        setPhone(searchParams.get("phone") || "")
    }, [searchParams])

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: "",
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast.success("Código verificado exitosamente.")

        // Simulate API call and redirect
        setTimeout(() => {
            // In a real app we would validate backend here
            router.push("/onboarding/kyc-selection")
        }, 1000)
    }

    return (
        <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
                <CardTitle>Verifica tu Identidad</CardTitle>
                <CardDescription>
                    Ingresa el código que enviamos por WhatsApp al <br />
                    <span className="font-semibold text-foreground">{phone}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col items-center">
                        <FormField
                            control={form.control}
                            name="pin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Código OTP</FormLabel>
                                    <FormControl>
                                        <InputOTP maxLength={4} {...field}>
                                            <InputOTPGroup>
                                                <InputOTPSlot index={0} />
                                                <InputOTPSlot index={1} />
                                                <InputOTPSlot index={2} />
                                                <InputOTPSlot index={3} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            Verificar
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default function VerifyOtpPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <Suspense fallback={<div>Cargando...</div>}>
                <VerifyOtpContent />
            </Suspense>
        </div>
    )
}
