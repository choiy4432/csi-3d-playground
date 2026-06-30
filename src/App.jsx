import { useState, useEffect } from 'react'
import SceneWrapper from './SceneWrapper'
import AdminApp from './admin/AdminApp'
import TestRoomScene from './scene/TestRoomScene'

function getRoute() {
  return window.location.hash.replace('#', '') || '/'
}

export default function App() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const handler = () => setRoute(getRoute())
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  if (route === '/admin')    return <AdminApp />
  if (route === '/testroom') return <TestRoomScene />
  return <SceneWrapper />
}
