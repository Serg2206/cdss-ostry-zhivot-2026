import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

// ===================================================================
// MPI — Mannheim Peritonitis Index
// ===================================================================

interface MPICriterion {
  label: string;
  options: { label: string; points: number }[];
}

const mpiCriteria: MPICriterion[] = [
  {
    label: 'Возраст > 50 лет',
    options: [
      { label: 'Нет (≤ 50)', points: 0 },
      { label: 'Да (> 50)', points: 4 },
    ],
  },
  {
    label: 'Пол (мужской)',
    options: [
      { label: 'Женский', points: 0 },
      { label: 'Мужской', points: 2 },
    ],
  },
  {
    label: 'Инфекция органов брюшной полости',
    options: [
      { label: 'Нет инфекции', points: 0 },
      { label: 'Лёгкая', points: 4 },
      { label: 'Умеренная', points: 8 },
      { label: 'Тяжёлая', points: 12 },
    ],
  },
  {
    label: 'Тяжесть перитонита',
    options: [
      { label: 'Нет перитонита', points: 0 },
      { label: 'Лёгкий', points: 3 },
      { label: 'Умеренный', points: 6 },
      { label: 'Тяжёлый', points: 9 },
    ],
  },
  {
    label: 'Длительность перитонита',
    options: [
      { label: '≤ 24 часов', points: 0 },
      { label: '24–48 часов', points: 4 },
      { label: '> 48 часов', points: 8 },
    ],
  },
  {
    label: 'Тип экссудата',
    options: [
      { label: 'Очищенный', points: 0 },
      { label: 'Гнойный', points: 6 },
      { label: 'Фекальный', points: 12 },
    ],
  },
  {
    label: 'Сепсис (modified qSOFA)',
    options: [
      { label: 'Нет сепсиса', points: 0 },
      { label: 'Сепсис (1–2 критерия)', points: 6 },
      { label: 'Тяжёлый сепсис (3 критерия)', points: 9 },
    ],
  },
  {
    label: 'Общий статус (ASA)',
    options: [
      { label: 'ASA I–II', points: 0 },
      { label: 'ASA III', points: 3 },
      { label: 'ASA IV', points: 5 },
      { label: 'ASA V', points: 7 },
    ],
  },
];

