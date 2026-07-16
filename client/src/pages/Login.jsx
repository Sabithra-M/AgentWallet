import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import AuthLayout from '../components/layout/AuthLayout.jsx'
import Input from '../components/common/Input.jsx'
import Button from '../components/common/Button.jsx'
import GoogleIcon from '../components/common/GoogleIcon.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getErrorMessage } from '../utils/errorMessage.js'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginWithGoogle } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    setError('')
    setIsGoogleSubmitting(true)
    try {
      const result = await loginWithGoogle()
      // A null result means Safari's redirect flow has taken over and the
      // browser is already navigating away — nothing more to do here.
      if (result) {
        navigate('/dashboard')
      }
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        // User closed the popup — not a real error, nothing to show.
      } else {
        setError(getErrorMessage(err))
      }
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.35)] ring-1 ring-slate-900/5 sm:p-10">
        <h2 className="text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-3xl">Welcome Back!</h2>
        <p className="mt-2.5 text-sm text-slate-500">Sign in to continue</p>

        {location.state?.registered && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            Account created successfully. Please sign in.
          </p>
        )}

        {location.state?.passwordReset && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            Password reset successfully. Please sign in with your new password.
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <form className="mt-9 flex flex-col gap-5" onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            icon={<Mail size={16} />}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <div>
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock size={16} />}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="rounded border-0 bg-transparent p-0 text-sm font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                Forgot password?
              </button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full !bg-[length:200%_auto] !bg-left !py-3.5 !text-base !transition-all !duration-300 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-md shadow-indigo-200 hover:-translate-y-0.5 hover:!bg-right hover:shadow-lg hover:shadow-indigo-300/60 active:translate-y-0 active:scale-[0.98]"
          >
            {isSubmitting ? 'Signing In…' : 'Sign In'}
          </Button>
        </form>

        <div className="my-8 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            or continue with
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isGoogleSubmitting}
          onClick={handleGoogleSignIn}
          className="w-full !py-3.5 !text-base"
          icon={<GoogleIcon size={18} />}
        >
          {isGoogleSubmitting ? 'Signing In…' : 'Sign in with Google'}
        </Button>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="rounded border-0 bg-transparent p-0 font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            Sign up
          </button>
        </p>
      </div>
    </AuthLayout>
  )
}

export default Login
