"use client"

import { useState, useEffect } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { useLocation, LocationData } from "@/contexts/location-context"

interface ViaCEPResponse {
    cep: string
    logradouro: string
    complemento: string
    bairro: string
    localidade: string
    uf: string
    ibge: string
    gia: string
    ddd: string
    siafi: string
}

export function LocationCard() {
    const { location, setLocation, isLoading: isContextLoading, filterEnabled, setFilterEnabled } = useLocation()
    const [localLoading, setLocalLoading] = useState(false)
    const [error, setError] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<LocationData[]>([])
    const [isSearching, setIsSearching] = useState(false)

    // O carregamento inicial agora é feito pelo Contexto, mas mantemos o useEffect para buscar se não tiver nada
    useEffect(() => {
        if (!location && !isContextLoading) {
            getLocation()
        }
    }, [location, isContextLoading])

    const isLoading = isContextLoading || localLoading

    const getLocationFromViaCEP = async (cep: string): Promise<LocationData | null> => {
        try {
            const cleanCEP = cep.replace(/\D/g, '')
            if (cleanCEP.length !== 8) return null

            const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
            const data: ViaCEPResponse = await response.json()

            if (data.cep) {
                return {
                    city: data.localidade,
                    state: data.uf,
                    postalCode: data.cep,
                    neighborhood: data.bairro
                }
            }
            return null
        } catch (err) {
            console.error("Erro ao buscar CEP no ViaCEP:", err)
            return null
        }
    }

    const getCEPFromCoordinates = async (lat: number, lon: number): Promise<string | null> => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
                { headers: { 'User-Agent': 'MarketGuaira/1.0' } }
            )
            const data = await response.json()
            return data.address?.postcode || null
        } catch (err) {
            console.error("Erro ao buscar coordenadas:", err)
            return null
        }
    }

    const getLocation = async () => {
        setLocalLoading(true)
        setError(false)
        setIsOpen(false)

        // Limpa a localização salva ao buscar a atual (o contexto fará a persistência da nova)
        localStorage.removeItem("@marketguaira/location")

        try {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords
                        const cep = await getCEPFromCoordinates(latitude, longitude)

                        if (cep) {
                            const locationData = await getLocationFromViaCEP(cep)
                            if (locationData) {
                                setLocation(locationData)
                                setLocalLoading(false)
                                return
                            }
                        }

                        // Fallback to Nominatim data if ViaCEP fails or no CEP
                        try {
                            const response = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                                { headers: { 'User-Agent': 'MarketGuaira/1.0' } }
                            )
                            const data = await response.json()
                            setLocation({
                                city: data.address.city || data.address.town || "Guaíra",
                                state: data.address.state_code || "SP",
                                postalCode: data.address.postcode || "14790-000",
                                neighborhood: data.address.suburb
                            })
                            setLocalLoading(false)
                        } catch {
                            setLocation({ city: "Guaíra", state: "SP", postalCode: "14790-000" })
                            setLocalLoading(false)
                        }
                    },
                    async () => {
                        const guairaData = await getLocationFromViaCEP("14790-000")
                        setLocation(guairaData || { city: "Guaíra", state: "SP", postalCode: "14790-000" })
                        setLocalLoading(false)
                    }
                )
            } else {
                const guairaData = await getLocationFromViaCEP("14790-000")
                setLocation(guairaData || { city: "Guaíra", state: "SP", postalCode: "14790-000" })
                setLocalLoading(false)
            }
        } catch {
            setError(true)
            setLocalLoading(false)
        }
    }

    const handleSearch = async (query: string) => {
        setSearchQuery(query)
        if (query.length < 3) {
            setSearchResults([])
            return
        }

        setIsSearching(true)

        const isCEP = /^[0-9]{5}-?[0-9]{0,3}$/.test(query)

        if (isCEP && query.replace(/\D/g, '').length === 8) {
            const data = await getLocationFromViaCEP(query)
            if (data) setSearchResults([data])
            else setSearchResults([])
        } else if (!isCEP) {
            try {
                const response = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`)
                if (!response.ok) throw new Error('Falha na busca')
                const data = await response.json()

                const results: LocationData[] = data.map((item: any) => ({
                    city: item.address.city || item.address.town || item.address.village || item.address.municipality || item.display_name.split(',')[0],
                    state: item.address.state_code || (item.address.state ? item.address.state.substring(0, 2).toUpperCase() : "BR"),
                    postalCode: item.address.postcode || "Geral",
                    neighborhood: item.address.suburb
                })).filter((item: LocationData, index: number, self: LocationData[]) =>
                    index === self.findIndex((t) => t.city === item.city && t.state === item.state)
                )

                setSearchResults(results)
            } catch (err) {
                console.error("Erro na busca por nome:", err)
                setSearchResults([])
            }
        }
        setIsSearching(false)
    }

    const handleSelectLocation = (loc: LocationData) => {
        setLocation(loc)
        setIsOpen(false)
        setSearchQuery("")
        setSearchResults([])
    }

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-2 lg:px-4 py-1.5 bg-white dark:bg-card border border-gray-200 dark:border-border lg:border-2 lg:border-gray-300 dark:lg:border-border rounded-lg shadow-sm h-10 lg:h-12">
                <Loader2 className="h-3 w-3 lg:h-4 lg:w-4 animate-spin text-gray-600 dark:text-foreground" />
                <span className="text-[10px] lg:text-xs text-gray-600 dark:text-foreground">Localizando...</span>
            </div>
        )
    }

    if (error || !location) return null

    return (
        <div className="relative">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 lg:gap-2 px-2 lg:px-4 py-1.5 bg-gradient-to-r from-white to-gray-50 dark:from-card dark:to-card border border-gray-200 dark:border-border lg:border-2 lg:border-gray-300 dark:lg:border-border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group h-10 lg:h-12 min-w-[90px] lg:min-w-[200px]"
            >
                <div className="flex items-center justify-center w-5 h-5 lg:w-8 lg:h-8 bg-black dark:bg-primary rounded-full group-hover:scale-110 transition-transform flex-shrink-0">
                    <MapPin className="h-2.5 w-2.5 lg:h-4 lg:w-4 text-white dark:text-primary-foreground" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[9px] lg:text-xs font-bold text-black dark:text-foreground leading-tight truncate max-w-[60px] lg:max-w-[140px]">
                        {location.city}, {location.state}
                    </span>
                    <span className="hidden lg:block text-[10px] text-gray-600 dark:text-muted-foreground leading-tight">
                        {location.postalCode === "Geral" ? "Região" : `CEP: ${location.postalCode}`}
                    </span>
                </div>
            </div>

            {isOpen && (
                <>
                    {/* Overlay para fechar ao clicar fora no mobile */}
                    <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />

                    <div className="fixed left-1/2 top-[70px] -translate-x-1/2 md:absolute md:top-full md:left-auto md:right-0 md:transform-none mt-2 w-[90vw] max-w-[320px] sm:w-80 bg-white dark:bg-card border border-gray-200 dark:border-border md:border-2 md:border-gray-300 dark:md:border-border rounded-lg shadow-xl z-50 p-3 md:p-4">
                        {/* Toggle de Filtro */}
                        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="font-bold text-sm text-blue-900 dark:text-blue-200">Filtrar por localização</div>
                                    <div className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                                        {filterEnabled ? "Mostrando apenas anúncios de " + location.city : "Mostrando todos os anúncios"}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setFilterEnabled(!filterEnabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${filterEnabled ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${filterEnabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="mb-3">
                            <h3 className="font-bold text-sm mb-2 text-foreground">Alterar Localização</h3>
                            <input
                                type="text"
                                placeholder="Digite o CEP ou cidade..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md text-sm bg-white dark:bg-input text-foreground placeholder:text-gray-500 dark:placeholder:text-muted-foreground focus:outline-none focus:border-gray-400 dark:focus:border-ring focus:ring-1 focus:ring-gray-400 dark:focus:ring-ring"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-1">
                            {isSearching ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-gray-400 dark:text-muted-foreground" />
                                </div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((result, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectLocation(result)}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-accent rounded-md text-sm flex items-center gap-2 transition-colors"
                                    >
                                        <MapPin className="h-3 w-3 text-gray-500 dark:text-muted-foreground" />
                                        <div>
                                            <div className="font-medium text-foreground">{result.city}, {result.state}</div>
                                            {result.postalCode !== "Geral" && (
                                                <div className="text-xs text-gray-500 dark:text-muted-foreground">{result.postalCode}</div>
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : searchQuery.length > 2 ? (
                                <div className="text-center py-2 text-sm text-gray-500 dark:text-muted-foreground">
                                    Nenhum local encontrado
                                </div>
                            ) : (
                                <div className="text-center py-2 text-xs text-gray-400 dark:text-muted-foreground">
                                    Digite para buscar
                                </div>
                            )}

                            <div className="border-t border-gray-100 mt-2 pt-2">
                                <button
                                    onClick={() => getLocation()}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm text-blue-600 flex items-center gap-2 font-medium"
                                >
                                    <MapPin className="h-3 w-3" />
                                    Usar minha localização atual
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
