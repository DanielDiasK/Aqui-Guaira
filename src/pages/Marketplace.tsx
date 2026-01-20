"use client"

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft, Home, Package, ShoppingBag, Search, Tag, TrendingUp, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const [search, setSearch] = useState("");

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
    const matchesCategory = selectedCategory ? listing.categoryId === selectedCategory : true;
    const matchesSearch = search === "" ||
      listing.title.toLowerCase().includes(search.toLowerCase()) ||
      listing.category?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Agrupar anúncios por categoria
  const groupedByCategory = filteredListings.reduce((acc, listing) => {
    const category = listing.category || 'Outros';
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow">
        {/* Marketplace Hero Section - Premium Design */}
        <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden bg-background">
          {/* Elementos decorativos */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />

          <div className="container mx-auto px-4 relative z-10">
            {/* Navegação e Botões de Ação */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(-1)}
                  className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6"
                >
                  <Home className="w-4 h-4" />
                  Início
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white/50 backdrop-blur-sm px-4 py-1.5 border-primary/20 text-primary font-bold hidden sm:flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  O Marketplace da Cidade
                </Badge>
              </div>
            </div>

            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 leading-[1.1]">
                  Compre e Venda com <br />
                  <span className="gradient-text">Segurança em Guaíra</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                  A maior vitrine de produtos da nossa comunidade. O MarketGuaira conecta você com os melhores negócios de Guaíra-SP.
                </p>
              </div>

              {/* Barra de Busca Premium */}
              <div className="max-w-2xl mx-auto relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all -z-10" />
                <div className="relative flex items-center gap-2 bg-white p-2 rounded-2xl border-2 border-primary/10 shadow-xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="O que você está procurando hoje?"
                      className="pl-12 py-7 text-lg bg-transparent border-0 focus-visible:ring-0 shadow-none"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Button size="lg" className="rounded-xl px-8 py-7 bg-primary hover:bg-primary/90 hidden sm:flex">
                    Buscar
                  </Button>
                </div>
              </div>

              {/* Categorias - Mobile Scrollable Tags */}
              {categories.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 pt-4">
                  {categories.map((category) => {
                    const isSelected = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-bold text-sm ${isSelected
                          ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105'
                          : 'bg-white text-gray-600 border border-gray-100 hover:border-primary/30 hover:shadow-md'
                          }`}
                      >
                        <Tag className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-primary'}`} />
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Listings Section */}
        <section id="anuncios-section" className="container mx-auto px-4 py-16">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground font-medium">Carregando oportunidades...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-200 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800">Nenhum anúncio encontrado</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                Tente buscar com outro termo ou selecione uma categoria diferente.
              </p>
              <Button
                variant="outline"
                className="mt-6 gap-2"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(null);
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="space-y-20">
              {Object.entries(groupedByCategory).map(([category, categoryListings]) => (
                <div key={category} className="space-y-8 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                        Recomendados em <span className="text-primary">{category}</span>
                      </h2>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      {categoryListings.length} produtos
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categoryListings.slice(0, 8).map((listing) => (
                      <Card
                        key={listing.id}
                        className="group relative flex flex-col glass-card border-2 hover:border-primary/40 transition-all duration-500 overflow-hidden rounded-2xl cursor-pointer p-0"
                        onClick={() => navigate(`/anuncio/${listing.id}`)}
                      >
                        {/* Imagem com Hover Zoom */}
                        <div className="relative aspect-square overflow-hidden bg-gray-50">
                          <img
                            src={listing.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60'}
                            alt={listing.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Badges Flutuantes */}
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {listing.badges && listing.badges.map((badge, idx) => (
                              <Badge
                                key={idx}
                                className="bg-white/90 backdrop-blur-sm text-black border-none text-[10px] font-black uppercase tracking-tighter"
                              >
                                {badge.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Conteúdo do Card */}
                        <div className="p-5 flex-grow flex flex-col gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">{listing.category}</span>
                            <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                              {listing.title}
                            </h3>
                          </div>

                          <div className="mt-auto">
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <p className="text-2xl font-black text-primary tracking-tighter">
                                R$ {listing.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                              <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                                <TrendingUp className="w-3 h-3 text-green-500" />
                                {listing.views} visualizações
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t border-gray-50 pt-3">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              <span className="font-medium">{listing.city || 'Guaíra'}, {listing.state || 'SP'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Efeito de Overlay no Hover */}
                        <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="bg-primary text-white p-2.5 rounded-xl shadow-xl shadow-primary/30">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {categoryListings.length > 8 && (
                    <div className="flex justify-center pt-4">
                      <Button variant="outline" className="rounded-xl border-2 font-bold px-8">
                        Ver tudo em {category}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Marketplace;
