'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
    const router = useRouter()

    useEffect(() => {
        const handleCallback = async () => {
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Auth callback error:', error)
                router.push('/login?error=callback_failed')
                return
            }

            if (session) {
                // Check if user profile exists
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                if (!profile) {
                    // Create user profile for OAuth users
                    await supabase.from('users').insert({
                        id: session.user.id,
                        email: session.user.email,
                        user_type: 'buyer', // Default to buyer for OAuth
                    })
                }

                router.push('/')
            } else {
                router.push('/login')
            }
        }

        handleCallback()
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Completing sign in...</p>
            </div>
        </div>
    )
}
