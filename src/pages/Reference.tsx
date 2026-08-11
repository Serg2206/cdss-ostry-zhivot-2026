import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, AlertTriangle } from 'lucide-react';
import { Input } from '../components/ui/input';

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Reference database
const referenceData = [
  // QSOFA
  {
    id: 'qsofa-rr',
    category: 'Системы оценки',
    title: 'qSOFA: ЧД ≥22/мин',
    content: 'Частота дыхания 22 и более в минуту — первый критерий qSOFA. Входит в триаду для расчета риска сепсиса.',
    keywords: ['qsofa', 'частота дыхания', 'рк', 'сепсис', 'риск'],
  },
  {
    id: 'qsofa-sbp',
    category: 'Системы оценки',
    title: 'qSOFA: Систолическое АД ≤100 мм рт.ст.',
    content: 'Систолическое артериальное давление 100 и менее — второй критерий qSOFA. Указывает на гемодинамическую нестабильность.',
    keywords: ['qsofa', 'артериальное давление', 'гипотензия', 'сепсис'],
  },
  {
    id: 'qsofa-gcs',
    category: 'Системы оценки',
    title: 'qSOFA: Изменение сознания',
    content: 'Нарушение уровня сознания (дезориентация, заторможенность) — третий критерий qSOFA. Score ≥2 указывает на высокий риск сепсиса.',
    keywords: ['qsofa', 'сознание', 'дезориентация', 'гипоксия', 'сепсис'],
  },

  // Biomarkers
  {
    id: 'dlactate',
    category: 'Биомаркеры',
    title: 'D-лактат (D-Lactate)',
    content: 'Специфичный маркер ишемии кишечника. Норма: 0.5–2.0 mmol/L. Критическое значение: >3.0 mmol/L указывает на некроз энтероцитов.',
    keywords: ['d-лактат', 'ишемия', 'кишечник', 'биомаркер', 'критический', 'некроз'],
  },
  {
    id: 'ifabp',
    category: 'Биомаркеры',
    title: 'I-FABP (Intestinal Fatty Acid Binding Protein)',
    content: 'Цитоплазматический белок энтероцитов. Норма: <150 pg/mL. Критическое: >500 pg/mL говорит о повреждении слизистой кишечника.',
    keywords: ['i-fabp', 'энтероцит', 'повреждение слизистой', 'биомаркер'],
  },
  {
    id: 'pct',
    category: 'Биомаркеры',
    title: 'PCT (Procalcitonin) — Прокальцитонин',
    content: 'Маркер системного воспаления и сепсиса. Норма: <0.5 ng/mL. Легкая инфекция: 0.5–2.0. Тяжелая/сепсис: >2.0 ng/mL.',
    keywords: ['pct', 'прокальцитонин', 'сепсис', 'воспаление', 'инфекция'],
  },
  {
    id: 'crp',
    category: 'Биомаркеры',
    title: 'CRP (C-Reactive Protein) — С-реактивный белок',
    content: 'Неспецифичный маркер воспаления. Норма: <10 mg/L. Тяжелый острый живот: >200 mg/L.',
    keywords: ['crp', 'c-реактивный белок', 'воспаление', 'острый живот'],
  },
  {
    id: 'hladr',
    category: 'Биомаркеры',
    title: 'HLA-DR на моноцитах',
    content: 'Маркер иммунной дисфункции. Норма: >60%. Критическое: <30% указывает на иммуносупрессию и риск вторичных инфекций.',
    keywords: ['hla-dr', 'моноциты', 'иммунодефицит', 'сепсис', 'иммуносупрессия'],
  },

  // Algorithms
  {
    id: 'dka-peritonitis',
    category: 'Дифференциальная диагностика',
    title: 'ДКА vs Перитонит — ключевые отличия',
    content: 'Дилатирующий кишечный апоплекс: внезапное начало, сильная боль, быстрое падение АД. Перитонит: постепенное начало, разлитая боль, защита мышц живота.',
    keywords: ['дка', 'апоплекс', 'перитонит', 'дифференциация', 'диагностика'],
  },
  {
    id: 'acute-pancreatitis',
    category: 'Ургентные состояния',
    title: 'Острый панкреатит — диагностика',
    content: 'Липаза >3х верх. предела нормы или амилаза >3х ВПН. Боль в эпигастрии, иррадиирует в спину. Рвота. Шок в 15-20% случаев.',
    keywords: ['панкреатит', 'острый', 'липаза', 'амилаза', 'эпигастрия'],
  },
  {
    id: 'acute-cholecystitis',
    category: 'Ургентные состояния',
    title: 'Острый холецистит',
    content: 'Воспаление желчного пузыря. Симптомы Мерфи, Кера положительны. УЗ признаки: утолщение стенки >3мм, жидкость вокруг, конкременты.',
    keywords: ['холецистит', 'желчный пузырь', 'узи', 'конкременты', 'воспаление'],
  },
  {
    id: 'intestinal-obstruction',
    category: 'Ургентные состояния',
    title: 'Острая кишечная непроходимость',
    content: 'Триада: боль, рвота, отсутствие стула. Спастическая (тонкокишечная): коликообразная. Паралитическая: вздутие, отсутствие перистальтики.',
    keywords: ['непроходимость', 'кишечник', 'паралитическая', 'спастическая', 'боль'],
  },

  // Molecular/Cytokines
  {
    id: 'tiscpa-cascade',
    category: 'Молекулярные маркеры',
    title: 'TISCPA каскад — временная шкала цитокинов',
    content: 'Временное окно цитокинов после хирургического стресса. IL-6: 4–6ч, TNF-α: 2–4ч, IL-10: 6–8ч. Пики перекрываются, формируя иммунный ответ.',
    keywords: ['tiscpa', 'цитокины', 'il-6', 'tnf-alpha', 'il-10', 'временная шкала'],
  },
  {
    id: 'il6-peak',
    category: 'Молекулярные маркеры',
    title: 'IL-6 — пик в 4–6 часов',
    content: 'Основной провоспалительный цитокин. Пик: 4–6ч после травмы. Уровни >400 pg/mL ассоциированы с осложнениями и летальностью.',
    keywords: ['il-6', 'интерлейкин', 'цитокин', 'воспаление', 'травма'],
  },
  {
    id: 'tnf-alpha',
    category: 'Молекулярные маркеры',
    title: 'TNF-α — ранний маркер шока',
    content: 'Фактор некроза опухоли альфа. Пик: 2–4ч. Высокие уровни (>100 pg/mL) указывают на тяжелый сепсис и риск полиорганной недостаточности.',
    keywords: ['tnf-alpha', 'фактор некроза', 'шок', 'сепсис', 'цитокин'],
  },
  {
    id: 'il10-compensation',
    category: 'Молекулярные маркеры',
    title: 'IL-10 — компенсаторный цитокин',
    content: 'Противовоспалительный цитокин. Пик: 6–8ч. Высокие IL-10 при нормальных TNF указывают на компенсированное воспаление.',
    keywords: ['il-10', 'компенсация', 'противовоспалительный', 'цитокин'],
  },

  // Scoring Systems
  {
    id: 'sofa-score',
    category: 'Системы оценки',
    title: 'SOFA Score (Sequential Organ Failure Assessment)',
    content: 'Оценивает дисфункцию 6 систем органов. Score ≥2 в начале ассоциирован с летальностью 10%. ≥3: летальность 15–20%. Пересчитывают каждые 24ч.',
    keywords: ['sofa', 'органная недостаточность', 'score', 'летальность'],
  },
  {
    id: 'mannheim-peritonitis',
    category: 'Системы оценки',
    title: 'Mannheim Peritonitis Index (MPI)',
    content: 'Предоперационный индекс для прогноза при перитоните. Учитывает возраст, пол, длительность, происхождение загрязнения, диффузность.',
    keywords: ['mpi', 'mannheim', 'перитонит', 'индекс', 'прогноз'],
  },

  // Pre-operative
  {
    id: 'preop-checklist',
    category: 'Чек-листы',
    title: 'Pre-operative Checklist — базовый',
    content: '✓ NPO 6ч. ✓ IV access 2 линии. ✓ Catheter (мочевой). ✓ NG tube если есть показания. ✓ Профилактика ТГВ. ✓ Антибиотикопрофилактика.',
    keywords: ['preop', 'чек-лист', 'предоперационная подготовка', 'npo'],
  },
];

