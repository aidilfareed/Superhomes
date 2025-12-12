import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Property {
    id: string
    title: string
    description: string
    price: number
    location: string
    property_type: string // Changed to string for flexibility with scraped data
    bedrooms: number
    bathrooms: number
    built_up_size: number
    tenure: string // Changed to string for flexibility
    furnishing: string | null // Can be null now
    images: string[]
    status: 'active' | 'draft'
    agent_id: string
    created_at: string
    updated_at: string
    // New columns from Mudah.my scraping
    listing_id?: string
    original_url?: string
    city?: string
    state?: string
    land_size?: number
}

export interface Agent {
    id: string
    user_id: string
    name: string
    phone: string
    whatsapp: string
    profile_photo: string | null
    credits_balance: number
    created_at: string
    updated_at: string
}

export interface User {
    id: string
    email: string
    user_type: 'buyer' | 'agent'
    created_at: string
}

export interface Favorite {
    id: string
    user_id: string
    property_id: string
    created_at: string
}

