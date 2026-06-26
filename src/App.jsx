import SceneWrapper from './SceneWrapper'
import AdminApp from './admin/AdminApp'

export default function App() {
  if (window.location.pathname === '/admin') return <AdminApp />
  return <SceneWrapper />
}
