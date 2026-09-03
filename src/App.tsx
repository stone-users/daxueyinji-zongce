import { Routes, Route } from 'react-router'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Wizard from '@/pages/Wizard'
import Export from '@/pages/Export'
import Help from '@/pages/Help'
import useLenis from '@/hooks/useLenis'

export default function App() {
  useLenis()

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="wizard" element={<Wizard />} />
        <Route path="export" element={<Export />} />
        <Route path="help" element={<Help />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
