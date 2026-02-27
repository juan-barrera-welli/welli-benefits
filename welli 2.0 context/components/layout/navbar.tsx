"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { ArrowLeft, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { memo } from "react"

interface NavbarProps {
    backHref?: string
    showMenu?: boolean
    className?: string
}

export const Navbar = memo(function Navbar({ backHref, showMenu = true, className }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className={cn("flex items-center justify-between px-6 py-4 bg-white border-b border-border", className)}>
            <div className="flex items-center gap-4">
                {backHref && (
                    <Link href={backHref} className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                )}
                <div className="relative h-8 w-24">
                    <Image
                        src="/images/welli-brand-logo.png"
                        alt="Welli Logo"
                        fill
                        style={{ objectFit: "contain" }}
                        className="brightness-0"
                    />
                </div>
            </div>

            {showMenu && (
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 -mr-2 text-foreground"
                >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            )}
        </header>
    )
})
