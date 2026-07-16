import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock } from 'lucide-react'
import AuthLayout from '../components/layout/AuthLayout.jsx'
import Input from '../components/common/Input.jsx'
import Button from '../components/common/Button.jsx'
import { resetPassword } from '../services/authService.js'
import { getErrorMessage } from '../utils/errorMessage.js'

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await resetPassword({ token, password })
      navigate('/login', { state: { passwordReset: true } })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.35)] ring-1 ring-slate-900/5 sm:p-10">
        <h2 className="text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-3xl">Reset Password</h2>
        <p className="mt-2.5 text-sm text-slate-500">Choose a new password for your account.</p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        {!token ? (
          <p className="mt-6 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            This reset link is missing or invalid. Please request a new one.
          </p>
        ) : (
          <form className="mt-9 flex flex-col gap-5" onSubmit={handleSubmit}>
            <Input
              id="password"
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              icon={<Lock size={16} />}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter your new password"
              icon={<Lock size={16} />}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full !bg-[length:200%_auto] !bg-left !py-3.5 !text-base !transition-all !duration-300 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-md shadow-indigo-200 hover:-translate-y-0.5 hover:!bg-right hover:shadow-lg hover:shadow-indigo-300/60 active:translate-y-0 active:scale-[0.98]"
            >
              {isSubmitting ? 'Resetting…' : 'Reset Password'}
            </Button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-slate-500">
          Remembered your password?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded border-0 bg-transparent p-0 font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            Sign in
          </button>
        </p>
      </div>
    </AuthLayout>
  )
}

export default ResetPassword
