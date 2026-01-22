import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Mural from "./pages/Mural";
import MeusPosts from "./pages/MeusPosts";
import Empresas from "./pages/Empresas";
import MeusLocais from "./pages/MeusLocais";
import PerfilEmpresa from "./pages/PerfilEmpresa";
import SuaEmpresa from "./pages/SuaEmpresa";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Marketplace from "./pages/Marketplace";
import FarmaciaPlantao from "./pages/FarmaciaPlantao";
import SaudeNaPratica from "./pages/SaudeNaPratica";
import ServicosPorBairro from "./pages/ServicosPorBairro";
import AchadosPerdidos from "./pages/AchadosPerdidos";
import PetsPerdidos from "./pages/PetsPerdidos";
import PainelCidade from "./pages/PainelCidade";
import EscolasCreches from "./pages/EscolasCreches";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mural" element={<Mural />} />
            <Route path="/mural/meus-posts" element={<MeusPosts />} />
            <Route path="/empresas" element={<Empresas />} />
            <Route path="/meus-locais" element={<MeusLocais />} />
            <Route path="/perfil-de-empresa" element={<PerfilEmpresa />} />
            <Route path="/sua-empresa" element={<SuaEmpresa />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Admin />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/farmacia-plantao" element={<FarmaciaPlantao />} />
            <Route path="/saude-na-pratica" element={<SaudeNaPratica />} />
            <Route path="/servicos-por-bairro" element={<ServicosPorBairro />} />
            <Route path="/achados-perdidos" element={<AchadosPerdidos />} />
            <Route path="/pets-perdidos" element={<PetsPerdidos />} />
            <Route path="/painel-cidade" element={<PainelCidade />} />
            <Route path="/escolas-creches" element={<EscolasCreches />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
