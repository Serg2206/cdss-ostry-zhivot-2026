import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ClipboardCheck } from 'lucide-react';

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

interface ChecklistItem {
  id: number;
  text: string;
}

// ------------------------------------------------------------------
// Laparotomy checklist data
// ------------------------------------------------------------------
const laparotomyItems: ChecklistItem[] = [
  { id: 1, text: 'Информированное согласие получено / экстренный протокол активирован' },
  { id: 2, text: 'qSOFA рассчитан и записан' },
  { id: 3, text: 'Группа крови + скрининг перекрёстной совместимости' },
  { id: 4, text: 'ЭКГ (последние 24 часа)' },
  { id: 5, text: 'Рентген / КТ живота — интерпретация записана' },
  { id: 6, text: 'Коагулограмма: INR, АЧТВ, Фибриноген' },
  { id: 7, text: 'Антибиотикопрофилактика назначена (препарат, время)' },
  { id: 8, text: 'Тромбопрофилактика' },
  { id: 9, text: 'Доступ к сосудистому катетеру (2 канюли 16G+)' },
  { id: 10, text: 'Мочевой катетер установлен' },
  { id: 11, text: 'Анестезиолог уведомлён и готов' },
  { id: 12, text: 'Операционная готова, бригада в сборе' },
];

// ------------------------------------------------------------------
// Thoracotomy checklist data
// ------------------------------------------------------------------
const thoracotomyItems: ChecklistItem[] = [
  { id: 1, text: 'Экстренный протокол активирован' },
  { id: 2, text: 'Тип торакотомии определён: левосторонняя / правосторонняя / трансмедиастинальная' },
  { id: 3, text: 'Инструменты торакотомии готовы (набор + торакостомия)' },
  { id: 4, text: 'ЭКГ мониторинг, пульсоксиметрия' },
  { id: 5, text: 'Доступ к 4+ ед. эритроцитарной массы' },
  { id: 6, text: 'Анестезиолог в операционной' },
  { id: 7, text: 'Кардиохирург уведомлён (при подозрении на сердечное повреждение)' },
  { id: 8, text: 'КЛКС (клеточный состав крови) контрольный' },
];

// ------------------------------------------------------------------
// Single checklist component
// ------------------------------------------------------------------
function ChecklistCard({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: ChecklistItem[];
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = useCallback((id: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const total = items.length;
  const completed = checked.size;
  const progress = (completed / total) * 100;
  const allDone = completed === total && total > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
      className="rounded-xl border border-border-subtle bg-bg-secondary p-6 shadow-card flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="p-2 rounded-lg bg-bg-tertiary text-teal-400 flex-shrink-0">
          <ClipboardCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-heading-lg font-semibold text-text-primary font-heading">
            {title}
          </h3>
          <p className="text-body-sm text-text-secondary mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-text-muted uppercase tracking-wider">
            Прогресс
          </span>
          <span className="text-xs font-medium text-text-secondary">
            {completed} / {total}
          </span>
        </div>
        <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-teal-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1 flex-1">
        {items.map((item, i) => {
          const isChecked = checked.has(item.id);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35, ease: easeOutExpo }}
              onClick={() => toggle(item.id)}
              className={`flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 group ${
                isChecked
                  ? 'bg-success-green/5 opacity-60'
                  : 'hover:bg-bg-tertiary'
              }`}
            >
              {/* Custom checkbox */}
              <div
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  isChecked
                    ? 'bg-teal-400 border-teal-400'
                    : 'border-border-subtle group-hover:border-teal-400/50'
                }`}
              >
                {isChecked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, ease: easeOutExpo }}
                  >
                    <Check className="w-3 h-3 text-bg-primary" strokeWidth={3} />
                  </motion.div>
                )}
              </div>

              {/* Text */}
              <span
                className={`text-body-md transition-all duration-150 ${
                  isChecked
                    ? 'text-text-muted line-through'
                    : 'text-text-secondary group-hover:text-text-primary'
                }`}
              >
                {item.text}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Completion banner */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
            className="mt-4 overflow-hidden"
          >
            <div className="rounded-lg border border-success-green/30 bg-success-green/10 px-4 py-3 flex items-center gap-3">
              <Check className="w-5 h-5 text-success-green flex-shrink-0" />
              <p className="text-sm font-medium text-success-green">
                Чек-лист завершён. Пациент готов к операции.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ------------------------------------------------------------------
// Main section
// ------------------------------------------------------------------
export default function ChecklistsSection() {
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
          <span className="text-xs font-medium text-teal-400 uppercase tracking-[0.06em] label">
            ЧЕК-ЛИСТЫ
          </span>
          <h2 className="font-heading text-display-md font-semibold text-text-primary mt-2">
            Pre-operative чек-листы
          </h2>
          <p className="text-body-md text-text-secondary mt-2 max-w-[680px]">
            Структурированные чек-листы для подготовки к экстренным операциям.
            Отметьте выполненные пункты.
          </p>
        </motion.div>

        {/* Two checklists side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChecklistCard
            title="Чек-лист перед лапаротомией (ПОН)"
            subtitle="12 обязательных пунктов"
            items={laparotomyItems}
          />
          <ChecklistCard
            title="Чек-лист экстренной торакотомии"
            subtitle="8 обязательных пунктов"
            items={thoracotomyItems}
          />
        </div>
      </div>
    </section>
  );
}
