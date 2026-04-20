import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ConsumerList from './pages/ConsumerList'
import Consumer360 from './pages/Consumer360'
import ActionQueue from './pages/ActionQueue'
import DTView from './pages/DTView'
import KPITracker from './pages/KPITracker'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/consumers" element={<ConsumerList />} />
        <Route path="/consumers/:id" element={<Consumer360 />} />
        <Route path="/actions" element={<ActionQueue />} />
        <Route path="/dt" element={<DTView />} />
        <Route path="/kpis" element={<KPITracker />} />
      </Routes>
    </Layout>
  )
}
