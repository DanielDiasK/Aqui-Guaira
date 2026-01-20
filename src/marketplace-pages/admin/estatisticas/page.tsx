'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  Eye,
  DollarSign,
  Activity,
  Award,
  Calendar,
  Tag,
} from 'lucide-react'

interface Stats {
  totalListings: number
  activeListings: number
  totalUsers: number
  totalViews: number
  totalRevenue: number
  avgPrice: number
  listingsGrowth: number
  usersGrowth: number
  viewsGrowth: number
}

interface CategoryData {
  name: string
  value: number
  percentage: number
}

interface TimeSeriesData {
  date: string
  listings: number
  users: number
  views: number
}

interface TopListing {
  title: string
  views: number
  price: number
  seller_name: string
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#f97316', '#14b8a6']

export default function EstatisticaPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [topListings, setTopListings] = useState<TopListing[]>([])
  const [priceDistribution, setPriceDistribution] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  async function loadStatistics() {
    try {
      setLoading(true)

      // Buscar estatísticas gerais
      const [listingsRes, usersRes, viewsRes] = await Promise.all([
        supabase.from('listings').select('id, price, views, created_at, is_active'),
        supabase.from('sellers').select('id, created_at'),
        supabase.from('listings').select('views'),
      ])

      const listings = listingsRes.data || []
      const users = usersRes.data || []
      const activeListings = listings.filter(l => l.is_active).length

      // Calcular receita total estimada (apenas anúncios ativos)
      const totalRevenue = listings
        .filter(l => l.is_active)
        .reduce((sum, l) => sum + (l.price || 0), 0)

      const avgPrice = listings.length > 0
        ? listings.reduce((sum, l) => sum + (l.price || 0), 0) / listings.length
        : 0

      const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0)

      // Calcular crescimento (últimos 30 dias vs 30 dias anteriores)
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

      const recentListings = listings.filter(
        l => new Date(l.created_at) >= thirtyDaysAgo
      ).length
      const previousListings = listings.filter(
        l => new Date(l.created_at) >= sixtyDaysAgo && new Date(l.created_at) < thirtyDaysAgo
      ).length

      const recentUsers = users.filter(
        u => new Date(u.created_at) >= thirtyDaysAgo
      ).length
      const previousUsers = users.filter(
        u => new Date(u.created_at) >= sixtyDaysAgo && new Date(u.created_at) < thirtyDaysAgo
      ).length

      const listingsGrowth = previousListings > 0
        ? ((recentListings - previousListings) / previousListings) * 100
        : recentListings > 0 ? 100 : 0

      const usersGrowth = previousUsers > 0
        ? ((recentUsers - previousUsers) / previousUsers) * 100
        : recentUsers > 0 ? 100 : 0

      setStats({
        totalListings: listings.length,
        activeListings,
        totalUsers: users.length,
        totalViews,
        totalRevenue,
        avgPrice,
        listingsGrowth,
        usersGrowth,
        viewsGrowth: 0, // Simplificado
      })

      // Buscar dados por categoria
      const { data: categoriesData } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          listings:listings(count)
        `)

      if (categoriesData) {
        const total = listings.length
        const categoryStats: CategoryData[] = categoriesData
          .map(cat => ({
            name: cat.name,
            value: (cat.listings as any)?.[0]?.count || 0,
            percentage: total > 0 ? (((cat.listings as any)?.[0]?.count || 0) / total) * 100 : 0,
          }))
          .filter(c => c.value > 0)
          .sort((a, b) => b.value - a.value)
          .slice(0, 8)

        setCategoryData(categoryStats)
      }

      // Dados de série temporal (últimos 7 dias)
      const timeData: TimeSeriesData[] = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStart = new Date(date.setHours(0, 0, 0, 0))
        const dateEnd = new Date(date.setHours(23, 59, 59, 999))

        const dayListings = listings.filter(
          l => new Date(l.created_at) >= dateStart && new Date(l.created_at) <= dateEnd
        ).length

        const dayUsers = users.filter(
          u => new Date(u.created_at) >= dateStart && new Date(u.created_at) <= dateEnd
        ).length

        timeData.push({
          date: dateStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          listings: dayListings,
          users: dayUsers,
          views: Math.floor(Math.random() * 100) + 50, // Simulado
        })
      }
      setTimeSeriesData(timeData)

      // Top 5 anúncios mais vistos
      const { data: topListingsData } = await supabase
        .from('listings_full')
        .select('title, views, price, seller_name')
        .order('views', { ascending: false })
        .limit(5)

      if (topListingsData) {
        setTopListings(topListingsData)
      }

      // Distribuição de preços
      const priceRanges = [
        { range: 'R$ 0-50', min: 0, max: 50, count: 0 },
        { range: 'R$ 51-100', min: 51, max: 100, count: 0 },
        { range: 'R$ 101-200', min: 101, max: 200, count: 0 },
        { range: 'R$ 201-500', min: 201, max: 500, count: 0 },
        { range: 'R$ 501-1000', min: 501, max: 1000, count: 0 },
        { range: 'R$ 1000+', min: 1001, max: Infinity, count: 0 },
      ]

      listings.forEach(listing => {
        const price = listing.price || 0
        const range = priceRanges.find(r => price >= r.min && price <= r.max)
        if (range) range.count++
      })

      setPriceDistribution(priceRanges.filter(r => r.count > 0))

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-6">
        <p className="text-red-500">Erro ao carregar estatísticas</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estatísticas</h1>
          <p className="text-muted-foreground mt-1">
            Análise completa da plataforma
          </p>
        </div>
        <button
          onClick={loadStatistics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Atualizar Dados
        </button>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Anúncios"
          value={stats.totalListings}
          icon={<ShoppingBag className="w-5 h-5" />}
          trend={stats.listingsGrowth}
          subtitle={`${stats.activeListings} ativos`}
          color="blue"
        />
        <StatCard
          title="Total de Usuários"
          value={stats.totalUsers}
          icon={<Users className="w-5 h-5" />}
          trend={stats.usersGrowth}
          subtitle="vendedores cadastrados"
          color="purple"
        />
        <StatCard
          title="Total de Visualizações"
          value={stats.totalViews}
          icon={<Eye className="w-5 h-5" />}
          trend={stats.viewsGrowth}
          subtitle="todas os anúncios"
          color="pink"
        />
        <StatCard
          title="Preço Médio"
          value={`R$ ${stats.avgPrice.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5" />}
          subtitle={`Total: R$ ${stats.totalRevenue.toFixed(2)}`}
          color="green"
        />
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Crescimento */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Crescimento nos Últimos 7 Dias
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="listings"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorListings)"
                name="Anúncios"
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorUsers)"
                name="Usuários"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Gráfico de Categorias */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-purple-600" />
            Anúncios por Categoria
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Gráficos Secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Preços */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Distribuição de Preços
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Anúncios */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Top 5 Anúncios Mais Vistos
          </h3>
          <div className="space-y-3">
            {topListings.map((listing, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                      {index + 1}
                    </span>
                    <p className="font-medium truncate">{listing.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    por {listing.seller_name}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-blue-600">
                    {listing.views} views
                  </p>
                  <p className="text-sm text-muted-foreground">
                    R$ {listing.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Ranking de Categorias */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          Ranking Completo de Categorias
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={120} />
            <Tooltip />
            <Bar dataKey="value" fill="#f59e0b" name="Anúncios">
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-l-4 border-l-blue-600">
          <h4 className="font-semibold text-blue-600 mb-2">Taxa de Ativação</h4>
          <p className="text-3xl font-bold">
            {((stats.activeListings / stats.totalListings) * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            dos anúncios estão ativos
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-purple-600">
          <h4 className="font-semibold text-purple-600 mb-2">Visualizações Médias</h4>
          <p className="text-3xl font-bold">
            {(stats.totalViews / stats.totalListings).toFixed(0)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            por anúncio na plataforma
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-green-600">
          <h4 className="font-semibold text-green-600 mb-2">Anúncios por Usuário</h4>
          <p className="text-3xl font-bold">
            {(stats.totalListings / stats.totalUsers).toFixed(1)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            média de anúncios criados
          </p>
        </Card>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
  subtitle?: string
  color: 'blue' | 'purple' | 'pink' | 'green'
}

function StatCard({ title, value, icon, trend, subtitle, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600',
    purple: 'bg-purple-500/10 text-purple-600',
    pink: 'bg-pink-500/10 text-pink-600',
    green: 'bg-green-500/10 text-green-600',
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </Card>
  )
}
