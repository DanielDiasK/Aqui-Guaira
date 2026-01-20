"use client"

import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <div className="grid gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                MG
              </div>
              <span className="font-bold text-foreground">MarketGuaira</span>
            </div>
            <p className="text-sm text-muted-foreground">
              O marketplace oficial de Guaíra-SP. Desenvolvido com ❤️ pelo Grupo RAVAL para fortalecer o comércio local.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Navegue</h3>
            <ul className="space-y-2">
              {["Categorias", "Novidades", "Sobre Guaíra", "Como Funciona"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Suporte</h3>
            <ul className="space-y-2">
              {["Privacidade", "Termos de Uso", "FAQ", "Fale Conosco"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Siga-nos</h3>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="rounded-lg bg-secondary p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">© 2025 MarketGuaira - Grupo RAVAL. Orgulhosamente feito em Guaíra-SP 🇧🇷</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Status
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Suporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
