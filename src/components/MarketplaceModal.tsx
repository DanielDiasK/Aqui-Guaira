import { X } from "lucide-react";
import { useEffect } from "react";

interface MarketplaceModalProps {
  open: boolean;
  onClose: () => void;
}

export const MarketplaceModal = ({ open, onClose }: MarketplaceModalProps) => {
  useEffect(() => {
    // Prevenir scroll do body quando modal está aberto
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full h-full max-w-[100vw] max-h-[100vh] flex flex-col bg-background">
        {/* Header com botão fechar */}
        <div className="flex items-center justify-between px-4 py-3 bg-background border-b border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-2">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">MarketGuaira</h2>
              <p className="text-xs text-muted-foreground">Marketplace de Guaíra</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Fechar marketplace"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Iframe */}
        <div className="flex-1 relative">
          <iframe
            src={import.meta.env.DEV ? "http://localhost:3001/" : "https://marketguaira.vercel.app"}
            className="w-full h-full border-0"
            title="MarketGuaira"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};
