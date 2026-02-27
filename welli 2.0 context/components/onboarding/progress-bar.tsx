"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
    currentStep: number
    totalSteps: number
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    const progress = (currentStep / totalSteps) * 100

    return (
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
