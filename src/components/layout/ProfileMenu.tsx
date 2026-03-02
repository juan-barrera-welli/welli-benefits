"use client"

import { useState, useRef, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, LogOut, Settings, Camera } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProfileMenuProps {
    user: any
    onUserUpdate: (user: any) => void
}

export function ProfileMenu({ user, onUserUpdate }: ProfileMenuProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const router = useRouter()

    const [nombre, setNombre] = useState(user?.nombre || "")
    const [correo, setCorreo] = useState(user?.correo_electronico || user?.correo || user?.email || "")
    const [numero, setNumero] = useState(user?.numero_telefono || user?.numero || user?.celular || user?.telefono || "")
    const [empresa, setEmpresa] = useState(user?.empresa || "")
    const [foto, setFoto] = useState<string | null>(user?.foto || null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (user) {
            setNombre(user.nombre || "")
            setCorreo(user.correo_electronico || user.correo || user.email || "")
            setNumero(user.numero_telefono || user.numero || user.celular || user.telefono || "")
            setEmpresa(user.empresa || "")
            setFoto(user.foto || null)
        }
    }, [user])

    const handleLogout = () => {
        localStorage.removeItem("welli_user")
        router.push("/")
    }

    const handleSaveSettings = async () => {
        const updatedUser = {
            ...user,
            nombre,
            correo_electronico: correo, // Update the correctly mapped property
            numero_telefono: numero,    // Update the correctly mapped property
            empresa,
            foto
        }

        // Optimistic UI update
        localStorage.setItem("welli_user", JSON.stringify(updatedUser))
        onUserUpdate(updatedUser)
        setIsEditing(false)
        setIsSettingsOpen(false)

        try {
            await fetch('/api/update-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentNumber: user?.numero_doc || user?.numero_documento || "",
                    newEmail: correo,
                    newFoto: foto
                })
            });
        } catch (error) {
            console.error("Failed to sync profile changes with server:", error);
        }
    }

    const handleCancelOptions = () => {
        // Reset values to original user state when cancelling
        if (user) {
            setNombre(user.nombre || "")
            setCorreo(user.correo_electronico || user.correo || user.email || "")
            setNumero(user.numero_telefono || user.numero || user.celular || user.telefono || "")
            setEmpresa(user.empresa || "")
        }
        setIsEditing(false)
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                // Compress image using Canvas
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    // Maximum dimensions
                    const MAX_WIDTH = 150;
                    const MAX_HEIGHT = 150;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height = Math.round((height * MAX_WIDTH) / width);
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width = Math.round((width * MAX_HEIGHT) / height);
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        // Convert to webp with 0.7 quality to reduce base64 size for Google Sheets
                        const compressedBase64 = canvas.toDataURL('image/webp', 0.7);
                        setFoto(compressedBase64);
                    } else {
                        setFoto(reader.result as string) // Fallback
                    }
                };
                img.src = reader.result as string;
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <PopoverTrigger className="flex flex-shrink-0 items-center justify-center p-0 h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border-2 border-white/50 shadow-md transition-all hover:shadow-lg active:scale-95 bg-gradient-to-br from-[#8C65C9] to-[#4C7DFF]">
                    {foto ? (
                        <div style={{ backgroundImage: `url(${foto})` }} className="h-full w-full bg-cover bg-center" />
                    ) : (
                        <User className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    )}
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-2 rounded-xl backdrop-blur-xl bg-white/90 border-white/20 shadow-xl z-[100]">
                    <div className="flex flex-col gap-1">
                        <div className="px-2 py-1.5 mb-1">
                            <p className="text-sm font-semibold text-slate-800">{nombre}</p>
                            <p className="text-xs text-slate-500 truncate">{correo || "Sin correo"}</p>
                        </div>
                        <div className="h-px bg-slate-100 my-1" />
                        <button
                            onClick={() => {
                                setIsMenuOpen(false)
                                handleLogout()
                            }}
                            className="flex items-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                        >
                            <LogOut className="h-4 w-4 text-red-500" />
                            Cerrar Sesión
                        </button>
                    </div>
                </PopoverContent>
            </Popover>

            <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex flex-shrink-0 items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border-2 border-white/50 bg-white/60 shadow-md transition-all hover:bg-white/80 hover:shadow-lg active:scale-95"
                title="Ajustes de Perfil"
            >
                <Settings className="h-5 w-5 md:h-6 md:w-6 text-slate-700" />
            </button>

            <Dialog open={isSettingsOpen} onOpenChange={(open) => {
                if (!open && isEditing) {
                    handleCancelOptions()
                } else if (!open) {
                    setIsEditing(false)
                }
                setIsSettingsOpen(open)
            }}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-slate-800">Ajustes de Perfil</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-6 py-4">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative h-24 w-24 rounded-full border-4 border-slate-100 overflow-hidden shadow-sm bg-slate-50">
                                {foto ? (
                                    <div style={{ backgroundImage: `url(${foto})` }} className="h-full w-full bg-cover bg-center" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#8C65C9]/20 to-[#4C7DFF]/20">
                                        <User className="h-8 w-8 text-[#8C65C9]/60" />
                                    </div>
                                )}
                                <div
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Camera className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                            {isEditing && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-sm font-medium text-[#8C65C9] hover:text-[#7854b4] transition-colors"
                                >
                                    Cambiar foto
                                </button>
                            )}
                        </div>

                        <div className="grid gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="empresa" className="text-slate-700">Empresa Vinculada</Label>
                                <Input
                                    id="empresa"
                                    value={empresa}
                                    disabled={true} // Empresa is always read-only
                                    className="rounded-xl border-slate-200 bg-slate-50 text-slate-500"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="nombre" className="text-slate-700">Nombre completo</Label>
                                <Input
                                    id="nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    disabled={true}
                                    className="rounded-xl border-slate-200 bg-slate-50 text-slate-500"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="numero" className="text-slate-700">Número de teléfono</Label>
                                <Input
                                    id="numero"
                                    value={numero}
                                    onChange={(e) => setNumero(e.target.value)}
                                    disabled={true}
                                    className="rounded-xl border-slate-200 bg-slate-50 text-slate-500"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="correo" className="text-slate-700">Correo electrónico</Label>
                                <Input
                                    id="correo"
                                    type="email"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    disabled={!isEditing}
                                    className={`rounded-xl border-slate-200 focus-visible:ring-[#8C65C9] ${!isEditing ? "bg-slate-50 text-slate-500" : ""}`}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-between gap-3 flex-col sm:flex-row">
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleCancelOptions} className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 w-full sm:w-auto">
                                Cancelar
                            </Button>
                        </DialogClose>

                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            {!isEditing && (
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        setIsSettingsOpen(false);
                                        handleLogout();
                                    }}
                                    className="rounded-xl w-full sm:w-auto shadow-sm flex items-center justify-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Cerrar Sesión
                                </Button>
                            )}
                            {isEditing ? (
                                <Button
                                    onClick={handleSaveSettings}
                                    className="rounded-xl bg-gradient-to-r from-[#8C65C9] to-[#4C7DFF] text-white hover:opacity-90 transition-opacity shadow-md w-full sm:w-auto"
                                >
                                    Confirmar y Guardar
                                </Button>
                            ) : (
                                <Button
                                    onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                                    className="rounded-xl bg-gradient-to-r from-[#8C65C9] to-[#4C7DFF] text-white hover:opacity-90 transition-opacity shadow-md w-full sm:w-auto"
                                >
                                    Editar
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
