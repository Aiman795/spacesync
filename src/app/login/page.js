'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Check your email for the login link!')
    }
    setLoading(false)
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden font-sans selection:bg-white selection:text-black px-6">
      {/* Subtle Tech Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />

      {/* Back to Home Link */}
      <div className="absolute top-8 left-8 z-10">
        <Link 
          href="/" 
          className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl shadow-2xl">
        
        {/* Header Branding */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-300 text-xs font-medium tracking-wide uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            Authentication
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Sign In to SpaceSync
          </h1>
          <p className="text-sm text-zinc-400 mt-2 font-light">
            Enter your email to receive a secure magic link for access.
          </p>
        </div>

        {/* Functional Form (Logic Unchanged) */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2 text-left">
            <label className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/40 transition-colors duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black hover:bg-zinc-200 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
          </button>

          {message && (
            <div className={`p-4 rounded-xl text-xs font-medium border ${
              message.startsWith('Error') 
                ? 'border-red-500/20 bg-red-500/10 text-red-400' 
                : 'border-white/10 bg-white/5 text-zinc-300'
            }`}>
              {message}
            </div>
          )}
        </form>

        {/* Footer info inside card */}
        <p className="mt-8 text-center text-xs text-zinc-500">
          Protected by secure Supabase enterprise authentication.
        </p>
      </div>
    </div>
  )
}