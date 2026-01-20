"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Edit, FolderTree } from "lucide-react"
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
import * as LucideIcons from "lucide-react"

interface Category {
    id: string
    name: string
    slug: string
    icon: string
    description?: string
}

// Lista de ícones disponíveis do Lucide
const ICON_OPTIONS = [
    { label: "Carro", value: "Car", icon: LucideIcons.Car },
    { label: "Moto", value: "Bike", icon: LucideIcons.Bike },
    { label: "Ferramentas", value: "Wrench", icon: LucideIcons.Wrench },
    { label: "Celular", value: "Smartphone", icon: LucideIcons.Smartphone },
    { label: "Computador", value: "Laptop", icon: LucideIcons.Laptop },
    { label: "Fone", value: "Headphones", icon: LucideIcons.Headphones },
    { label: "Câmera", value: "Camera", icon: LucideIcons.Camera },
    { label: "Relógio", value: "Watch", icon: LucideIcons.Watch },
    { label: "Camisa", value: "Shirt", icon: LucideIcons.Shirt },
    { label: "Sapato", value: "Footprints", icon: LucideIcons.Footprints },
    { label: "Casa", value: "Home", icon: LucideIcons.Home },
    { label: "Sofá", value: "Sofa", icon: LucideIcons.Sofa },
    { label: "Lâmpada", value: "Lightbulb", icon: LucideIcons.Lightbulb },
    { label: "Utensílios", value: "UtensilsCrossed", icon: LucideIcons.UtensilsCrossed },
    { label: "Pizza", value: "Pizza", icon: LucideIcons.Pizza },
    { label: "Café", value: "Coffee", icon: LucideIcons.Coffee },
    { label: "Hamburguer", value: "Sandwich", icon: LucideIcons.Sandwich },
    { label: "Caixa", value: "Package", icon: LucideIcons.Package },
    { label: "Carrinho", value: "ShoppingCart", icon: LucideIcons.ShoppingCart },
    { label: "Bola", value: "CircleDot", icon: LucideIcons.CircleDot },
    { label: "Troféu", value: "Trophy", icon: LucideIcons.Trophy },
    { label: "Folha", value: "Leaf", icon: LucideIcons.Leaf },
    { label: "Reciclar", value: "Recycle", icon: LucideIcons.Recycle },
    { label: "Árvore", value: "Trees", icon: LucideIcons.Trees },
    { label: "Livro", value: "Book", icon: LucideIcons.Book },
    { label: "Música", value: "Music", icon: LucideIcons.Music },
    { label: "Gamepad", value: "Gamepad2", icon: LucideIcons.Gamepad2 },
    { label: "Presente", value: "Gift", icon: LucideIcons.Gift },
    { label: "Estrela", value: "Star", icon: LucideIcons.Star },
    { label: "Coração", value: "Heart", icon: LucideIcons.Heart },
]

