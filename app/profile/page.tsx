'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
    const { user, profile, loading } = useAuth()
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
    })
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                phone: profile.phone || '',
            })
        }
    }, [profile])

    const handleSave = async () => {
        if (!user) return
        setSaving(true)
        setMessage('')

        try {
            if (profile?.user_type === 'agent') {
                const { error } = await supabase
                    .from('agents')
                    .update({
                        name: formData.name,
                        phone: formData.phone,
                        whatsapp: formData.phone,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('user_id', user.id)

                if (error) throw error
            }

            setMessage('Profile updated successfully!')
            setIsEditing(false)
        } catch (error) {
            console.error('Error updating profile:', error)
            setMessage('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

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
                <div className="max-w-2xl mx-auto">
                    <h1 className="font-heading font-bold text-3xl text-gray-900 mb-8">My Profile</h1>

                    <div className="glass p-8 rounded-2xl">
                        {/* Profile Header */}
                        <div className="flex items-center mb-8 pb-8 border-b border-gray-200">
                            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-3xl">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {profile?.name || user.email?.split('@')[0]}
                                </h2>
                                <p className="text-gray-600">{user.email}</p>
                                <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-600 text-sm font-medium rounded-full capitalize">
                                    {profile?.user_type || 'Buyer'}
                                </span>
                            </div>
                        </div>

                        {/* Success/Error Message */}
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg text-sm ${message.includes('success')
                                    ? 'bg-green-50 text-green-600 border border-green-200'
                                    : 'bg-red-50 text-red-600 border border-red-200'
                                }`}>
                                {message}
                            </div>
                        )}

                        {/* Profile Info */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={user.email || ''}
                                    disabled
                                    className="input-field bg-gray-100 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                                <input
                                    type="text"
                                    value={profile?.user_type || 'Buyer'}
                                    disabled
                                    className="input-field bg-gray-100 cursor-not-allowed capitalize"
                                />
                            </div>

                            {profile?.user_type === 'agent' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            disabled={!isEditing}
                                            className={`input-field ${!isEditing ? 'bg-gray-100' : ''}`}
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone / WhatsApp</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            disabled={!isEditing}
                                            className={`input-field ${!isEditing ? 'bg-gray-100' : ''}`}
                                            placeholder="+60 12-345 6789"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {profile?.user_type === 'agent' && (
                            <div className="mt-8 flex gap-4">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="btn-primary flex items-center"
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn-secondary"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Account Info */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
                            <div className="text-sm text-gray-600 space-y-2">
                                <p>
                                    <span className="font-medium">Account created:</span>{' '}
                                    {new Date(user.created_at || '').toLocaleDateString('en-MY', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <p>
                                    <span className="font-medium">Last sign in:</span>{' '}
                                    {new Date(user.last_sign_in_at || '').toLocaleDateString('en-MY', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
