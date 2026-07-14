import { Wallet, Sparkles, ShoppingBag, Plane } from 'lucide-react'

function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="relative hidden w-1/2 flex-col items-center justify-center gap-6 overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-10 lg:flex">
        <div className="animate-grid-pan absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:28px_28px]" />

        <div className="animate-blob-1 absolute -left-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="animate-blob-2 absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-purple-400/30 blur-3xl" />
        <div className="absolute right-10 top-1/3 h-40 w-40 rounded-full bg-indigo-300/20 blur-2xl" />

        <div className="animate-float-1 absolute left-14 top-24 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-sm">
          <Plane size={20} />
        </div>
        <div className="animate-float-2 absolute right-16 top-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-sm">
          <ShoppingBag size={20} />
        </div>
        <div className="animate-float-3 absolute bottom-28 left-20 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-sm">
          <Sparkles size={20} />
        </div>

        <span className="animate-pulse absolute left-1/3 top-1/4 h-1.5 w-1.5 rounded-full bg-white/50" />
        <span
          className="animate-pulse absolute bottom-1/3 right-1/4 h-1 w-1 rounded-full bg-white/40"
          style={{ animationDelay: '1s' }}
        />

        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-white/20 blur-xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-white/25 to-white/5 text-white shadow-xl ring-1 ring-white/20 backdrop-blur-sm">
              <Wallet size={44} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              AgentWallet
            </h1>
            <p className="max-w-xs text-center text-sm leading-relaxed text-white/80">
              AI Payment Authorization made simple and secure.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur-sm">
            <Sparkles size={12} />
            Powered by AI
          </span>
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center p-6 sm:p-10 lg:w-1/2 lg:p-12">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
