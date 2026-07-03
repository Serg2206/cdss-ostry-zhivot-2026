import { motion } from 'framer-motion'
import {
  Dna,
  FlaskConical,
  Search,
  GitBranch,
  BotMessageSquare,
  Smartphone,
} from 'lucide-react'

const features = [
  {
    icon: Dna,
    title: 'Модуль А: Молекулярный патогенез',
    description: 'Визуализация каскада TISCPA — от травмы к системному воспалению. Интерактивная схема с 50+ связанными фактами.',
    color: 'from-teal-500/20 to-teal-600/5',
    borderColor: 'border-teal-500/20',
  },
  {
    icon: FlaskConical,
    title: 'Модуль Б: Биомаркерная навигация',
    description: 'Калькулятор с 23 маркерами: IL-6, CRP, PCT, LDH, D-dimer, лактат и другие. Динамическая интерпретация с пороговыми значениями.',
    color: 'from-blue-500/20 to-blue-600/5',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: Search,
    title: 'Модуль В: Маски острого живота',
    description: '7 дифференциальных мимик: пневмония, инфаркт, ДВС-синдром, обструкция, тазовая патология и другие.',
    color: 'from-purple-500/20 to-purple-600/5',
    borderColor: 'border-purple-500/20',
  },
  {
    icon: GitBranch,
    title: 'Алгоритмы принятия решений',
    description: 'Интерактивные деревья решений + калькуляторы MPI, qSOFA, APACHE II. Визуальный пошаговый протокол.',
    color: 'from-amber-500/20 to-amber-600/5',
    borderColor: 'border-amber-500/20',
  },
  {
    icon: BotMessageSquare,
    title: 'AI-ассистент',
    description: '50+ клинических фактов, интерпретация биомаркеров, скрининговые протоколы. Ответ за 10 секунд.',
    color: 'from-rose-500/20 to-rose-600/5',
    borderColor: 'border-rose-500/20',
  },
  {
    icon: Smartphone,
    title: 'PWA: работает везде',
    description: 'Установка на телефон за 1 минуту. Полный функционал офлайн. Push-уведомления о критических значениях.',
    color: 'from-emerald-500/20 to-emerald-600/5',
    borderColor: 'border-emerald-500/20',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const card = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

export default function Features() {
  return (
    <section id="features" className="relative py-20 lg:py-28 bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-medium text-teal-400 mb-4">
            Функционал
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Всё, что нужно для{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300">
              экстренной хирургии
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Шесть модулей, покрывающих полный цикл клинического мышления — от молекулярных механизмов до операционного решения
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={card}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`group relative rounded-xl border ${feature.borderColor} bg-gradient-to-br ${feature.color} p-6 hover:shadow-lg transition-shadow`}
            >
              <div className="w-11 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2 leading-snug">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
