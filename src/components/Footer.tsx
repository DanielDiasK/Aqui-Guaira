const Footer = () => {
  return (
  <footer className="bg-accent/30 border-t border-border mt-16 relative">
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.25),transparent_70%)]" />
      <div className="container mx-auto px-4 py-12 relative">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Aqui Guaíra</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Portal comunitário não oficial da cidade de Guaíra (SP) reunindo dados, locais e iniciativas da comunidade.
            </p>
            <p className="text-xs text-muted-foreground">Não é o site oficial da Prefeitura.</p>
          </div>

          {/* Emergências */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm tracking-wide text-foreground/80 uppercase">Emergências</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-foreground">Guarda Civil Municipal</p>
                <p className="text-muted-foreground">199</p>
                <p className="text-muted-foreground">3331 2273</p>
                <p className="text-muted-foreground">3331 6064</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Polícia Civil</p>
                <p className="text-muted-foreground">3331 2360</p>
                <p className="text-muted-foreground">3331 2500</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Polícia Militar</p>
                <p className="text-muted-foreground">190</p>
                <p className="text-muted-foreground">3331 3881</p>
                <p className="text-muted-foreground">3332 4362</p>
              </div>
            </div>
          </div>

          {/* Portal */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm tracking-wide text-foreground/80 uppercase">Portal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
          <p className="max-w-lg leading-relaxed">
            © {new Date().getFullYear()} Aqui Guaíra • Dados: IBGE • Turismo: Portal Municipal • Projeto colaborativo.
          </p>
          <div className="flex items-center gap-2">
            <span className="opacity-70">Construído com React + Vite + Tailwind.</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="opacity-70">Feito com</span>
            <span className="text-[12px]">❤️</span>
            <span className="px-2 py-0.5 rounded-full border border-border bg-background text-foreground font-semibold">
              Grupo Raval
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
