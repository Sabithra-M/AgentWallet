import { Component } from 'react'
import { AlertOctagon } from 'lucide-react'
import Button from './Button.jsx'

class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <div className="rounded-full bg-red-100 p-4 text-red-500">
          <AlertOctagon size={32} aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-800">Something went wrong</p>
          <p className="text-sm text-slate-500">
            This page ran into an unexpected error. Reloading usually fixes it.
          </p>
        </div>
        <Button onClick={this.handleReload}>Reload page</Button>
      </div>
    )
  }
}

export default ErrorBoundary
