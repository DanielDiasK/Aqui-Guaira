import { NextResponse } from "next/server"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get("q")

        if (!query) {
            return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
        }

        console.log(`🔍 Searching location for: ${query}`)

        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=br&limit=5`

        const response = await fetch(nominatimUrl, {
            headers: {
                'User-Agent': 'MarketGuaira/1.0 (contato@marketguaira.com.br)', // Email fictício mas válido para o formato
                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                'Referer': 'https://marketguaira.com.br' // Referer fictício
            },
            next: { revalidate: 3600 } // Cache por 1 hora para evitar flood
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`❌ Nominatim API error: ${response.status} ${response.statusText}`, errorText)
            return NextResponse.json({
                error: `Nominatim API error: ${response.status}`,
                details: errorText
            }, { status: response.status })
        }

        const data = await response.json()
        console.log(`✅ Found ${data.length} results for ${query}`)

        return NextResponse.json(data)
    } catch (error: any) {
        console.error("❌ Critical Error in /api/location/search:", error)
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
