import AppRoutes from './routes/AppRoutes.jsx'
import { AppProvider } from './context/AppContext.jsx'

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}

export default App
