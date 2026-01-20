"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface BadgeItem {
    id: string
    name: string
    color: string
}

const COLOR_OPTIONS = [
    { label: "Laranja", value: "bg-orange-100 text-orange-800" },
    { label: "Verde", value: "bg-green-100 text-green-800" },
    { label: "Roxo", value: "bg-purple-100 text-purple-800" },
    { label: "Rosa", value: "bg-pink-100 text-pink-800" },
    { label: "Esmeralda", value: "bg-emerald-100 text-emerald-800" },
    { label: "Vermelho", value: "bg-red-100 text-red-800" },
    { label: "Âmbar", value: "bg-amber-100 text-amber-800" },
    { label: "Azul", value: "bg-blue-100 text-blue-800" },
    { label: "Ciano", value: "bg-cyan-100 text-cyan-800" },
    { label: "Índigo", value: "bg-indigo-100 text-indigo-800" },
    { label: "Cinza", value: "bg-gray-100 text-gray-800" },
]

export default function AdminBadgesPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [badges, setBadges] = useState<BadgeItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBadge, setEditingBadge] = useState<BadgeItem | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        color: COLOR_OPTIONS[0].value
    })

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login")
        } else {
            loadBadges()
        }
    }, [user, authLoading, router])

    const loadBadges = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("badges")
                .select("*")
                .order("name")

            if (error) throw error
            setBadges(data || [])
        } catch (error) {
            console.error("Erro ao carregar badges:", error)
        } finally {
            setLoading(false)
        }
    }

    const generateSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "")
            .replace(/\-\-+/g, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, "")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        console.log("🔵 handleSubmit chamado")
        console.log("📝 formData:", formData)
        console.log("✏️ editingBadge:", editingBadge)

        try {
            const slug = generateSlug(formData.name)
            console.log("🔗 Slug gerado:", slug)

            if (editingBadge) {
                // Editar
                console.log("✏️ Modo EDIÇÃO - ID:", editingBadge.id)
                const { error } = await supabase
                    .from("badges")
                    .update({
                        name: formData.name,
                        slug: slug,
                        color: formData.color
                    })
                    .eq("id", editingBadge.id)

                if (error) {
                    console.error("❌ Erro ao editar:", error)
                    throw error
                }
                console.log("✅ Editado com sucesso!")
                alert("Diferencial atualizado com sucesso!")
            } else {
                // Criar
                console.log("➕ Modo CRIAÇÃO")
                const { error } = await supabase
                    .from("badges")
                    .insert({
                        name: formData.name,
                        slug: slug,
                        color: formData.color
                    })

                if (error) {
                    console.error("❌ Erro ao criar:", error)
                    throw error
                }
                console.log("✅ Criado com sucesso!")
                alert("Diferencial criado com sucesso!")
            }

            setIsModalOpen(false)
            setEditingBadge(null)
            setFormData({ name: "", color: COLOR_OPTIONS[0].value })
            await loadBadges()
        } catch (error: any) {
            console.error("❌ Erro geral:", error)
            alert(`Erro: ${error.message || JSON.stringify(error)}`)
        }
    }

    const handleDelete = async (id: string) => {
        console.log("🗑️ handleDelete chamado - ID:", id)

        if (!confirm("Tem certeza que deseja excluir este diferencial?")) {
            console.log("❌ Usuário cancelou")
            return
        }

        try {
            console.log("🔍 Verificando uso do badge...")
            const { data: usageData, error: usageError } = await supabase
                .from("listing_badges")
                .select("listing_id")
                .eq("badge_id", id)
                .limit(1)

            if (usageError) {
                console.error("⚠️ Erro ao verificar uso:", usageError)
            }

            console.log("📊 Dados de uso:", usageData)

            if (usageData && usageData.length > 0) {
                console.log("⚠️ Badge em uso, pedindo confirmação...")
                const confirmCascade = confirm(
                    "⚠️ Este diferencial está sendo usado em anúncios.\n\n" +
                    "Ao excluir, ele será removido de TODOS os anúncios que o utilizam.\n\n" +
                    "Deseja continuar?"
                )

                if (!confirmCascade) {
                    console.log("❌ Usuário cancelou exclusão em cascata")
                    return
                }

                console.log("🗑️ Deletando associações...")
                const { error: deleteAssocError } = await supabase
                    .from("listing_badges")
                    .delete()
                    .eq("badge_id", id)

                if (deleteAssocError) {
                    console.error("❌ Erro ao remover associações:", deleteAssocError)
                    alert("Erro ao remover o diferencial dos anúncios.")
                    return
                }
                console.log("✅ Associações removidas")
            }

            console.log("🗑️ Deletando badge...")
            const { error } = await supabase
                .from("badges")
                .delete()
                .eq("id", id)

            if (error) {
                console.error("❌ Erro ao deletar badge:", error)
                throw error
            }

            console.log("✅ Badge deletado com sucesso!")
            alert("✅ Diferencial excluído com sucesso!")
            await loadBadges()
        } catch (error: any) {
            console.error("❌ Erro geral ao excluir:", error)
            alert(`❌ Erro ao excluir diferencial: ${error.message || JSON.stringify(error)}`)
        }
    }

    const openEdit = (badge: BadgeItem) => {
        console.log("✏️ openEdit chamado:", badge)
        setEditingBadge(badge)
        setFormData({
            name: badge.name,
            color: badge.color
        })
        setIsModalOpen(true)
    }

    const openNew = () => {
        console.log("➕ openNew chamado")
        setEditingBadge(null)
        setFormData({ name: "", color: COLOR_OPTIONS[0].value })
        setIsModalOpen(true)
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Button variant="ghost" onClick={() => router.push("/admin")} className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar ao Painel
                        </Button>
                        <h1 className="text-3xl font-bold">Gerenciar Diferenciais</h1>
                        <p className="text-muted-foreground">Crie e edite os diferenciais disponíveis para os anúncios</p>
                    </div>
                    <Button onClick={openNew} className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Diferencial
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badges.map((badge) => (
                        <Card key={badge.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <Badge className={`${badge.color} border-0 px-3 py-1 text-sm`}>
                                    {badge.name}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(badge)}>
                                    <Edit className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(badge.id)}>
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingBadge ? "Editar Diferencial" : "Novo Diferencial"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Entrega Grátis"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cor / Estilo</label>
                                <Select
                                    value={formData.color}
                                    onValueChange={(val) => setFormData({ ...formData, color: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma cor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COLOR_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full ${option.value.split(' ')[0]}`}></div>
                                                    {option.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="mt-2">
                                    <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                                    <Badge className={`${formData.color} border-0`}>
                                        {formData.name || "Exemplo"}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-primary">
                                    Salvar
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
