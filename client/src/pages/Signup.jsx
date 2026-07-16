import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock } from 'lucide-react'
import AuthLayout from '../components/layout/AuthLayout.jsx'
import Input from '../components/common/Input.jsx'
import Button from '../components/common/Button.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getErrorMessage } from '../utils/errorMessage.js'

function Signup() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await register({ name, email, password })
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.35)] ring-1 ring-slate-900/5 sm:p-10">
        <h2 className="text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-3xl">Create Account</h2>
        <p className="mt-2.5 text-sm text-slate-500">Sign up to start using AgentWallet</p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <form className="mt-9 flex flex-col gap-5" onSubmit={handleSubmit}>
          <Input
            id="name"
            label="Full Name"
            type="text"
            placeholder="Enter your name"
            icon={<User size={16} />}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
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
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            icon={<Lock size={16} />}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full !bg-[length:200%_auto] !bg-left !py-3.5 !text-base !transition-all !duration-300 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-md shadow-indigo-200 hover:-translate-y-0.5 hover:!bg-right hover:shadow-lg hover:shadow-indigo-300/60 active:translate-y-0 active:scale-[0.98]"
          >
            {isSubmitting ? 'Creating Account…' : 'Sign Up'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
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

export default Signup
