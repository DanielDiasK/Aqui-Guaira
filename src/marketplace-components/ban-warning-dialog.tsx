"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Calendar, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BanInfo {
    is_banned: boolean
    ban_reason: string | null
    ban_until: string | null
    is_permanent: boolean
}

export function BanWarningDialog() {
    const { user } = useAuth()
    const [banInfo, setBanInfo] = useState<BanInfo | null>(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (user) {
            checkBanStatus()
        }
    }, [user])

    const checkBanStatus = async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .rpc('is_user_banned', { user_uuid: user.id })

            if (error) {
                console.error("Erro ao verificar status de banimento:", error)
                return
            }

            if (data && data.length > 0) {
                const ban = data[0]
                if (ban.is_banned) {
                    setBanInfo(ban)
                    setOpen(true)
                }
            }
        } catch (err) {
            console.error("Erro:", err)
        }
    }

    if (!banInfo?.is_banned) return null

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl">
                        Conta {banInfo.is_permanent ? 'Suspensa' : 'Temporariamente Suspensa'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <Badge 
                            variant="destructive" 
                            className="text-sm px-4 py-2"
                        >
                            {banInfo.is_permanent ? (
                                <>
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Banimento Permanente
                                </>
                            ) : (
                                <>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Banimento Temporário
                                </>
                            )}
                        </Badge>
                    </div>

                    {/* Motivo do Banimento */}
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Motivo do Banimento:
                        </h4>
                        <p className="text-red-800 text-sm leading-relaxed">
                            {banInfo.ban_reason || "Nenhum motivo especificado."}
                        </p>
                    </div>

                    {/* Data de Expiração (se temporário) */}
                    {!banInfo.is_permanent && banInfo.ban_until && (
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                            <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Válido até:
                            </h4>
                            <p className="text-amber-800 text-lg font-bold">
                                {formatDate(banInfo.ban_until)}
                            </p>
                            <p className="text-amber-700 text-xs mt-1">
                                Após esta data, você poderá usar a plataforma normalmente.
                            </p>
                        </div>
                    )}

                    {/* Mensagem Informativa */}
                    <div className="bg-muted rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            {banInfo.is_permanent ? (
                                <>
                                    Sua conta foi suspensa permanentemente. 
                                    <br />
                                    Se você acredita que isso é um erro, entre em contato com o suporte.
                                </>
                            ) : (
                                <>
                                    Você não poderá publicar anúncios ou realizar certas ações até o fim do período de suspensão.
                                </>
                            )}
                        </p>
                    </div>

                    {/* Informações de Contato */}
                    <div className="pt-4 border-t text-center">
                        <p className="text-xs text-muted-foreground mb-2">
                            Precisa de ajuda?
                        </p>
                        <p className="text-sm font-medium text-foreground">
                            Entre em contato: <span className="text-primary">suporte@marketguaira.com</span>
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
