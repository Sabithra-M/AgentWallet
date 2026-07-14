import { useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import AuthLayout from '../components/layout/AuthLayout.jsx'
import Input from '../components/common/Input.jsx'
import Button from '../components/common/Button.jsx'
import GoogleIcon from '../components/common/GoogleIcon.jsx'

function Login() {
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.35)] ring-1 ring-slate-900/5 sm:p-10">
        <h2 className="text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-3xl">Welcome Back!</h2>
        <p className="mt-2.5 text-sm text-slate-500">Sign in to continue</p>

        <form className="mt-9 flex flex-col gap-5">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            icon={<Mail size={16} />}
          />
          <div>
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock size={16} />}
            />
            <div className="mt-2 text-right">
              <button
                type="button"
                className="rounded border-0 bg-transparent p-0 text-sm font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                Forgot password?
              </button>
            </div>
          </div>
          <Button
            type="button"
            className="w-full !bg-[length:200%_auto] !bg-left !py-3.5 !text-base !transition-all !duration-300 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-md shadow-indigo-200 hover:-translate-y-0.5 hover:!bg-right hover:shadow-lg hover:shadow-indigo-300/60 active:translate-y-0 active:scale-[0.98]"
            onClick={() => navigate('/dashboard')}
          >
            Sign In
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
          className="w-full !py-3.5 !text-base !transition-all !duration-200 border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
          icon={<GoogleIcon size={18} />}
          onClick={() => navigate('/dashboard')}
        >
          Sign in with Google
        </Button>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <button
            type="button"
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