function MPICalculator() {
  const [selections, setSelections] = useState<number[]>(
    new Array(mpiCriteria.length).fill(0)
  );

  const handleSelect = useCallback((criterionIndex: number, optionIndex: number) => {
    setSelections((prev) => {
      const next = [...prev];
      next[criterionIndex] = optionIndex;
      return next;
    });
  }, []);

  const total = useMemo(() => {
    return selections.reduce((sum, optIdx, critIdx) => {
      return sum + mpiCriteria[critIdx].options[optIdx].points;
    }, 0);
  }, [selections]);

  const riskCategory = useMemo(() => {
    if (total <= 21) return { label: 'Низкий риск', color: 'text-success-green', bg: 'bg-success-green/10', border: 'border-success-green/30', detail: 'MPI ≤ 21: летальность < 10%' };
    if (total <= 29) return { label: 'Средний риск', color: 'text-alert-orange', bg: 'bg-alert-orange/10', border: 'border-alert-orange/30', detail: 'MPI 21–29: летальность 10–30%' };
    return { label: 'Высокий риск', color: 'text-alert-red', bg: 'bg-alert-red/10', border: 'border-alert-red/30', detail: 'MPI > 29: летальность > 50% — максимальная интенсивность терапии' };
  }, [total]);

  return (
    <div className="rounded-xl border border-teal-400/20 bg-bg-secondary p-6 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-5 bg-teal-400 rounded-full" />
        <h3 className="text-heading-lg font-semibold text-text-primary font-heading">
          MPI — Индекс перитонита Мангейма
        </h3>
      </div>
      <p className="text-body-sm text-text-muted mb-5 ml-3">AUC 0.90 | Порог &gt; 21 = высокий риск</p>

      <div className="space-y-4 mb-6">
        {mpiCriteria.map((criterion, ci) => (
          <div key={ci} className="bg-bg-primary rounded-lg p-3 border border-border-subtle">
            <p className="text-sm font-medium text-text-primary mb-2">{criterion.label}</p>
            <div className="flex flex-wrap gap-2">
              {criterion.options.map((opt, oi) => {
                const isSelected = selections[ci] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => handleSelect(ci, oi)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-150 ${
                      isSelected
                        ? 'bg-teal-400/15 border-teal-400/50 text-teal-400'
                        : 'bg-bg-tertiary border-border-subtle text-text-secondary hover:text-text-primary hover:border-teal-400/30'
                    }`}
                  >
                    {opt.label}
                    <span className={`ml-1.5 ${isSelected ? 'text-teal-400' : 'text-text-muted'}`}>
                      (+{opt.points})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Total score */}
      <div className={`rounded-lg border ${riskCategory.border} ${riskCategory.bg} p-4`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-text-secondary">Общий балл MPI</span>
          <span className={`text-data-lg font-mono-data font-medium ${riskCategory.color}`}>
            {total}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${riskCategory.color}`}>
            {riskCategory.label}
          </span>
          <span className="text-xs text-text-muted">{riskCategory.detail}</span>
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// qSOFA — Quick SOFA
// ===================================================================

interface qSOFACriterion {
  label: string;
  key: string;
}

const qsofaCriteria: qSOFACriterion[] = [
  { label: 'Частота дыхания ≥ 22/мин', key: 'respiratory' },
  { label: 'Систолическое АД ≤ 100 мм рт.ст.', key: 'bp' },
  { label: 'Изменение сознания (GCS < 15)', key: 'consciousness' },
];

function qSOFACalculator() {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    respiratory: false,
    bp: false,
    consciousness: false,
  });

  const toggle = useCallback((key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const total = useMemo(() => {
    return Object.values(checked).filter(Boolean).length;
  }, [checked]);

  const scoreColor = useMemo(() => {
    if (total <= 1) return 'text-success-green';
    if (total === 2) return 'text-alert-orange';
    return 'text-alert-red';
  }, [total]);

  const scoreBg = useMemo(() => {
    if (total <= 1) return 'bg-success-green/10 border-success-green/30';
    if (total === 2) return 'bg-alert-orange/10 border-alert-orange/30';
    return 'bg-alert-red/10 border-alert-red/30';
  }, [total]);

  return (
    <div className="rounded-xl border border-alert-red/20 bg-bg-secondary p-6 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-5 bg-alert-red rounded-full" />
        <h3 className="text-heading-lg font-semibold text-text-primary font-heading">
          qSOFA — Быстрая оценка острого сепсиса
        </h3>
      </div>
      <p className="text-body-sm text-text-muted mb-5 ml-3">
        qSOFA заменяет SIRS с 2016 года (Sepsis-3)
      </p>

      <div className="space-y-3 mb-6">
        {qsofaCriteria.map((criterion) => {
          const isChecked = checked[criterion.key];
          return (
            <button
              key={criterion.key}
              onClick={() => toggle(criterion.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-150 text-left ${
                isChecked
                  ? 'bg-alert-red/5 border-alert-red/30'
                  : 'bg-bg-primary border-border-subtle hover:border-teal-400/30'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  isChecked
                    ? 'bg-alert-red border-alert-red'
                    : 'border-border-subtle'
                }`}
              >
                {isChecked && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-text-primary' : 'text-text-secondary'}`}>
                {criterion.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Score display */}
      <div className={`rounded-lg border ${scoreBg} p-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Баллы qSOFA</span>
          <motion.span
            key={total}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            className={`text-data-lg font-mono-data font-medium ${scoreColor}`}
          >
            {total} / 3
          </motion.span>
        </div>
        <p className="text-xs text-text-muted">
          {total >= 2
            ? 'qSOFA ≥ 2: подозрение на сепсис — требуется полная оценка SOFA и исходные лактат'
            : 'qSOFA < 2: сепсис маловероятен, но не исключён'}
        </p>
      </div>
    </div>
  );
}

// ===================================================================
// APACHE II
// ===================================================================

interface APACHEParam {
  label: string;
  key: string;
  ranges: { min: number; max: number; points: number; label: string }[];
  unit: string;
}

const apacheParams: APACHEParam[] = [
  {
    label: 'Температура',
    key: 'temp',
    unit: '°C',
    ranges: [
      { min: 41, max: 999, points: 4, label: '≥ 41' },
      { min: 39, max: 40.9, points: 3, label: '39–40.9' },
      { min: 38.5, max: 38.9, points: 1, label: '38.5–38.9' },
      { min: 36, max: 38.4, points: 0, label: '36–38.4' },
      { min: 34, max: 35.9, points: 1, label: '34–35.9' },
      { min: 32, max: 33.9, points: 2, label: '32–33.9' },
      { min: 30, max: 31.9, points: 3, label: '30–31.9' },
      { min: -999, max: 29.9, points: 4, label: '< 30' },
    ],
  },
  {
    label: 'Среднее АД',
    key: 'map',
    unit: 'мм рт.ст.',
    ranges: [
      { min: 160, max: 999, points: 4, label: '≥ 160' },
      { min: 130, max: 159, points: 3, label: '130–159' },
      { min: 110, max: 129, points: 2, label: '110–129' },
      { min: 70, max: 109, points: 0, label: '70–109' },
      { min: 50, max: 69, points: 2, label: '50–69' },
      { min: -999, max: 49, points: 4, label: '< 50' },
    ],
  },
  {
    label: 'ЧСС',
    key: 'hr',
    unit: '/мин',
    ranges: [
      { min: 180, max: 999, points: 4, label: '≥ 180' },
      { min: 140, max: 179, points: 3, label: '140–179' },
      { min: 110, max: 139, points: 2, label: '110–139' },
      { min: 70, max: 109, points: 0, label: '70–109' },
      { min: 55, max: 69, points: 2, label: '55–69' },
      { min: 40, max: 54, points: 3, label: '40–54' },
      { min: -999, max: 39, points: 4, label: '< 40' },
    ],
  },
  {
    label: 'Частота дыхания',
    key: 'rr',
    unit: '/мин',
    ranges: [
      { min: 50, max: 999, points: 4, label: '≥ 50' },
      { min: 35, max: 49, points: 3, label: '35–49' },
      { min: 25, max: 34, points: 1, label: '25–34' },
      { min: 12, max: 24, points: 0, label: '12–24' },
      { min: 10, max: 11, points: 1, label: '10–11' },
      { min: 6, max: 9, points: 2, label: '6–9' },
      { min: -999, max: 5, points: 4, label: '< 6' },
    ],
  },
  {
    label: 'PaO₂ / FiO₂',
    key: 'pao2',
    unit: 'мм рт.ст.',
    ranges: [
      { min: 500, max: 999, points: 4, label: '≥ 500' },
      { min: 350, max: 499, points: 3, label: '350–499' },
      { min: 200, max: 349, points: 2, label: '200–349' },
      { min: -999, max: 200, points: 0, label: '< 200 (или PaO₂ > 70)' },
    ],
  },
  {
    label: 'pH артериальный',
    key: 'ph',
    unit: '',
    ranges: [
      { min: 7.7, max: 999, points: 4, label: '≥ 7.7' },
      { min: 7.6, max: 7.69, points: 3, label: '7.6–7.69' },
      { min: 7.5, max: 7.59, points: 1, label: '7.5–7.59' },
      { min: 7.33, max: 7.49, points: 0, label: '7.33–7.49' },
      { min: 7.25, max: 7.32, points: 2, label: '7.25–7.32' },
      { min: 7.15, max: 7.24, points: 3, label: '7.15–7.24' },
      { min: -999, max: 7.14, points: 4, label: '< 7.15' },
    ],
  },
];

function APACHECalculator() {
  const [values, setValues] = useState<Record<string, string>>({
    temp: '',
    map: '',
    hr: '',
    rr: '',
    pao2: '',
    ph: '',
  });
  const [agePoints, setAgePoints] = useState(0);

  const handleChange = useCallback((key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  const getPointsForParam = useCallback((param: APACHEParam): number => {
    const val = parseFloat(values[param.key]);
    if (isNaN(val)) return 0;
    for (const range of param.ranges) {
      if (val >= range.min && val <= range.max) return range.points;
    }
    return 0;
  }, [values]);

  const physiologicalTotal = useMemo(() => {
    return apacheParams.reduce((sum, param) => sum + getPointsForParam(param), 0);
  }, [getPointsForParam]);

  const total = physiologicalTotal + agePoints;

  const totalColor = useMemo(() => {
    if (total <= 10) return 'text-success-green';
    if (total <= 20) return 'text-alert-yellow';
    if (total <= 25) return 'text-alert-orange';
    return 'text-alert-red';
  }, [total]);

  return (
    <div className="rounded-xl border border-info-blue/20 bg-bg-secondary p-6 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-5 bg-info-blue rounded-full" />
        <h3 className="text-heading-lg font-semibold text-text-primary font-heading">
          APACHE II — Оценка острого физиологического возраста
        </h3>
      </div>
      <p className="text-body-sm text-text-muted mb-5 ml-3">
        6 критических параметров для экстренного контекста
      </p>

      {/* Physiological params */}
      <div className="space-y-3 mb-6">
        {apacheParams.map((param) => {
          const val = values[param.key];
          const points = getPointsForParam(param);
          return (
            <div key={param.key} className="bg-bg-primary rounded-lg p-3 border border-border-subtle">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-text-primary">
                  {param.label}
                </label>
                {points > 0 && (
                  <span className="text-xs font-medium text-alert-orange">
                    +{points} баллов
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={val}
                  onChange={(e) => handleChange(param.key, e.target.value)}
                  placeholder={param.ranges.map((r) => r.label).join(' / ')}
                  className="flex-1 bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-teal-400/50 transition-colors font-mono-data"
                />
                <span className="text-xs text-text-muted flex-shrink-0 w-20 text-right">
                  {param.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Age points */}
      <div className="bg-bg-primary rounded-lg p-3 border border-border-subtle mb-6">
        <label className="text-sm font-medium text-text-primary mb-2 block">
          Возрастные баллы
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '< 44', points: 0 },
            { label: '45–54', points: 2 },
            { label: '55–64', points: 3 },
            { label: '65–74', points: 5 },
            { label: '≥ 75', points: 6 },
          ].map((opt) => (
            <button
              key={opt.points}
              onClick={() => setAgePoints(opt.points)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-150 ${
                agePoints === opt.points
                  ? 'bg-info-blue/15 border-info-blue/50 text-info-blue'
                  : 'bg-bg-tertiary border-border-subtle text-text-secondary hover:text-text-primary hover:border-info-blue/30'
              }`}
            >
              {opt.label} (+{opt.points})
            </button>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className={`rounded-lg border ${
        total <= 10 ? 'border-success-green/30 bg-success-green/10' :
        total <= 20 ? 'border-alert-yellow/30 bg-alert-yellow/10' :
        total <= 25 ? 'border-alert-orange/30 bg-alert-orange/10' :
        'border-alert-red/30 bg-alert-red/10'
      } p-4`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-text-secondary">APACHE II</span>
          <motion.span
            key={total}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            className={`text-data-lg font-mono-data font-medium ${totalColor}`}
          >
            {total}
          </motion.span>
        </div>
        <p className="text-xs text-text-muted">
          {total > 25
            ? 'APACHE II > 25: прогноз крайне неблагоприятный'
            : total > 20
            ? 'APACHE II > 20: высокая летальность'
            : total > 10
            ? 'APACHE II 11–20: умеренный риск'
            : 'APACHE II ≤ 10: низкий риск'}
        </p>
      </div>
    </div>
  );
}

// ===================================================================
// Main section
// ===================================================================
export default function ScoringSystemsSection() {
  return (
    <section className="w-full bg-bg-secondary py-10 px-4 sm:px-6 border-t border-border-subtle">
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="mb-8"
        >
          <span className="text-xs font-medium text-teal-400 uppercase tracking-[0.06em] label">
            СИСТЕМЫ ОЦЕНКИ
          </span>
          <h2 className="font-heading text-display-md font-semibold text-text-primary mt-2">
            Клинические системы оценки
          </h2>
        </motion.div>

        {/* Three scoring cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          >
            <MPICalculator />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: easeOutExpo }}
          >
            {qSOFACalculator()}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeOutExpo }}
          >
            <APACHECalculator />
          </motion.div>
        </div>

        {/* Note */}
        <div className="mt-6 flex items-start gap-2 text-text-muted">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="text-xs">
            Баллы рассчитываются автоматически. Все значения — при поступлении.
            APACHE II: полная версия (12 параметров) — в стационаре при поступлении в ОРИТ.
          </p>
        </div>
      </div>
    </section>
  );
}
