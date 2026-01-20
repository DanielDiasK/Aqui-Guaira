"use client"

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ChevronLeft, ChevronRight, Package } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
  categoryId: string;
  city: string;
  state: string;
  views: number;
  badges: Array<{ name: string; color?: string }>;
}

const Marketplace = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar categorias
  useEffect(() => {
    loadCategories();
  }, []);

  // Carregar anúncios
  useEffect(() => {
    loadListings();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings_with_category')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar anúncios
  const filteredListings = listings.filter(listing => {
    if (selectedCategory) {
      return listing.categoryId === selectedCategory;
    }
    return true;
  });

  // Agrupar anúncios por categoria
  const groupedByCategory = filteredListings.reduce((acc, listing) => {
    const category = listing.category || 'Sem Categoria';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(listing);
    return acc;
  }, {} as Record<string, Listing[]>);

  // Ordenar por visualizações
  Object.keys(groupedByCategory).forEach(category => {
    groupedByCategory[category].sort((a, b) => b.views - a.views);
  });

  const handleCategoryClick = (categoryId: string) => {
    const newSelection = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newSelection);
    
    if (newSelection) {
      setTimeout(() => {
        const section = document.getElementById('anuncios-section');
        if (section) {
          const yOffset = -100;
          const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative border-b border-border bg-gradient-to-b from-background to-secondary/30 px-4 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-90 brightness-75"
          >
            <source src="/video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/30" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-block">
            <span className="inline-block rounded-full bg-white/90 backdrop-blur-sm px-4 py-1 text-xs font-semibold text-black border border-gray-300">
              🚀 Uma iniciativa do Grupo RAVAL
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white drop-shadow-2xl sm:text-5xl md:text-6xl text-balance">
            O Marketplace dos Guairenses, Feito por Guairenses
          </h1>

          <p className="mb-8 text-lg text-white font-medium drop-shadow-xl text-balance">
            Compre e venda com segurança na sua cidade! O MarketGuaira conecta você com os melhores negócios de Guaíra-SP.
          </p>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-3 bg-background border-b border-border shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground shadow-md scale-105'
                        : 'bg-card hover:bg-accent border border-border'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span className="font-medium text-sm whitespace-nowrap">
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Listings Section */}
      <section id="anuncios-section" className="px-4 py-16 bg-background">
        <div className="mx-auto max-w-7xl space-y-12">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando anúncios...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Nenhum anúncio encontrado.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Seja o primeiro a publicar um anúncio!
              </p>
            </div>
          ) : (
            <>
              {Object.entries(groupedByCategory).map(([category, categoryListings]) => (
                <div key={category} className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Recomendados para você em {category}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categoryListings.slice(0, 8).map((listing) => (
                      <Card
                        key={listing.id}
                        className="overflow-hidden border-border hover:border-accent hover:shadow-lg transition-all duration-300 bg-card cursor-pointer group p-0"
                        onClick={() => navigate(`/anuncio/${listing.id}`)}
                      >
                        {/* Image */}
                        <div className="relative h-40 overflow-hidden bg-muted">
                          <img
                            src={listing.images[0] || '/placeholder.svg'}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="p-2.5 space-y-1">
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">{listing.category}</p>
                            <h3 className="font-semibold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                              {listing.title}
                            </h3>
                          </div>

                          {/* Price */}
                          <div>
                            <p className="text-lg font-bold text-primary">
                              R$ {listing.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>

                          {/* Location */}
                          {listing.city && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{listing.city}, {listing.state}</span>
                            </div>
                          )}

                          {/* Badges */}
                          {listing.badges && listing.badges.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {listing.badges.slice(0, 2).map((badge, index) => (
                                <Badge
                                  key={`${badge.name}-${index}`}
                                  className={`text-xs font-medium border ${badge.color || "bg-gray-100 text-gray-800 border-gray-200"}`}
                                >
                                  {badge.name}
                                </Badge>
                              ))}
                              {listing.badges.length > 2 && (
                                <Badge className="text-xs font-medium bg-gray-100 text-gray-600 border-gray-200">
                                  +{listing.badges.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Marketplace;
