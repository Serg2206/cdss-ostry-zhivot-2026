import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Biomarkers from './pages/Biomarkers'
import Molecular from './pages/Molecular'
import Diagnostics from './pages/Diagnostics'
import Algorithms from './pages/Algorithms'
import Tests from './pages/Tests'
import Reference from './pages/Reference'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/molecular" element={<Molecular />} />
        <Route path="/biomarkers" element={<Biomarkers />} />
        <Route path="/diagnostics" element={<Diagnostics />} />
        <Route path="/algorithms" element={<Algorithms />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/reference" element={<Reference />} />
      </Routes>
    </Layout>
  )
}
