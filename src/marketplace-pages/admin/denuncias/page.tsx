"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Flag, User, Package, Eye, CheckCircle, XCircle, MessageSquare, Calendar, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Report {
    id: string
    report_type: 'user' | 'listing'
    reason: string
    description: string
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
    admin_notes: string | null
    created_at: string
    reporter_email: string
    reporter_name: string
    reported_user_email: string
    reported_user_name: string
    reported_listing_id: string | null
    listing_title: string | null
    listing_price: number | null
    resolver_name: string | null
    resolved_at: string | null
}

const REASON_LABELS: Record<string, string> = {
    spam: "Spam",
    inappropriate_content: "Conteúdo Inapropriado",
    fake_product: "Produto Falso",
    scam: "Golpe/Fraude",
    offensive_behavior: "Comportamento Ofensivo",
    copyright: "Violação de Direitos Autorais",
    other: "Outro"
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: "Pendente", color: "bg-orange-100 text-orange-800" },
    reviewed: { label: "Em Análise", color: "bg-blue-100 text-blue-800" },
    resolved: { label: "Resolvida", color: "bg-green-100 text-green-800" },
    dismissed: { label: "Descartada", color: "bg-gray-100 text-gray-800" }
}

export default function AdminDenunciasPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [resolveOpen, setResolveOpen] = useState(false)
    const [newStatus, setNewStatus] = useState<string>("")
    const [adminNotes, setAdminNotes] = useState("")
    const [processing, setProcessing] = useState(false)
    const [filterStatus, setFilterStatus] = useState<string>("all")

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login")
        } else {
            loadReports()
        }
    }, [user, authLoading, router])

    const loadReports = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("admin_reports_full")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error
            setReports(data || [])
        } catch (error) {
            console.error("Erro ao carregar denúncias:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetails = (report: Report) => {
        setSelectedReport(report)
        setDetailsOpen(true)
    }

    const handleResolveClick = (report: Report) => {
        setSelectedReport(report)
        setNewStatus(report.status === 'pending' ? 'reviewed' : report.status)
        setAdminNotes(report.admin_notes || "")
        setResolveOpen(true)
    }

    const handleResolve = async () => {
        if (!selectedReport) return

        setProcessing(true)
        try {
            const { error } = await supabase.rpc('resolve_report', {
                report_uuid: selectedReport.id,
                new_status: newStatus,
                notes: adminNotes || null
            })

            if (error) {
                console.error("Erro ao resolver denúncia:", error)
                alert("Erro ao atualizar denúncia")
                return
            }

            alert("Denúncia atualizada com sucesso!")
            setResolveOpen(false)
            setSelectedReport(null)
            loadReports()
        } catch (err) {
            console.error("Erro:", err)
            alert("Erro ao atualizar denúncia")
        } finally {
            setProcessing(false)
        }
    }

    const handleDelete = async (reportId: string) => {
        if (!confirm("Tem certeza que deseja excluir esta denúncia?")) return

        setProcessing(true)
        try {
            const { error } = await supabase
                .from("reports")
                .delete()
                .eq("id", reportId)

            if (error) {
                console.error("Erro ao excluir:", error)
                alert("Erro ao excluir denúncia")
                return
            }

            alert("Denúncia excluída!")
            loadReports()
        } catch (err) {
            console.error("Erro:", err)
            alert("Erro ao excluir denúncia")
        } finally {
            setProcessing(false)
        }
    }

    const filteredReports = filterStatus === "all"
        ? reports
        : reports.filter(r => r.status === filterStatus)

    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        reviewed: reports.filter(r => r.status === 'reviewed').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        dismissed: reports.filter(r => r.status === 'dismissed').length,
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Button variant="ghost" onClick={() => router.push("/admin")} className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar ao Painel
                        </Button>
                        <h1 className="text-3xl font-bold">Gerenciar Denúncias</h1>
                        <p className="text-muted-foreground">
                            {filteredReports.length} denúncia(s) de {reports.length} total
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Total</div>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-orange-600 mb-1">Pendentes</div>
                        <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-blue-600 mb-1">Em Análise</div>
                        <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-green-600 mb-1">Resolvidas</div>
                        <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-gray-600 mb-1">Descartadas</div>
                        <div className="text-2xl font-bold text-gray-600">{stats.dismissed}</div>
                    </Card>
                </div>

                {/* Filter */}
                <Card className="p-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Filtrar por status:</span>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                <SelectItem value="pending">Pendentes</SelectItem>
                                <SelectItem value="reviewed">Em Análise</SelectItem>
                                <SelectItem value="resolved">Resolvidas</SelectItem>
                                <SelectItem value="dismissed">Descartadas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </Card>

                {/* Reports List */}
                <div className="grid gap-4">
                    {filteredReports.length === 0 ? (
                        <Card className="p-12 text-center">
                            <Flag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-xl font-bold mb-2">Nenhuma denúncia encontrada</h3>
                            <p className="text-muted-foreground">
                                {filterStatus === "all"
                                    ? "Não há denúncias no sistema."
                                    : "Não há denúncias com este status."}
                            </p>
                        </Card>
                    ) : (
                        filteredReports.map((report) => (
                            <Card key={report.id} className="p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        {/* Header */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {report.report_type === 'user' ? (
                                                <Badge variant="outline" className="gap-1">
                                                    <User className="h-3 w-3" />
                                                    Usuário
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="gap-1">
                                                    <Package className="h-3 w-3" />
                                                    Anúncio
                                                </Badge>
                                            )}
                                            <Badge className={STATUS_LABELS[report.status].color}>
                                                {STATUS_LABELS[report.status].label}
                                            </Badge>
                                            <Badge variant="outline">
                                                {REASON_LABELS[report.reason] || report.reason}
                                            </Badge>
                                        </div>

                                        {/* Denunciado */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                <span className="font-semibold">Denunciado:</span>
                                                <span className="text-foreground">
                                                    {report.reported_user_name || report.reported_user_email}
                                                </span>
                                            </div>
                                            {report.listing_title && (
                                                <div className="text-sm text-muted-foreground ml-6">
                                                    Anúncio: {report.listing_title} - R$ {report.listing_price?.toFixed(2)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Denunciante */}
                                        <div className="text-sm text-muted-foreground">
                                            Denunciado por: <span className="font-medium">{report.reporter_name || report.reporter_email}</span>
                                        </div>

                                        {/* Descrição */}
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {report.description}
                                        </p>

                                        {/* Data */}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(report.created_at).toLocaleString("pt-BR")}
                                            {report.resolved_at && (
                                                <span className="ml-4">
                                                    Resolvida em: {new Date(report.resolved_at).toLocaleString("pt-BR")}
                                                    {report.resolver_name && ` por ${report.resolver_name}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(report)}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Ver Detalhes
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleResolveClick(report)}
                                            disabled={processing}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Atualizar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => handleDelete(report.id)}
                                            disabled={processing}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Excluir
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* Details Dialog */}
                <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Detalhes da Denúncia</DialogTitle>
                        </DialogHeader>
                        {selectedReport && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Tipo</label>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedReport.report_type === 'user' ? 'Usuário' : 'Anúncio'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <p className="text-sm text-muted-foreground">
                                            {STATUS_LABELS[selectedReport.status].label}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Motivo</label>
                                        <p className="text-sm text-muted-foreground">
                                            {REASON_LABELS[selectedReport.reason]}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Data</label>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(selectedReport.created_at).toLocaleString("pt-BR")}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Denunciante</label>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedReport.reporter_name || selectedReport.reporter_email}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Denunciado</label>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedReport.reported_user_name || selectedReport.reported_user_email}
                                    </p>
                                    {selectedReport.listing_title && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Anúncio: {selectedReport.listing_title}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Descrição</label>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                                        {selectedReport.description}
                                    </p>
                                </div>

                                {selectedReport.admin_notes && (
                                    <div>
                                        <label className="text-sm font-medium">Notas do Admin</label>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                                            {selectedReport.admin_notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Resolve Dialog */}
                <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Atualizar Denúncia</DialogTitle>
                            <DialogDescription>
                                Altere o status e adicione notas sobre a resolução.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Novo Status</label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="reviewed">Em Análise</SelectItem>
                                        <SelectItem value="resolved">Resolvida</SelectItem>
                                        <SelectItem value="dismissed">Descartada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Notas do Admin</label>
                                <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Adicione notas sobre a resolução..."
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setResolveOpen(false)}
                                disabled={processing}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleResolve}
                                disabled={processing}
                            >
                                {processing ? "Salvando..." : "Salvar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
