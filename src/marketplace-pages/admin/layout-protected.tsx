"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()

    useEffect(() => {
        // Verificar autenticação
        const adminData = localStorage.getItem('marketguaira_admin')
        
        if (!adminData) {
            router.push('/admin/login')
            return
        }

        try {
            const admin = JSON.parse(adminData)
            
            // Verificar se o token ainda é válido (menos de 24h)
            const loginTime = new Date(admin.loginTime).getTime()
            const now = new Date().getTime()
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60)
            
            if (hoursDiff >= 24) {
                localStorage.removeItem('marketguaira_admin')
                router.push('/admin/login')
            }
        } catch (err) {
            localStorage.removeItem('marketguaira_admin')
            router.push('/admin/login')
        }
    }, [router])

    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    )
}
