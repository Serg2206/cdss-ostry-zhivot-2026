import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Database, FlaskConical, Stethoscope, GitBranch, WifiOff } from 'lucide-react'

const stats = [
  { icon: Database, label: '50+ фактов' },
  { icon: FlaskConical, label: '6 модулей' },
  { icon: Stethoscope, label: '23 биомаркера' },
  { icon: GitBranch, label: '4 алгоритма' },
  { icon: WifiOff, label: 'Офлайн PWA' },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
}

const qsofaItems = [
  { id: 'rr', label: 'ЧД \u226522/мин', short: 'ЧД' },
  { id: 'sbp', label: 'АД \u2264100 мм рт.ст.', short: 'АД' },
  { id: 'gcs', label: 'Изменение сознания', short: 'ГКШ' },
]

function QsofaWidget() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const score = Object.values(checked).filter(Boolean).length
  const toggle = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  const color = score === 0 ? 'text-slate-400' : score === 1 ? 'text-yellow-400' : 'text-rose-400'
  const label = score === 0 ? 'Низкий риск' : score === 1 ? 'Наблюдение' : 'Сепсис?'
  return (
    <div className="rounded-lg bg-[#0D1117] border border-white/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-slate-400 font-medium">qSOFA</span>
        <span className={`text-[10px] font-bold ${color}`}>{score}/3 \u2014 {label}</span>
      </div>
      <div className="space-y-1.5">
        {qsofaItems.map(({ id, label }) => (
          <label key={id} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={!!checked[id]}
              onChange={() => toggle(id)}
              className="w-3 h-3 accent-teal-400 cursor-pointer"
            />
            <span className="text-[9px] text-slate-400 group-hover:text-slate-200 transition-colors leading-tight">{label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden bg-[#0D1117]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item} className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-medium text-teal-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Клиническая система поддержки решений
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6"
            >
              CDSS для острого живота:{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300">
                от молекулы до операции
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl"
            >
              Интерактивный справочник с AI-ассистентом. Снижение напрасных лапаротомий на 30%.
              Доступен на любом устройстве, даже офлайн.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-4 mb-12">
              <a
                href="#cta"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-teal-500 text-slate-900 hover:bg-teal-400 transition-colors shadow-glow"
              >
                Начать бесплатно
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#howitworks"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
              >
                <Play className="w-4 h-4" />
                Посмотреть демо
              </a>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              variants={item}
              className="flex flex-wrap gap-x-6 gap-y-3"
            >
              {stats.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-slate-400">
                  <Icon className="w-4 h-4 text-teal-400" />
                  {label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.3 }}
            className="relative"
          >
            <div className="relative rounded-xl border border-white/10 bg-[#151B24] shadow-2xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0D1117]">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
                <span className="ml-3 text-xs text-slate-500">CDSS Острый Живот 2026</span>
              </div>

              {/* Dashboard content */}
              <div className="p-5 grid grid-cols-2 gap-3">
                {/* Module cards */}
                <div className="col-span-2 grid grid-cols-3 gap-3">
                  {['Модуль А', 'Модуль Б', 'Модуль В'].map((m, i) => (
                    <div key={m} className="rounded-lg bg-[#0D1117] border border-white/5 p-3">
                      <div className="w-6 h-6 rounded bg-teal-500/20 mb-2" />
                      <div className="text-[10px] text-slate-400">{m}</div>
                      <div className="text-[10px] text-slate-600 mt-1">
                        {['TISCPA', 'Биомаркеры', 'Маски ОЖ'][i]}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Biomarker chart area */}
                <div className="col-span-2 rounded-lg bg-[#0D1117] border border-white/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400">Биомаркерная навигация</span>
                    <span className="text-[10px] text-teal-400">IL-6 &gt; CRP &gt; PCT</span>
                  </div>
                  <div className="flex items-end gap-2 h-20">
                    {[65, 40, 80, 55, 90, 45, 70].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-teal-500/30 hover:bg-teal-500/50 transition-colors"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {['IL-6', 'CRP', 'PCT', 'LDH', 'D-dimer', 'WBC', 'lactate'].map((l) => (
                      <span key={l} className="text-[9px] text-slate-600">{l}</span>
                    ))}
                  </div>
                </div>

                {/* AI assistant */}
                <div className="rounded-lg bg-teal-500/5 border border-teal-500/10 p-3">
                  <div className="text-[10px] text-teal-400 font-medium mb-1">AI-ассистент</div>
                  <div className="text-[9px] text-slate-500">Здравствуйте! Чем могу помочь?</div>
                </div>

                {/* qSOFA Widget */}
                <QsofaWidget />

                {/* Status */}
                <div className="col-span-2 rounded-lg bg-[#0D1117] border border-white/5 p-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Статус: Онлайн</span>
                  <span className="text-[10px] text-teal-400">PWA активна</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
