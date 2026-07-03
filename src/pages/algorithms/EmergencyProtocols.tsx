import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, Clock, Flame, HeartPulse, Activity } from 'lucide-react';

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

interface ProtocolStep {
  text: string;
  critical?: boolean;
}

interface EmergencyProtocol {
  id: string;
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  steps: ProtocolStep[];
}

const protocols: EmergencyProtocol[] = [
  {
    id: 'septic-shock',
    title: 'Септический шок — первый час ("Золотой час")',
    icon: <Flame className="w-5 h-5" />,
    accentColor: 'text-alert-red',
    steps: [
      { text: 'Антибиотики в течение 1 часа (пиперациллин/тазобактам или меропенем)', critical: true },
      { text: '30 мл/кг кристаллоидов в/в болюсом (3 л для 70 кг)', critical: true },
      { text: 'Норадреналин при MAP < 65 после жидкостей', critical: true },
      { text: 'Лактат контроль через 2–4 часа (цель: снижение > 20%)', critical: false },
      { text: 'Исходные кровевые культуры ДО антибиотиков', critical: true },
    ],
  },
  {
    id: 'dka',
    title: 'ДКА — алгоритм',
    icon: <Activity className="w-5 h-5" />,
    accentColor: 'text-alert-orange',
    steps: [
      { text: '0.9% NaCl 1 л в/в в первый час', critical: true },
      { text: 'Инсулин 0.1 Ед/кг/ч в/в (НЕ болюсом у взрослых)', critical: true },
      { text: 'KCl: добавлять при K⁺ < 5.3, цель 4–5', critical: false },
      { text: 'Бикарбонат: ТОЛЬКО при pH < 6.9', critical: true },
      { text: 'Переход на 5% глюкозу при глюкозе < 14', critical: false },
    ],
  },
  {
    id: 'addison',
    title: 'Аддисонов криз — алгоритм',
    icon: <AlertTriangle className="w-5 h-5" />,
    accentColor: 'text-alert-yellow',
    steps: [
      { text: 'Гидрокортизон 100 мг в/в болюс + 200 мг/сутки инфузия', critical: true },
      { text: '0.9% NaCl + 5% глюкоза (гипогликемия типична)', critical: true },
      { text: 'Кортизол + ACTH для подтверждения диагноза', critical: false },
      { text: 'Флуцинолон при бактериальной инфекции (Salmonella при СКА)', critical: false },
    ],
  },
  {
    id: 'mesenteric',
    title: 'Мезентериальная ишемия — алгоритм',
    icon: <HeartPulse className="w-5 h-5" />,
    accentColor: 'text-purple-accent',
    steps: [
      { text: 'КТ-ангиография с контрастом — золотой стандарт', critical: true },
      { text: 'D-лактат + I-FABP — маркёры (не специфичны)', critical: false },
      { text: 'Антикоагулянты: НФГ при эмболии, НПВС при артериальном тромбозе', critical: true },
      { text: 'Реваскуляризация в течение 6 часов — критический порог', critical: true },
    ],
  },
];

function ProtocolAccordion({ protocol, isOpen, onToggle, index }: {
  protocol: EmergencyProtocol;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: easeOutExpo }}
      className="rounded-xl border border-border-subtle bg-bg-secondary overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-bg-tertiary/50 transition-colors duration-150"
      >
        <div className={`${protocol.accentColor} flex-shrink-0`}>
          {protocol.icon}
        </div>
        <span className="flex-1 text-heading-md font-semibold text-text-primary font-heading">
          {protocol.title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: easeOutExpo }}
          className="flex-shrink-0 text-text-muted"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">
              <div className="space-y-2">
                {protocol.steps.map((step, si) => (
                  <motion.div
                    key={si}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: si * 0.05, duration: 0.3, ease: easeOutExpo }}
                    className={`flex items-start gap-3 rounded-lg p-3 ${
                      step.critical
                        ? 'border-l-2 border-alert-red bg-alert-red/5'
                        : 'border-l-2 border-transparent bg-bg-primary'
                    }`}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.critical
                        ? 'bg-alert-red/20 text-alert-red'
                        : 'bg-teal-400/15 text-teal-400'
                    }`}>
                      {si + 1}
                    </span>
                    <p className={`text-sm leading-relaxed ${
                      step.critical ? 'text-text-primary font-medium' : 'text-text-secondary'
                    }`}>
                      {step.text}
                    </p>
                    {step.critical && (
                      <AlertTriangle className="w-4 h-4 text-alert-red flex-shrink-0 mt-0.5" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function EmergencyProtocolsSection() {
  const [openId, setOpenId] = useState<string | null>('septic-shock');

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="w-full py-10 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-teal-400" />
            <h2 className="font-heading text-heading-lg font-semibold text-text-primary">
              Протоколы экстренного реагирования
            </h2>
          </div>
          <p className="text-body-md text-text-secondary max-w-[680px]">
            Разворачиваемые протоколы WSES — кликните для просмотра шагов.
          </p>
        </motion.div>

        {/* Accordion list */}
        <div className="space-y-3">
          {protocols.map((protocol, i) => (
            <ProtocolAccordion
              key={protocol.id}
              protocol={protocol}
              isOpen={openId === protocol.id}
              onToggle={() => toggle(protocol.id)}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
