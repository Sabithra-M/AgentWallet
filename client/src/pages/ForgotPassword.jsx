import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import AuthLayout from '../components/layout/AuthLayout.jsx'
import Input from '../components/common/Input.jsx'
import Button from '../components/common/Button.jsx'
import { forgotPassword } from '../services/authService.js'
import { getErrorMessage } from '../utils/errorMessage.js'

function ForgotPassword() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)
    try {
      const result = await forgotPassword({ email })
      setMessage(result.message)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.35)] ring-1 ring-slate-900/5 sm:p-10">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mb-6 inline-flex items-center gap-1.5 rounded border-0 bg-transparent p-0 text-sm font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </button>

        <h2 className="text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-3xl">Forgot Password?</h2>
        <p className="mt-2.5 text-sm text-slate-500">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {message && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{message}</p>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        {!message && (
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full !bg-[length:200%_auto] !bg-left !py-3.5 !text-base !transition-all !duration-300 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-md shadow-indigo-200 hover:-translate-y-0.5 hover:!bg-right hover:shadow-lg hover:shadow-indigo-300/60 active:translate-y-0 active:scale-[0.98]"
            >
              {isSubmitting ? 'Sending…' : 'Send Reset Link'}
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  )
}

export default ForgotPassword
