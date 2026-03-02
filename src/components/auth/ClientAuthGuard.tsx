"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function ClientAuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        // Enforce protection strictly on the client side rendering
        const checkAuth = () => {
            const user = localStorage.getItem("welli_user")

            // Allow access to the root login page naturally
            if (pathname === "/") {
                // If they are ALREADY logged in, bounce them TO home instead
                if (user) {
                    router.push("/home")
                } else {
                    setIsAuthorized(true)
                }
                return;
            }

            // For ANY OTHER route, strictly enforce having a user object
            if (!user) {
                console.warn("[AuthGuard] Unauthorized access attempt blocked. Redirecting to login.");
                router.push("/")
            } else {
                setIsAuthorized(true)
            }
        }

        checkAuth()

        // Re-verify if storage changes (e.g., user logs out from another tab)
        window.addEventListener("storage", checkAuth)
        return () => window.removeEventListener("storage", checkAuth)
    }, [pathname, router])

    // Prevent flashing protected content before the effect runs
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        )
    }

    return <>{children}</>
}
