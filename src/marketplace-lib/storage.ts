// Storage para anúncios - integrado com Supabase
import { supabase, isSupabaseConfigured } from './supabase'

export interface Listing {
  id: string
  userId: string // ID do dono do anúncio (user_profiles)
  title: string
  description: string
  category: string
  categoryId?: string // ID da categoria para filtros
  price: number
  images: string[]
  seller: {
    id: string
    name: string
    rating: number
    reviews: number
    isVerified: boolean
    phone: string | null
    avatarUrl?: string | null
    coverUrl?: string | null
  }
  badges: { name: string; color: string }[]
  views: number
  createdAt: string
  city?: string
  state?: string
  postalCode?: string
}

// Buscar todos os anúncios do Supabase
export async function getListings(): Promise<Listing[]> {
  // Verificar se o Supabase está configurado
  if (!isSupabaseConfigured()) {
    console.warn('Supabase não configurado. Configure as variáveis de ambiente.')
    return []
  }

  try {
    console.log('🔍 Buscando anúncios públicos (aprovados + ativos)...')

    // Buscar da view otimizada que já traz tudo junto
    // Filtrar apenas anúncios aprovados e ativos
    const { data, error } = await supabase
      .from('listings_full')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar listings do Supabase:', error)
      console.error('Detalhes:', error)
      return []
    }

    console.log(`✅ ${data?.length || 0} anúncios aprovados encontrados`)

    if (!data || data.length === 0) {
      console.warn('⚠️ Nenhum anúncio aprovado encontrado. Verifique se executou supabase-update-view.sql')
      return []
    }

    // Transformar dados do Supabase para o formato do componente
    return data.map((item: any) => {
      console.log('🔍 DEBUG - Badges do banco:', item.badges)
      console.log('📍 DEBUG - Localização:', { city: item.city, state: item.state, postal_code: item.postal_code })
      console.log('🏷️ DEBUG - Categoria:', { category_id: item.category_id, category_name: item.category_name })
      return {
        id: item.id,
        userId: item.user_id, // ID do dono do anúncio
        title: item.title,
        description: item.description,
        category: item.category_name || 'Sem categoria',
        categoryId: item.category_id,
        price: item.price,
        images: Array.isArray(item.images) ? item.images : [],
        seller: {
          id: item.seller_id,
          name: item.seller_name || 'Vendedor',
          rating: item.seller_rating || 0,
          reviews: item.seller_reviews || 0,
          isVerified: item.seller_is_verified || false,
          phone: item.seller_phone || null,
          avatarUrl: item.seller_avatar_url || null,
          coverUrl: item.seller_cover_url || null,
        },
        badges: Array.isArray(item.badges) ? item.badges : [],
        views: item.views || 0,
        createdAt: item.created_at,
        city: item.city,
        state: item.state,
        postalCode: item.postal_code,
      }
    })
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error)
    return []
  }
}

// Buscar um único anúncio por ID
export async function getListingById(id: string): Promise<Listing | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase não configurado.')
    return null
  }

  try {
    // Verificar se o usuário atual é admin
    const { data: { user } } = await supabase.auth.getUser()
    let isAdmin = false

    if (user) {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      isAdmin = profileData?.is_admin || false
    }

    console.log('🔍 Buscando anúncio:', id, '| Admin:', isAdmin)

    // Se for admin, busca sem filtrar por status
    // Se não for admin, só mostra anúncios aprovados e ativos
    let query = supabase
      .from('listings_full')
      .select('*')
      .eq('id', id)

    // Apenas usuários não-admin precisam do filtro de aprovação
    if (!isAdmin) {
      query = query
        .eq('is_active', true)
        .eq('status', 'approved')
    }

    const { data, error } = await query.single()

    if (error || !data) {
      console.error('Erro ao buscar listing:', error)
      return null
    }

    console.log('✅ Anúncio encontrado:', data.title, '| Status:', data.status)

    // Incrementar views apenas se não for admin
    if (!isAdmin) {
      await supabase.rpc('increment_listing_views', { listing_uuid: id })
    }

    return {
      id: data.id,
      userId: data.user_id, // ID do dono do anúncio
      title: data.title,
      description: data.description,
      category: data.category_name || 'Sem categoria',
      categoryId: data.category_id, // Adicionar categoryId
      price: data.price,
      images: Array.isArray(data.images) ? data.images : [],
      seller: {
        id: data.seller_id,
        name: data.seller_name || 'Vendedor',
        rating: data.seller_rating || 0,
        reviews: data.seller_reviews || 0,
        isVerified: data.seller_is_verified || false,
        phone: data.seller_phone || null,
        avatarUrl: data.seller_avatar_url || null,
        coverUrl: data.seller_cover_url || null,
      },
      badges: Array.isArray(data.badges) ? data.badges : [],
      views: data.views || 0,
      createdAt: data.created_at,
      city: data.city,
      state: data.state,
      postalCode: data.postal_code,
    }
  } catch (error) {
    console.error('Erro ao buscar listing:', error)
    return null
  }
}