export default function Reference() {
  const [search, setSearch] = useState('');

  const results = useMemo(() => {
    if (!search.trim()) return [];

    const query = search.toLowerCase();
    return referenceData.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.keywords.some(kw => kw.includes(query))
    );
  }, [search]);

  const groupedResults = useMemo(() => {
    const grouped: Record<string, typeof referenceData> = {};
    results.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });
    return grouped;
  }, [results]);

  return (
    <div className="min-h-[100dvh] bg-bg-primary">
      {/* Header */}
      <section className="border-b border-border-subtle bg-bg-secondary">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          >
            <h1 className="font-heading text-display-lg font-semibold text-text-primary mb-3">
              Быстрый справочник
            </h1>
            <p className="text-body-lg text-text-secondary max-w-2xl">
              Полный текстовый справочник по всем разделам руководства 2026 года. Поиск по ключевым словам, определениям и протоколам.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <section className="border-b border-border-subtle bg-bg-primary sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: easeOutExpo }}
            className="relative"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none" />
            <Input
              type="text"
              placeholder="Искать: qSOFA, D-лактат, панкреатит, перитонит, IL-6..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 text-base"
            />
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        {search.trim() === '' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className="text-center py-12"
          >
            <Search className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-50" />
            <p className="text-body-lg text-text-muted">
              Введите поисковый запрос для поиска в справочнике
            </p>
          </motion.div>
        ) : results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className="text-center py-12"
          >
            <AlertTriangle className="h-12 w-12 text-alert-orange mx-auto mb-4 opacity-50" />
            <p className="text-body-lg text-text-secondary">
              По запросу «{search}» ничего не найдено
            </p>
            <p className="text-body-sm text-text-muted mt-2">
              Попробуйте другие ключевые слова
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedResults).map(([category, items], catIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: catIndex * 0.05, ease: easeOutExpo }}
              >
                <h2 className="text-body-lg font-semibold text-text-secondary mb-4 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-teal-400" />
                  {category}
                </h2>

                <div className="space-y-3">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: easeOutExpo }}
                      className="group rounded-lg border border-border-subtle bg-bg-secondary p-5 hover:border-teal-400/30 hover:bg-bg-elevated transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading text-body-md font-semibold text-text-primary mb-2 group-hover:text-teal-400 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-body-sm text-text-secondary leading-relaxed">
                            {item.content}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {item.keywords.slice(0, 4).map((kw) => (
                              <span
                                key={kw}
                                className="px-2 py-1 rounded text-[11px] font-medium bg-bg-tertiary text-text-muted"
                              >
                                #{kw}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-teal-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
