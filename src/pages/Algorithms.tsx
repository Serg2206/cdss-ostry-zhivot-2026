import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import { GitBranch, ClipboardCheck, Calculator, Zap } from 'lucide-react';
import DecisionTreesSection from './algorithms/DecisionTrees';
import ChecklistsSection from './algorithms/Checklists';
import ScoringSystemsSection from './algorithms/ScoringSystems';
import EmergencyProtocolsSection from './algorithms/EmergencyProtocols';

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

// ------------------------------------------------------------------
// Tabs
// ------------------------------------------------------------------
const tabs = [
  {
    id: 'trees',
    label: 'Decision Trees',
    shortLabel: 'Алгоритмы',
    icon: <GitBranch className="w-4 h-4" />,
  },
  {
    id: 'checklists',
    label: 'Чек-листы',
    shortLabel: 'Чек-листы',
    icon: <ClipboardCheck className="w-4 h-4" />,
  },
  {
    id: 'scoring',
    label: 'Системы оценки',
    shortLabel: 'Оценка',
    icon: <Calculator className="w-4 h-4" />,
  },
  {
    id: 'protocols',
    label: 'Быстрый доступ',
    shortLabel: 'Протоколы',
    icon: <Zap className="w-4 h-4" />,
  },
];

// ------------------------------------------------------------------
// Main page
// ------------------------------------------------------------------
export default function Algorithms() {
  const [activeTab, setActiveTab] = useState('trees');

  return (
    <div className="min-h-[100dvh] bg-bg-primary">
      {/* ====== Section 1: Page Header ====== */}
      <section className="pt-24 pb-8 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
            className="mb-4"
          >
            <ol className="flex items-center gap-2 text-body-sm text-text-muted">
              <li>
                <Link to="/" className="hover:text-text-secondary transition-colors duration-150">
                  Главная
                </Link>
              </li>
              <span>/</span>
              <li>
                <span className="text-text-secondary">Модули</span>
              </li>
              <span>/</span>
              <li className="text-teal-400">Алгоритмы и чек-листы</li>
            </ol>
          </motion.nav>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="font-heading text-display-lg font-semibold text-text-primary"
          >
            Алгоритмы и чек-листы
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
            className="text-body-lg text-text-secondary max-w-[680px] mt-3"
          >
            Интерактивные decision trees, pre-operative чек-листы и клинические
            системы оценки для принятия решений в экстренной хирургии.
          </motion.p>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeOutExpo }}
            className="mt-8 flex gap-1 p-1 rounded-xl bg-bg-secondary border border-border-subtle overflow-x-auto"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'text-text-primary'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="algorithms-tab-indicator"
                      className="absolute inset-0 rounded-lg bg-bg-tertiary border border-teal-400/30 shadow-glow-teal"
                      transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </span>
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ====== Tab Content ====== */}
      <AnimatePresence mode="wait">
        {activeTab === 'trees' && (
          <motion.div
            key="trees"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
          >
            <DecisionTreesSection />
          </motion.div>
        )}
        {activeTab === 'checklists' && (
          <motion.div
            key="checklists"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
          >
            <ChecklistsSection />
          </motion.div>
        )}
        {activeTab === 'scoring' && (
          <motion.div
            key="scoring"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
          >
            <ScoringSystemsSection />
          </motion.div>
        )}
        {activeTab === 'protocols' && (
          <motion.div
            key="protocols"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
          >
            <EmergencyProtocolsSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
