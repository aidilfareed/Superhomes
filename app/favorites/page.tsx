'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'

export default function FavoritesPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container-custom py-12">
                <h1 className="font-heading font-bold text-3xl text-gray-900 mb-8">Saved Properties</h1>

                {/* Empty State */}
                <div className="glass p-12 rounded-2xl text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h2 className="font-heading font-semibold text-xl text-gray-900 mb-2">
                        No saved properties yet
                    </h2>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        When you find properties you like, click the heart icon to save them here for easy access later.
                    </p>
                    <Link href="/properties" className="btn-primary inline-block">
                        Browse Properties
                    </Link>
                </div>

                {/* Future: Display saved properties grid here */}
                {/* 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProperties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
                */}
            </div>

            <Footer />
        </div>
    )
}
