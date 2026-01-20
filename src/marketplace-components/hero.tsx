"use client"

export function Hero() {

  return (
    <section className="relative border-b border-border bg-gradient-to-b from-background to-secondary/30 px-4 py-16 sm:py-24 overflow-hidden">
      {/* Background Video */}
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
  )
}