// Adicionar novo anúncio
export async function addListing(listingData: {
  title: string
  description: string
  category: string
  price: number
  images: string[]
  seller: { name: string; rating: number; reviews: number }
  badges: string[]
  views: number
}): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase não configurado.')
    return false
  }

  try {
    console.log('📝 Criando novo anúncio...')
    console.log('Categoria recebida:', listingData.category)

    // 1. Buscar o user_id do usuário logado
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('❌ Usuário não autenticado')
      alert('Você precisa estar logado para publicar um anúncio.')
      return false
    }

    console.log('👤 Usuário logado:', user.id)

    // 2. Buscar o category_id pelo nome da categoria
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', listingData.category)
      .single()

    if (categoryError || !categoryData) {
      console.error('❌ Erro ao buscar categoria:', categoryError)
      console.error('Categoria buscada:', listingData.category)
      alert(`Categoria "${listingData.category}" não encontrada no banco de dados.`)
      return false
    }

    console.log('📂 Categoria encontrada:', categoryData.id)

    // 3. Criar o anúncio
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        user_id: user.id,
        seller_id: user.id, // Por enquanto, seller_id = user_id
        category_id: categoryData.id,
        title: listingData.title,
        description: listingData.description,
        price: listingData.price,
        views: 0,
        is_active: true,
        status: 'pending' // Anúncio começa como pendente para aprovação
      })
      .select()
      .single()

    if (listingError || !listing) {
      console.error('❌ Erro ao criar listing:', listingError)
      alert('Erro ao criar anúncio. Verifique os dados e tente novamente.')
      return false
    }

    console.log('✅ Anúncio criado:', listing.id)

    // 4. Salvar imagens
    if (listingData.images.length > 0) {
      const imageInserts = listingData.images.map((imageUrl, index) => ({
        listing_id: listing.id,
        image_url: imageUrl,
        display_order: index
      }))

      const { error: imagesError } = await supabase
        .from('listing_images')
        .insert(imageInserts)

      if (imagesError) {
        console.error('⚠️ Erro ao salvar imagens:', imagesError)
        // Não falha a operação, apenas avisa
      } else {
        console.log(`✅ ${listingData.images.length} imagens salvas`)
      }
    }

    // 5. Associar badges
    if (listingData.badges.length > 0) {
      // Buscar os IDs dos badges pelos nomes
      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .select('id, name')
        .in('name', listingData.badges)

      if (badgesError) {
        console.error('⚠️ Erro ao buscar badges:', badgesError)
      } else if (badgesData && badgesData.length > 0) {
        const badgeInserts = badgesData.map(badge => ({
          listing_id: listing.id,
          badge_id: badge.id
        }))

        const { error: badgeAssocError } = await supabase
          .from('listing_badges')
          .insert(badgeInserts)

        if (badgeAssocError) {
          console.error('⚠️ Erro ao associar badges:', badgeAssocError)
        } else {
          console.log(`✅ ${badgesData.length} badges associados`)
        }
      }
    }

    console.log('🎉 Anúncio publicado com sucesso!')
    console.log('⏳ Status: Pendente de aprovação pelo administrador')

    alert('✅ Anúncio criado com sucesso!\n\n⏳ Seu anúncio está pendente de aprovação e será revisado em breve.')

    return true
  } catch (error) {
    console.error('❌ Erro ao adicionar listing:', error)
    alert('Erro inesperado ao publicar anúncio. Tente novamente.')
    return false
  }
}

// Verificar se um anúncio está salvo
export async function isListingSaved(listingId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('saved_listings')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .single()

    return !error && !!data
  } catch (error) {
    console.error('Erro ao verificar favorito:', error)
    return false
  }
}

// Salvar anúncio (favoritar)
export async function saveListing(listingId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    alert('Sistema não configurado.')
    return false
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Você precisa estar logado para salvar anúncios.')
      return false
    }

    const { error } = await supabase
      .from('saved_listings')
      .insert({
        user_id: user.id,
        listing_id: listingId
      })

    if (error) {
      console.error('Erro ao salvar anúncio:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao salvar anúncio:', error)
    return false
  }
}

// Remover anúncio salvo (desfavoritar)
export async function unsaveListing(listingId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('saved_listings')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId)

    if (error) {
      console.error('Erro ao remover anúncio salvo:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao remover anúncio salvo:', error)
    return false
  }
}

