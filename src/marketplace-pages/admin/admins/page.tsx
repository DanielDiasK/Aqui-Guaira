"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAlert } from "@/components/alert-system"
import { useConfirm } from "@/components/confirm-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
    Shield, 
    Plus, 
    Trash2, 
    Edit, 
    Eye, 
    EyeOff, 
    Mail, 
    User, 
    Calendar,
    CheckCircle,
    XCircle,
    Loader2,
    Key
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Admin {
    id: string
    email: string
    name: string
    is_active: boolean
    created_at: string
    last_login: string | null
}

export default function AdminsPage() {
    const alert = useAlert()
    const { confirm } = useConfirm()
    const [admins, setAdmins] = useState<Admin[]>([])
    const [loading, setLoading] = useState(true)
    const [openDialog, setOpenDialog] = useState(false)
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    // Form state
    const [formEmail, setFormEmail] = useState("")
    const [formName, setFormName] = useState("")
    const [formPassword, setFormPassword] = useState("")
    const [formLoading, setFormLoading] = useState(false)

    useEffect(() => {
        loadAdmins()
    }, [])

    const loadAdmins = async () => {
        try {
            const { data, error } = await supabase
                .from("admins")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error
            setAdmins(data || [])
        } catch (error) {
            console.error("Erro ao carregar admins:", error)
            alert.error("Erro ao carregar lista de administradores")
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (admin?: Admin) => {
        if (admin) {
            setEditingAdmin(admin)
            setFormEmail(admin.email)
            setFormName(admin.name)
            setFormPassword("")
        } else {
            setEditingAdmin(null)
            setFormEmail("")
            setFormName("")
            setFormPassword("")
        }
        setOpenDialog(true)
    }

    const handleCloseDialog = () => {
        setOpenDialog(false)
        setEditingAdmin(null)
        setFormEmail("")
        setFormName("")
        setFormPassword("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            if (editingAdmin) {
                // Editar admin existente
                const updates: any = {
                    email: formEmail.toLowerCase().trim(),
                    name: formName.trim()
                }

                // Atualizar dados básicos
                const { error: updateError } = await supabase
                    .from("admins")
                    .update(updates)
                    .eq("id", editingAdmin.id)

                if (updateError) throw updateError

                // Se senha foi preenchida, atualizar também
                if (formPassword.trim()) {
                    const { error: passwordError } = await supabase
                        .rpc("update_admin_password", {
                            admin_id: editingAdmin.id,
                            new_password: formPassword
                        })

                    if (passwordError) throw passwordError
                }

                alert.success("Administrador atualizado com sucesso!")
            } else {
                // Criar novo admin
                if (!formPassword) {
                    alert.warning("Senha é obrigatória para novos administradores")
                    setFormLoading(false)
                    return
                }

                const { error } = await supabase
                    .rpc("create_admin", {
                        admin_email: formEmail.toLowerCase().trim(),
                        admin_password: formPassword,
                        admin_name: formName.trim()
                    })

                if (error) throw error

                alert.success("Administrador criado com sucesso!")
            }

            handleCloseDialog()
            loadAdmins()
        } catch (error: any) {
            console.error("Erro ao salvar admin:", error)
            alert.error(error.message || "Erro ao salvar administrador")
        } finally {
            setFormLoading(false)
        }
    }

    const handleToggleActive = async (admin: Admin) => {
        confirm(
            `Deseja ${admin.is_active ? "desativar" : "ativar"} este administrador?`,
            async () => {
                try {
                    const { error } = await supabase
                        .from("admins")
                        .update({ is_active: !admin.is_active })
                        .eq("id", admin.id)

                    if (error) throw error

                    alert.success(`Administrador ${admin.is_active ? "desativado" : "ativado"} com sucesso!`)
                    loadAdmins()
                } catch (error: any) {
                    console.error("Erro ao alterar status:", error)
                    alert.error(error.message)
                }
            },
            {
                title: admin.is_active ? "Desativar Administrador" : "Ativar Administrador",
                confirmText: admin.is_active ? "Desativar" : "Ativar",
                type: admin.is_active ? "warning" : "info"
            }
        )
    }

    const handleDelete = async (admin: Admin) => {
        const confirmText = `DELETE ${admin.email}`
        
        confirm(
            `⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\nVocê está prestes a excluir permanentemente o administrador:\n\n${admin.name} (${admin.email})`,
            async () => {
                try {
                    const { error } = await supabase
                        .from("admins")
                        .delete()
                        .eq("id", admin.id)

                    if (error) throw error

                    alert.success("Administrador excluído com sucesso!")
                    loadAdmins()
                } catch (error: any) {
                    console.error("Erro ao excluir admin:", error)
                    alert.error(error.message)
                }
            },
            {
                title: "Excluir Administrador",
                confirmText: "Excluir Permanentemente",
                requireInput: confirmText,
                type: "danger"
            }
        )
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Nunca"
        return new Date(dateString).toLocaleString("pt-BR")
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" />
                        Administradores
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie os administradores do sistema
                    </p>
                </div>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()} className="gap-2">
                            <Plus className="h-5 w-5" />
                            Novo Admin
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingAdmin ? "Editar Administrador" : "Novo Administrador"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingAdmin 
                                    ? "Atualize as informações do administrador. Deixe a senha em branco para mantê-la." 
                                    : "Preencha os dados para criar um novo administrador."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={formEmail}
                                        onChange={(e) => setFormEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={formLoading}
                                    />
                                </div>
                            </div>

                            {/* Nome */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Nome do Administrador"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={formLoading}
                                    />
                                </div>
                            </div>

                            {/* Senha */}
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Senha {editingAdmin && "(deixe em branco para não alterar)"}
                                </Label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder={editingAdmin ? "Nova senha (opcional)" : "Senha"}
                                        value={formPassword}
                                        onChange={(e) => setFormPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required={!editingAdmin}
                                        disabled={formLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        disabled={formLoading}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseDialog}
                                    className="flex-1"
                                    disabled={formLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={formLoading}
                                >
                                    {formLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        editingAdmin ? "Atualizar" : "Criar"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold text-foreground">{admins.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Ativos</p>
                            <p className="text-2xl font-bold text-foreground">
                                {admins.filter(a => a.is_active).length}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Inativos</p>
                            <p className="text-2xl font-bold text-foreground">
                                {admins.filter(a => !a.is_active).length}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Lista de Admins */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Lista de Administradores</h2>
                    <div className="space-y-3">
                        {admins.map((admin) => (
                            <div
                                key={admin.id}
                                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-white ${
                                        admin.is_active ? "bg-gradient-to-br from-primary to-blue-600" : "bg-gray-400"
                                    }`}>
                                        {admin.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-foreground">
                                                {admin.name}
                                            </h3>
                                            {admin.is_active ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                                        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Criado: {formatDate(admin.created_at)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Shield className="h-3 w-3" />
                                                Último login: {formatDate(admin.last_login)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleActive(admin)}
                                        className={admin.is_active ? "text-orange-600" : "text-green-600"}
                                    >
                                        {admin.is_active ? "Desativar" : "Ativar"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenDialog(admin)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(admin)}
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {admins.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>Nenhum administrador cadastrado</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}
