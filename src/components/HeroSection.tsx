import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [currentAd, setCurrentAd] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const anuncios = [
    {
      titulo: "Descubra Empresas Locais",
      descricao: "Encontre os melhores estabelecimentos de Guaíra",
      imagem: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
      cta: "Ver Empresas"
    },
    {
      titulo: "Mural Comunitário",
      descricao: "Compartilhe notícias e fique por dentro dos eventos da cidade",
      imagem: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop",
      cta: "Acessar Mural"
    },
    {
      titulo: "Cadastre sua Empresa",
      descricao: "Divulgue seu negócio gratuitamente no portal",
      imagem: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop",
      cta: "Cadastrar Agora"
    }
  ];

  useEffect(() => {
    // Sempre mostra a splash screen ao carregar/atualizar a página
    // Inicia fade out após 2.5 segundos
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Remove splash completamente após 3 segundos
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(splashTimer);
    };
  }, []);

  // Carrossel de anúncios
  useEffect(() => {
    if (!showSplash) {
      const adTimer = setInterval(() => {
        setCurrentAd((prev) => (prev + 1) % anuncios.length);
      }, 4000);
      
      return () => clearInterval(adTimer);
    }
  }, [showSplash, anuncios.length]);

  // Splash screen com animação de digitação
  if (showSplash) {
    return (
      <div className={`fixed inset-0 z-[9999] bg-gradient-to-br from-primary via-primary/95 to-primary/80 flex items-center justify-center overflow-hidden transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        {/* Efeitos de fundo */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 text-center px-4 max-w-full">
          <div className="mb-6 sm:mb-8">
            <div className="inline-block p-3 sm:p-4 bg-white/10 rounded-2xl backdrop-blur-sm mb-4 sm:mb-6 animate-scale-in">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-3 sm:mb-4 overflow-hidden">
            <span className="inline-block animate-typing-line-1">Aqui Guaíra</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-white/90 overflow-hidden">
            <span className="inline-block animate-typing-line-2">Conectando nossa comunidade</span>
          </p>

          {/* Loading bar */}
          <div className="mt-12 max-w-xs mx-auto">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full animate-loading-bar"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hero normal com carrossel de anúncios em tela cheia
  return (
    <section className="relative bg-gradient-to-br from-accent via-accent/80 to-primary/10 min-h-screen flex items-center justify-center overflow-hidden animate-fade-in">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Menu Mobile - Botão Hamburguer */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="xl:hidden fixed top-4 right-4 z-50 bg-primary text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Menu Mobile - Drawer */}
      <div className={`xl:hidden fixed inset-y-0 right-0 z-40 w-72 bg-white shadow-2xl transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full overflow-y-auto p-6 pt-20">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Menu Principal</h3>
          <div className="space-y-3">
            <button 
              onClick={() => { navigate('/painel-cidade'); setMobileMenuOpen(false); }}
              className="w-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-3 rounded-xl shadow-lg transition-all hover:scale-105 text-left"
            >
              <div className="text-xs opacity-90">Acesse</div>
              <div className="text-sm">🏛️ Painel da Cidade</div>
            </button>
            <button 
              onClick={() => { navigate('/servicos-por-bairro'); setMobileMenuOpen(false); }}
              className="w-full bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-4 py-3 rounded-xl shadow-lg transition-all hover:scale-105 text-left"
            >
              <div className="text-xs opacity-90">Veja</div>
              <div className="text-sm">🏘️ Serviços por Bairro</div>
            </button>
            <button 
              onClick={() => { navigate('/achados-perdidos'); setMobileMenuOpen(false); }}
              className="w-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-4 py-3 rounded-xl shadow-lg transition-all hover:scale-105 text-left"
            >
              <div className="text-xs opacity-90">Consulte</div>
              <div className="text-sm">🔍 Achados e Perdidos</div>
            </button>
            <button 
              onClick={() => { navigate('/pets-perdidos'); setMobileMenuOpen(false); }}
              className="w-full bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold px-4 py-3 rounded-xl shadow-lg transition-all hover:scale-105 text-left"
            >
              <div className="text-xs opacity-90">Ajude</div>
              <div className="text-sm">🐾 Pets Perdidos e Adoção</div>
            </button>
            <button 
              onClick={() => { navigate('/mural'); setMobileMenuOpen(false); }}
              className="w-full bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold px-4 py-3 rounded-xl shadow-lg transition-all hover:scale-105 text-left"
            >
              <div className="text-xs opacity-90">Acesse</div>
              <div className="text-sm">📰 Mural</div>
            </button>
            <button 
              onClick={() => { navigate('/empresas'); setMobileMenuOpen(false); }}
              className="w-full bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold px-4 py-3 rounded-xl shadow-lg transition-all hover:scale-105 text-left"
            >
              <div className="text-xs opacity-90">Encontre</div>
              <div className="text-sm">🏢 Empresas</div>
            </button>
            <button 
              onClick={() => { navigate('/farmacia-plantao'); setMobileMenuOpen(false); }}
              className="w-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-4 py-3 rounded-xl shadow-lg transition-all hover:scale-105 text-left"
            >
              <div className="text-xs opacity-90">Veja</div>
              <div className="text-sm">💊 Farmácia Plantão</div>
            </button>
            <button 
              onClick={() => { navigate('/saude-na-pratica'); setMobileMenuOpen(false); }}
              className="w-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-4 py-3 rounded-xl shadow-lg transition-all hover:scale-105 text-left"
            >
              <div className="text-xs opacity-90">Acesse</div>
              <div className="text-sm">💉 Saúde na Prática</div>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay quando menu está aberto */}
      {mobileMenuOpen && (
        <div 
          className="xl:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <div className="container mx-auto px-2 sm:px-4 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 max-w-[1400px] mx-auto">
          {/* Botões Esquerda - Ocultos no mobile */}
          <div className="hidden xl:flex flex-col gap-3">
            <button 
              onClick={() => navigate('/painel-cidade')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 w-[160px]"
            >
              <div className="text-center">
                <div className="text-xs opacity-90">Acesse</div>
                <div className="text-sm">🏛️ Painel da Cidade</div>
              </div>
            </button>
            <button 
              onClick={() => navigate('/servicos-por-bairro')}
              className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 w-[160px]"
            >
              <div className="text-center">
                <div className="text-xs opacity-90">Veja</div>
                <div className="text-sm">🏘️ Serviços por Bairro</div>
              </div>
            </button>
            <button 
              onClick={() => navigate('/achados-perdidos')}
              className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 w-[160px]"
            >
              <div className="text-center">
                <div className="text-xs opacity-90">Consulte</div>
                <div className="text-sm">🔍 Achados e Perdidos</div>
              </div>
            </button>
            <button 
              onClick={() => navigate('/pets-perdidos')}
              className="bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 w-[160px]"
            >
              <div className="text-center">
                <div className="text-xs opacity-90">Ajude</div>
                <div className="text-sm">🐾 Pets Perdidos e Adoção</div>
              </div>
            </button>
          </div>

          {/* Carrossel de Anúncios */}
          <div className="w-full max-w-6xl flex-shrink-0">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl">
              {anuncios.map((anuncio, index) => (
                <div
                  key={index}
                  className={`transition-all duration-700 ${
                    index === currentAd 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 absolute inset-0 translate-x-full'
                  }`}
                >
                  <div className="relative h-[400px] sm:h-[500px] md:h-[600px] bg-gradient-to-br from-primary/20 to-accent/20">
                    <img 
                      src={anuncio.imagem} 
                      alt={anuncio.titulo}
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-end p-4 sm:p-8 md:p-12 text-center">
                      <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-2 sm:mb-4">
                        {anuncio.titulo}
                      </h3>
                      <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-4 sm:mb-6 md:mb-8 max-w-2xl px-2">
                        {anuncio.descricao}
                      </p>
                      <button className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 sm:px-10 md:px-12 py-2 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg rounded-full transition-all hover:scale-105 shadow-lg">
                        {anuncio.cta}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Indicadores */}
            <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-8">
              {anuncios.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentAd(index)}
                  className={`h-2 sm:h-3 rounded-full transition-all ${
                    index === currentAd 
                      ? 'bg-primary w-8 sm:w-12' 
                      : 'bg-primary/30 hover:bg-primary/50 w-2 sm:w-3'
                  }`}
                  aria-label={`Anúncio ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Botões Direita */}
          <div className="hidden xl:flex flex-col gap-3">
            <button 
              onClick={() => navigate('/farmacia-plantao')}
              className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 w-[160px]">
              <div className="text-center">
                <div className="text-xs opacity-90">Veja</div>
                <div className="text-sm">💊 Farmácia Plantão</div>
              </div>
            </button>
            <button 
              onClick={() => navigate('/saude-na-pratica')}
              className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 w-[160px]">
              <div className="text-center">
                <div className="text-xs opacity-90">Acesse</div>
                <div className="text-sm">💉 Saúde na Prática</div>
              </div>
            </button>
            <button className="bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 w-[160px]">
              <div className="text-center">
                <div className="text-xs opacity-90">Registre</div>
                <div className="text-sm">🚨 Central de Ocorrências</div>
              </div>
            </button>
            <button 
              onClick={() => navigate('/escolas-creches')}
              className="bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 w-[160px]">
              <div className="text-center">
                <div className="text-xs opacity-90">Encontre</div>
                <div className="text-sm">🏫 Escolas e Creches</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
