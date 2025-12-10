'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

interface UserProfile {
    id: string
    email: string
    user_type: 'buyer' | 'agent'
    name?: string
    phone?: string
    whatsapp?: string
}

interface AuthContextType {
    user: User | null
    profile: UserProfile | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signUp: (email: string, password: string, userData: { name: string; userType: 'buyer' | 'agent'; phone?: string }) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    signInWithGoogle: () => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            }
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                }
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
                return
            }

            if (data) {
                // If user is an agent, also fetch agent details
                if (data.user_type === 'agent') {
                    const { data: agentData } = await supabase
                        .from('agents')
                        .select('name, phone, whatsapp')
                        .eq('user_id', userId)
                        .single()

                    setProfile({
                        ...data,
                        name: agentData?.name,
                        phone: agentData?.phone,
                        whatsapp: agentData?.whatsapp,
                    })
                } else {
                    setProfile(data)
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            return { error }
        } catch (error) {
            return { error: error as Error }
        }
    }

    const signUp = async (
        email: string,
        password: string,
        userData: { name: string; userType: 'buyer' | 'agent'; phone?: string }
    ) => {
        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: userData.name,
                        user_type: userData.userType,
                    }
                }
            })

            if (authError) return { error: authError }

            if (authData.user) {
                // 2. Create user profile
                const { error: profileError } = await supabase
                    .from('users')
                    .insert({
                        id: authData.user.id,
                        email: email,
                        user_type: userData.userType,
                    })

                if (profileError) {
                    console.error('Profile creation error:', profileError)
                    return { error: profileError }
                }

                // 3. If agent, create agent profile
                if (userData.userType === 'agent' && userData.phone) {
                    const { error: agentError } = await supabase
                        .from('agents')
                        .insert({
                            user_id: authData.user.id,
                            name: userData.name,
                            phone: userData.phone,
                            whatsapp: userData.phone,
                        })

                    if (agentError) {
                        console.error('Agent creation error:', agentError)
                        return { error: agentError }
                    }
                }
            }

            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        setSession(null)
    }

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                }
            })
            return { error }
        } catch (error) {
            return { error: error as Error }
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            session,
            loading,
            signIn,
            signUp,
            signOut,
            signInWithGoogle,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