export default function AdminCategoriasPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        icon: "Package"
    })

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login")
        } else {
            loadCategories()
        }
    }, [user, authLoading, router])

    const loadCategories = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("name")

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error("Erro ao carregar categorias:", error)
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

        try {
            const slug = generateSlug(formData.name)
            console.log("🔗 Slug gerado:", slug)

            if (editingCategory) {
                // Editar
                console.log("✏️ Modo EDIÇÃO - ID:", editingCategory.id)
                const { error } = await supabase
                    .from("categories")
                    .update({
                        name: formData.name,
                        slug: slug,
                        description: formData.description,
                        icon: formData.icon
                    })
                    .eq("id", editingCategory.id)

                if (error) {
                    console.error("❌ Erro ao editar:", error)
                    throw error
                }
                console.log("✅ Editado com sucesso!")
                alert("Categoria atualizada com sucesso!")
            } else {
                // Criar
                console.log("➕ Modo CRIAÇÃO")
                const { error } = await supabase
                    .from("categories")
                    .insert({
                        name: formData.name,
                        slug: slug,
                        description: formData.description,
                        icon: formData.icon
                    })

                if (error) {
                    console.error("❌ Erro ao criar:", error)
                    throw error
                }
                console.log("✅ Criado com sucesso!")
                alert("Categoria criada com sucesso!")
            }

            setIsModalOpen(false)
            setEditingCategory(null)
            setFormData({ name: "", description: "", icon: "Package" })
            await loadCategories()
        } catch (error: any) {
            console.error("❌ Erro geral:", error)
            alert(`Erro: ${error.message || JSON.stringify(error)}`)
        }
    }

    const handleDelete = async (id: string) => {
        console.log("🗑️ handleDelete chamado - ID:", id)

        if (!confirm("Tem certeza que deseja excluir esta categoria?\n\nAVISO: Todos os anúncios desta categoria ficarão sem categoria!")) {
            console.log("❌ Usuário cancelou")
            return
        }

        try {
            console.log("🔍 Verificando uso da categoria...")
            const { data: usageData, error: usageError } = await supabase
                .from("listings")
                .select("id")
                .eq("category_id", id)
                .limit(1)

            if (usageError) {
                console.error("⚠️ Erro ao verificar uso:", usageError)
            }

            console.log("📊 Dados de uso:", usageData)

            if (usageData && usageData.length > 0) {
                console.log("⚠️ Categoria em uso, pedindo confirmação...")
                const confirmCascade = confirm(
                    "⚠️ Esta categoria está sendo usada em anúncios.\n\n" +
                    "Ao excluir, os anúncios ficarão SEM CATEGORIA.\n\n" +
                    "Deseja continuar?"
                )

                if (!confirmCascade) {
                    console.log("❌ Usuário cancelou exclusão")
                    return
                }

                console.log("🔄 Removendo categoria dos anúncios...")
                const { error: updateError } = await supabase
                    .from("listings")
                    .update({ category_id: null })
                    .eq("category_id", id)

                if (updateError) {
                    console.error("❌ Erro ao atualizar anúncios:", updateError)
                    alert("Erro ao remover categoria dos anúncios.")
                    return
                }
                console.log("✅ Categoria removida dos anúncios")
            }

            console.log("🗑️ Deletando categoria...")
            const { error } = await supabase
                .from("categories")
                .delete()
                .eq("id", id)

            if (error) {
                console.error("❌ Erro ao deletar categoria:", error)
                throw error
            }

            console.log("✅ Categoria deletada com sucesso!")
            alert("✅ Categoria excluída com sucesso!")
            await loadCategories()
        } catch (error: any) {
            console.error("❌ Erro geral ao excluir:", error)
            alert(`❌ Erro ao excluir categoria: ${error.message || JSON.stringify(error)}`)
        }
    }

    const openEdit = (category: Category) => {
        console.log("✏️ openEdit chamado:", category)
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description || "",
            icon: category.icon || "Package"
        })
        setIsModalOpen(true)
    }

    const openNew = () => {
        console.log("➕ openNew chamado")
        setEditingCategory(null)
        setFormData({ name: "", description: "", icon: "Package" })
        setIsModalOpen(true)
    }

    // Função para renderizar o ícone dinamicamente
    const renderIcon = (iconName: string) => {
        const IconComponent = (LucideIcons as any)[iconName]
        if (IconComponent) {
            return <IconComponent className="h-5 w-5" />
        }
        return <LucideIcons.Package className="h-5 w-5" />
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
                        <h1 className="text-3xl font-bold">Gerenciar Categorias</h1>
                        <p className="text-muted-foreground">Crie e edite as categorias disponíveis para os anúncios</p>
                    </div>
                    <Button onClick={openNew} className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Categoria
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <Card key={category.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    {renderIcon(category.icon)}
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{category.name}</p>
                                    {category.description && (
                                        <p className="text-xs text-muted-foreground">{category.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                                    <Edit className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Eletrônicos"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Descrição (opcional)</label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ex: Smartphones, computadores e gadgets"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ícone</label>
                                <Select
                                    value={formData.icon}
                                    onValueChange={(val) => setFormData({ ...formData, icon: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um ícone" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        {ICON_OPTIONS.map((option) => {
                                            const IconComp = option.icon
                                            return (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center gap-2">
                                                        <IconComp className="w-4 h-4" />
                                                        {option.label}
                                                    </div>
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                                <div className="mt-2 p-3 bg-muted rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            {renderIcon(formData.icon)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{formData.name || "Nome da Categoria"}</p>
                                            {formData.description && (
                                                <p className="text-xs text-muted-foreground">{formData.description}</p>
                                            )}
                                        </div>
                                    </div>
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
