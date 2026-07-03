import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Biomarkers from './pages/Biomarkers'
import Molecular from './pages/Molecular'
import Diagnostics from './pages/Diagnostics'
import Algorithms from './pages/Algorithms'
import Tests from './pages/Tests'

function StubPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-heading text-display-md font-semibold text-text-primary mb-4">
          {title}
        </h1>
        <p className="text-body-lg text-text-secondary max-w-md mx-auto">
          {description}
        </p>
        <div className="mt-8 h-1 w-24 bg-teal-400/30 rounded-full mx-auto" />
      </div>
    </div>
  );
}

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
        <Route
          path="/reference"
          element={
            <StubPage
              title="Быстрый справочник"
              description="Полный текстовый справочник по всем разделам руководства 2026 года с быстрым поиском."
            />
          }
        />
      </Routes>
    </Layout>
  )
}
