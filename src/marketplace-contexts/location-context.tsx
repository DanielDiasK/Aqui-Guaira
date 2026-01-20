"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface LocationData {
    city: string
    state: string
    postalCode: string
    neighborhood?: string
}

interface LocationContextType {
    location: LocationData | null
    setLocation: (location: LocationData) => void
    isLoading: boolean
    filterEnabled: boolean
    setFilterEnabled: (enabled: boolean) => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
    const [location, setLocationState] = useState<LocationData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [filterEnabled, setFilterEnabledState] = useState(false)

    useEffect(() => {
        // Carregar localização salva ao iniciar
        const savedLocation = localStorage.getItem("@marketguaira/location")
        if (savedLocation) {
            try {
                setLocationState(JSON.parse(savedLocation))
            } catch (e) {
                console.error("Erro ao carregar localização salva", e)
            }
        }

        // Carregar estado do filtro
        const savedFilter = localStorage.getItem("@marketguaira/filter-enabled")
        if (savedFilter) {
            setFilterEnabledState(savedFilter === "true")
        }

        setIsLoading(false)
    }, [])

    const setLocation = (newLocation: LocationData) => {
        setLocationState(newLocation)
        localStorage.setItem("@marketguaira/location", JSON.stringify(newLocation))
    }

    const setFilterEnabled = (enabled: boolean) => {
        setFilterEnabledState(enabled)
        localStorage.setItem("@marketguaira/filter-enabled", enabled.toString())
    }

    return (
        <LocationContext.Provider value={{ location, setLocation, isLoading, filterEnabled, setFilterEnabled }}>
            {children}
        </LocationContext.Provider>
    )
}

export function useLocation() {
    const context = useContext(LocationContext)
    if (context === undefined) {
        throw new Error("useLocation must be used within a LocationProvider")
    }
    return context
}
