"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Users,
  TrendingUp,
  Eye,
  Search
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Stats {
  pending_count: number
  approved_count: number
  rejected_count: number
  today_count: number
  week_count: number
  total_sellers: number
  active_sellers: number
}

interface CityStats {
  city: string
  state: string
  count: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [topCities, setTopCities] = useState<CityStats[]>([])
  const [allCities, setAllCities] = useState<CityStats[]>([])
  const [citiesModalOpen, setCitiesModalOpen] = useState(false)
  const [citiesSearchQuery, setCitiesSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    loadTopCities()
  }, [])

  const loadTopCities = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('city, state')
        .not('city', 'is', null)

      if (error) throw error

      if (data) {
        // Agrupar e contar
        const cityMap = new Map<string, { city: string, state: string, count: number }>()

        data.forEach(item => {
          const key = `${item.city}-${item.state}`
          if (cityMap.has(key)) {
            cityMap.get(key)!.count++
          } else {
            cityMap.set(key, { city: item.city, state: item.state, count: 1 })
          }
        })

        // Converter para array e ordenar
        const sortedCities = Array.from(cityMap.values())
          .sort((a, b) => b.count - a.count)

        setAllCities(sortedCities)
        setTopCities(sortedCities.slice(0, 5)) // Top 5
      }
    } catch (err) {
      console.error("Erro ao carregar top cidades:", err)
    }
  }

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_admin_stats')

      if (error) {
        console.error("Erro ao carregar estatísticas:", error)
        return
      }

      if (data && data.length > 0) {
        setStats(data[0])
      }
    } catch (err) {
      console.error("Erro:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Pendentes",
      value: stats?.pending_count || 0,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "+12%",
    },
    {
      title: "Aprovados",
      value: stats?.approved_count || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+24%",
    },
    {
      title: "Rejeitados",
      value: stats?.rejected_count || 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      change: "-5%",
    },
    {
      title: "Total Anúncios",
      value: (stats?.pending_count || 0) + (stats?.approved_count || 0) + (stats?.rejected_count || 0),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+18%",
    },
    {
      title: "Hoje",
      value: stats?.today_count || 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+8",
    },
    {
      title: "Esta Semana",
      value: stats?.week_count || 0,
      icon: Eye,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
      change: "+32",
    },
    {
      title: "Vendedores Ativos",
      value: stats?.active_sellers || 0,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      change: "+15%",
    },
    {
      title: "Total Vendedores",
      value: stats?.total_sellers || 0,
      icon: Users,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      change: "+8%",
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Dashboard Administrativo
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo ao painel de administração do MarketGuaira
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <a
              href="/admin/pendentes"
              className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Revisar Pendentes</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.pending_count || 0} anúncios aguardando aprovação
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/admin/usuarios"
              className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Gerenciar Usuários</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.total_sellers || 0} usuários cadastrados
                  </p>
                </div>
              </div>
            </a>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Top Cidades</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8"
              onClick={() => setCitiesModalOpen(true)}
            >
              Ver todos
            </Button>
          </div>
          <div className="space-y-3">
            {topCities.length > 0 ? (
              topCities.map((city, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-50 text-blue-700'
                      }`}>
                      {index + 1}º
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{city.city}</p>
                      <p className="text-xs text-muted-foreground">{city.state}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-foreground">{city.count}</span>
                    <p className="text-xs text-muted-foreground">anúncios</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma cidade encontrada
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Atividade Recente</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-foreground">3 anúncios aprovados</p>
                <p className="text-xs text-muted-foreground">há 2 horas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Package className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-foreground">5 novos anúncios criados</p>
                <p className="text-xs text-muted-foreground">há 4 horas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Users className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-foreground">2 novos usuários</p>
                <p className="text-xs text-muted-foreground">há 6 horas</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Cities Modal */}
      <Dialog open={citiesModalOpen} onOpenChange={setCitiesModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Todas as Cidades ({allCities.length})</DialogTitle>
          </DialogHeader>

          <div className="relative my-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cidade..."
              value={citiesSearchQuery}
              onChange={(e) => setCitiesSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
            {allCities
              .filter(c =>
                c.city.toLowerCase().includes(citiesSearchQuery.toLowerCase()) ||
                c.state.toLowerCase().includes(citiesSearchQuery.toLowerCase())
              )
              .map((city, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm bg-gray-100 text-gray-700`}>
                      {index + 1}º
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{city.city}</p>
                      <p className="text-xs text-muted-foreground">{city.state}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-foreground">{city.count}</span>
                    <p className="text-xs text-muted-foreground">anúncios</p>
                  </div>
                </div>
              ))}

            {allCities.filter(c =>
              c.city.toLowerCase().includes(citiesSearchQuery.toLowerCase()) ||
              c.state.toLowerCase().includes(citiesSearchQuery.toLowerCase())
            ).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma cidade encontrada
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


