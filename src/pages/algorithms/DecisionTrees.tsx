import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  ShieldAlert,
  User,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  ArrowRight,
} from 'lucide-react';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
interface TreeNode {
  id: string;
  type: 'question' | 'result';
  text: string;
  result?: {
    severity: 'red' | 'orange' | 'yellow' | 'green';
    action: string;
    detail?: string;
  };
}

interface TreeEdge {
  from: string;
  to: string;
  label: string;
}

interface DecisionTree {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  nodes: TreeNode[];
  edges: TreeEdge[];
  rootId: string;
}

interface TreeState {
  currentNodeId: string;
  path: string[]; // sequence of nodeIds visited
  choices: { nodeId: string; choice: string }[];
}

// ------------------------------------------------------------------
// Animation helpers
// ------------------------------------------------------------------
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: easeOutExpo },
};

// ------------------------------------------------------------------
// Severity styling
// ------------------------------------------------------------------
function severityStyles(severity: string) {
  switch (severity) {
    case 'red':
      return {
        border: 'border-alert-red',
        bg: 'bg-alert-red/10',
        text: 'text-alert-red',
        glow: 'shadow-glow-red',
        icon: <AlertTriangle className="w-5 h-5" />,
      };
    case 'orange':
      return {
        border: 'border-alert-orange',
        bg: 'bg-alert-orange/10',
        text: 'text-alert-orange',
        glow: 'shadow-glow-orange',
        icon: <Stethoscope className="w-5 h-5" />,
      };
    case 'yellow':
      return {
        border: 'border-alert-yellow',
        bg: 'bg-alert-yellow/10',
        text: 'text-alert-yellow',
        glow: '',
        icon: <AlertTriangle className="w-5 h-5" />,
      };
    case 'green':
      return {
        border: 'border-success-green',
        bg: 'bg-success-green/10',
        text: 'text-success-green',
        glow: '',
        icon: <CheckCircle2 className="w-5 h-5" />,
      };
    default:
      return {
        border: 'border-border-subtle',
        bg: 'bg-bg-primary',
        text: 'text-text-primary',
        glow: '',
        icon: null,
      };
  }
}

// ------------------------------------------------------------------
// Tree 1: Knife-like pain
// ------------------------------------------------------------------
const knifePainTree: DecisionTree = {
  id: 'knife',
  title: 'Кинжальная боль',
  icon: <Zap className="w-5 h-5" />,
  color: 'text-alert-red',
  description: 'Острая "кинжальная" боль в животе или спине',
  rootId: 'k1',
  nodes: [
    { id: 'k1', type: 'question', text: 'Характер боли — "кинжальная", внезапная, максимальная интенсивность?' },
    { id: 'k2a', type: 'question', text: 'Локализация боли?' },
    { id: 'k3a', type: 'question', text: 'Эпигастрий + иррадиация в спину. Пульс > 100 или АД разница > 20?' },
    { id: 'k3b', type: 'question', text: 'Правый подреберье. Жёлтуха есть?' },
    { id: 'k3c', type: 'question', text: 'Распространённая боль по всему животу' },
    { id: 'k4a', type: 'question', text: 'ИМ исключён (ЭКГ + тропонин)?' },
    { id: 'k2b', type: 'question', text: 'Боль прогрессирует?' },
    { id: 'k5a', type: 'question', text: 'Реакция брюшной стенки — напряжение / резистентность?' },
    { id: 'k5b', type: 'question', text: 'qSOFA ≥ 2?' },
    { id: 'kr1', type: 'result', text: 'РАЗРЫВ АОРТЫ — КТ-ангио НЕМЕДЛЕННО', result: { severity: 'red', action: 'КТ-ангиография аорты немедленно', detail: 'Расслоение/разрыв аорты — максимальный приоритет' } },
    { id: 'kr2', type: 'result', text: 'СРОЧНО: ЭКГ + Тропонин', result: { severity: 'yellow', action: 'Исключить острый ИМ', detail: 'Эпигастральная боль может маскировать ИМ' } },
    { id: 'kr3', type: 'result', text: 'КОНСУЛЬТАЦИЯ: Панкреонекроз / пенетрирующая язва', result: { severity: 'orange', action: 'Хирургическая консультация', detail: 'Возможен панкреонекроз или пенетрирующая язва желудка' } },
    { id: 'kr4', type: 'result', text: 'ЖЁЛЧНЫЙ СЕПСИС — дренаж + антибиотики', result: { severity: 'red', action: 'Экстренный дренаж + антибиотики', detail: 'Обструктивная желтуха с сепсисом — декомпрессия' } },
    { id: 'kr5', type: 'result', text: 'КОНСУЛЬТАЦИЯ: Перфорация ЖКТ / мезентериальная ишемия', result: { severity: 'orange', action: 'Хирургическая консультация', detail: 'Возможна перфорация ЖКТ или мезентериальная ишемия' } },
    { id: 'kr6', type: 'result', text: 'ДИФФУЗНЫЙ ПЕРИТОНИТ — в операционную', result: { severity: 'red', action: 'Экстренная лапаротомия', detail: 'Диффузный перитонит — хирургическое вмешательство' } },
    { id: 'kr7', type: 'result', text: 'ПЕРИТОНИТ ВЕРОЯТЕН — в операционную', result: { severity: 'orange', action: 'Лапаротомия показана', detail: 'Напряжение брюшной стенки = перитонит' } },
    { id: 'kr8', type: 'result', text: 'СЕПСИС — агрессивная терапия', result: { severity: 'red', action: 'Протокол сепсиса', detail: 'qSOFA ≥ 2: антибиотики, жидкости, вазопрессоры' } },
    { id: 'kr9', type: 'result', text: 'НАБЛЮДЕНИЕ + повторная оценка через 2–4ч', result: { severity: 'yellow', action: 'Динамическое наблюдение', detail: 'Повторная оценка через 2–4 часа' } },
    { id: 'kr10', type: 'result', text: 'НАБЛЮДЕНИЕ / амбулаторное наблюдение', result: { severity: 'green', action: 'Наблюдение', detail: 'Без прогрессирования — амбулаторное наблюдение' } },
  ],
  edges: [
    { from: 'k1', to: 'k2a', label: 'Да' },
    { from: 'k1', to: 'k2b', label: 'Нет' },
    { from: 'k2a', to: 'k3a', label: 'Эпигастрий + спина' },
    { from: 'k2a', to: 'k3b', label: 'Правый подреберье' },
    { from: 'k2a', to: 'k3c', label: 'Распространённая' },
    { from: 'k3a', to: 'kr1', label: 'Да' },
    { from: 'k3a', to: 'k4a', label: 'Нет' },
    { from: 'k4a', to: 'kr2', label: 'Нет' },
    { from: 'k4a', to: 'kr3', label: 'Да' },
    { from: 'k3b', to: 'kr4', label: 'Да' },
    { from: 'k3b', to: 'kr5', label: 'Нет' },
    { from: 'k3c', to: 'kr6', label: '—' },
    { from: 'k2b', to: 'k5a', label: 'Да' },
    { from: 'k2b', to: 'kr10', label: 'Нет' },
    { from: 'k5a', to: 'kr7', label: 'Да' },
    { from: 'k5a', to: 'k5b', label: 'Нет' },
    { from: 'k5b', to: 'kr8', label: 'Да' },
    { from: 'k5b', to: 'kr9', label: 'Нет' },
  ],
};

// ------------------------------------------------------------------
// Tree 2: False well-being
// ------------------------------------------------------------------
const falseWellbeingTree: DecisionTree = {
  id: 'false-wellbeing',
  title: 'Мнимое благополучие',
  icon: <ShieldAlert className="w-5 h-5" />,
  color: 'text-alert-orange',
  description: 'Пациент выглядит стабильно, но клиника подозрительна',
  rootId: 'f1',
  nodes: [
    { id: 'f1', type: 'question', text: 'Пациент относительно стабилен, но клиника подозрительна?' },
    { id: 'f2a', type: 'question', text: 'Есть маркёры скрытой перфорации?' },
    { id: 'f3a', type: 'question', text: 'Пульс > 90 + тахипноэ. Боль в плече (Kehr)?' },
    { id: 'f3b', type: 'question', text: 'Скрытая гипотензия. Дельта АД > 20 при вставании?' },
    { id: 'f3c', type: 'question', text: 'Изменение сознания. Лактат > 2?' },
    { id: 'fr1', type: 'result', text: 'ДИАФРАГМАЛЬНАЯ ПЕРФОРАЦИЯ — КТ + консультация', result: { severity: 'red', action: 'КТ брюшной полости + хирург', detail: 'Боль в плече (Kehr) = диафрагмальная перфорация' } },
    { id: 'fr2', type: 'result', text: 'ПОДДИАФРАГМАЛЬНЫЙ АБСЦЕСС — КТ + дренаж', result: { severity: 'orange', action: 'КТ + перкутанный дренаж', detail: 'Поддиафрагмальный абсцесс после хирургии' } },
    { id: 'fr3', type: 'result', text: 'ВНУТРЕННЕЕ КРОВОТЕЧЕНИЕ — гемотрансфузия + операция', result: { severity: 'red', action: 'Ортостатический коллапс = кровотечение', detail: 'Скрытое внутреннее кровотечение' } },
    { id: 'fr4', type: 'result', text: 'РАННЯЯ СЕПТИЧЕСКАЯ ГИПОТЕНЗИЯ — сепсис-протокол', result: { severity: 'red', action: 'Протокол сепсиса', detail: 'Ранняя септическая гипотензия' } },
    { id: 'fr5', type: 'result', text: 'СКРЫТЫЙ СЕПСИС — агрессивная терапия', result: { severity: 'red', action: 'Протокол сепсиса', detail: 'Лактат > 2 + изменение сознания = сепсис' } },
    { id: 'fr6', type: 'result', text: 'ИНТОКСИКАЦИЯ / МЕТАБОЛИЧЕСКИЙ — обследование', result: { severity: 'orange', action: 'Детоксикация + обследование', detail: 'Возможна интоксикация или метаболическая энцефалопатия' } },
    { id: 'fr7', type: 'result', text: 'ПРОДОЛЖАТЬ НАБЛЮДЕНИЕ — повторить через 2ч', result: { severity: 'yellow', action: 'Наблюдение', detail: 'Маркёры отрицательны — повтор через 2 часа' } },
    { id: 'fr8', type: 'result', text: 'ОЧЕВИДНАЯ ТЯЖЁЛАЯ ПАТОЛОГИЯ — действовать', result: { severity: 'red', action: 'Немедленные действия', detail: 'Очевидная тяжёлая патология' } },
  ],
  edges: [
    { from: 'f1', to: 'f2a', label: 'Да' },
    { from: 'f1', to: 'fr8', label: 'Нет' },
    { from: 'f2a', to: 'f3a', label: 'Пульс > 90 + тахипноэ' },
    { from: 'f2a', to: 'f3b', label: 'Скрытая гипотензия' },
    { from: 'f2a', to: 'f3c', label: 'Изменение сознания' },
    { from: 'f2a', to: 'fr7', label: 'Нет маркёров' },
    { from: 'f3a', to: 'fr1', label: 'Да' },
    { from: 'f3a', to: 'fr2', label: 'Нет' },
    { from: 'f3b', to: 'fr3', label: 'Да' },
    { from: 'f3b', to: 'fr4', label: 'Нет' },
    { from: 'f3c', to: 'fr5', label: 'Да' },
    { from: 'f3c', to: 'fr6', label: 'Нет' },
  ],
};

// ------------------------------------------------------------------
// Tree 3: Elderly patient
// ------------------------------------------------------------------
const elderlyTree: DecisionTree = {
  id: 'elderly',
  title: 'Пожилой пациент',
  icon: <User className="w-5 h-5" />,
  color: 'text-alert-yellow',
  description: 'Старший пациент с размытой клиникой',
  rootId: 'e1',
  nodes: [
    { id: 'e1', type: 'question', text: 'Пациент > 65 лет с неясной абдоминальной картиной?' },
    { id: 'e2a', type: 'question', text: 'Перитониальные знаки?' },
    { id: 'e3a', type: 'question', text: 'Локализация перитонеальных знаков?' },
    { id: 'e4a', type: 'question', text: 'КТ с контрастом доступна?' },
    { id: 'e3b', type: 'question', text: 'Системные признаки (лихорадка / лейкоцитоз)?' },
    { id: 'e4b', type: 'question', text: 'КТ доступна в течение 30 мин?' },
    { id: 'e5a', type: 'question', text: 'Ухудшение за последние 6 часов?' },
    { id: 'er1', type: 'result', text: 'ДИФФУЗНЫЙ ПЕРИТОНИТ — лапаротомия', result: { severity: 'red', action: 'Экстренная лапаротомия', detail: 'Диффузный перитонит у пожилого — безотлагательная операция' } },
    { id: 'er2', type: 'result', text: 'КОНТРОЛИРУЕМЫЙ ДОСТУП + ДРЕНАЖ — КТ-навигация', result: { severity: 'orange', action: 'КТ-навигация + дренаж', detail: 'Локализованный перитонит — КТ-контролируемый доступ' } },
    { id: 'er3', type: 'result', text: 'ЛАПАРОТОМИЯ — локализованный перитонит', result: { severity: 'red', action: 'Лапаротомия', detail: 'Нет КТ — лапаротомия' } },
    { id: 'er4', type: 'result', text: 'КТ-СКАНИРОВАНИЕ', result: { severity: 'orange', action: 'КТ с контрастом', detail: 'Системные признаки + КТ доступна' } },
    { id: 'er5', type: 'result', text: 'АКТИВНОЕ НАБЛЮДЕНИЕ — повтор через 2ч', result: { severity: 'yellow', action: 'Наблюдение', detail: 'Активное наблюдение, повтор через 2 часа' } },
    { id: 'er6', type: 'result', text: 'КТ-СКАНИРОВАНИЕ СРОЧНО', result: { severity: 'orange', action: 'Срочное КТ', detail: 'Ухудшение состояния — КТ срочно' } },
    { id: 'er7', type: 'result', text: 'НАБЛЮДЕНИЕ — повтор через 4ч', result: { severity: 'green', action: 'Наблюдение', detail: 'Стабильно — повтор через 4 часа' } },
    { id: 'er8', type: 'result', text: 'СТАНДАРТНАЯ ОЦЕНКА — не экстренный', result: { severity: 'green', action: 'Стандартная оценка', detail: 'Пациент < 65 лет — стандартный алгоритм' } },
  ],
  edges: [
    { from: 'e1', to: 'e2a', label: 'Да' },
    { from: 'e1', to: 'er8', label: 'Нет' },
    { from: 'e2a', to: 'e3a', label: 'Да' },
    { from: 'e2a', to: 'e3b', label: 'Нет' },
    { from: 'e3a', to: 'er1', label: 'Диффузная' },
    { from: 'e3a', to: 'e4a', label: 'Локализованная' },
    { from: 'e4a', to: 'er2', label: 'Да' },
    { from: 'e4a', to: 'er3', label: 'Нет' },
    { from: 'e3b', to: 'e4b', label: 'Да' },
    { from: 'e3b', to: 'e5a', label: 'Нет' },
    { from: 'e4b', to: 'er4', label: 'Да' },
    { from: 'e4b', to: 'er5', label: 'Нет' },
    { from: 'e5a', to: 'er6', label: 'Да' },
    { from: 'e5a', to: 'er7', label: 'Нет' },
  ],
};

// ------------------------------------------------------------------
// Tree 4: Re-presentation
// ------------------------------------------------------------------
const rePresentationTree: DecisionTree = {
  id: 're-presentation',
  title: 'Повторное обращение',
  icon: <RotateCcw className="w-5 h-5" />,
  color: 'text-teal-400',
  description: 'Пациент уже обращался, состояние изменилось',
  rootId: 'r1',
  nodes: [
    { id: 'r1', type: 'question', text: 'Пациент повторно обратился после недавней выписки?' },
    { id: 'r2a', type: 'question', text: 'Причина повторного обращения?' },
    { id: 'r3a', type: 'question', text: 'Было ли хирургическое вмешательство?' },
    { id: 'r4a', type: 'question', text: 'Тип вмешательства?' },
    { id: 'r4b', type: 'question', text: 'Новые симптомы?' },
    { id: 'r3b', type: 'question', text: 'Дней после выписки?' },
    { id: 'r3c', type: 'question', text: 'qSOFA ≥ 2?' },
    { id: 'rr1', type: 'result', text: 'ИНТРААБСЦЕДИРОВАНИЕ — КТ + дренаж', result: { severity: 'red', action: 'КТ + перкутанный дренаж', detail: 'После аппендэктомии — интраабсцедирование' } },
    { id: 'rr2', type: 'result', text: 'ПОСТОП. КРОВОТЕЧЕНИЕ / БИЛИОМА — реоперация', result: { severity: 'red', action: 'Реоперация', detail: 'После холецистэктомии — кровотечение или билиома' } },
    { id: 'rr3', type: 'result', text: 'ПЕРВИЧНАЯ НЕЗАЖИВЛЕНИЕ — реоперация', result: { severity: 'red', action: 'Реоперация', detail: 'После лапаротомии — первичная незаживление шва' } },
    { id: 'rr4', type: 'result', text: 'НОВАЯ ПАТОЛОГИЯ — полное обследование', result: { severity: 'orange', action: 'Полное обследование', detail: 'Новая патология не связана с предыдущим' } },
    { id: 'rr5', type: 'result', text: 'ОБОСТРЕНИЕ ХРОНИЧЕСКОГО — консультация', result: { severity: 'yellow', action: 'Консервативное лечение', detail: 'Обострение хронического заболевания' } },
    { id: 'rr6', type: 'result', text: 'ХИРУРГИЧЕСКАЯ ИНФЕКЦИЯ — антибиотики + дренаж', result: { severity: 'red', action: 'Антибиотики + дренаж', detail: '< 7 дней — хирургическая инфекция раны' } },
    { id: 'rr7', type: 'result', text: 'ВНЕБОЛЬНИЧНАЯ ИНФЕКЦИЯ — обследование', result: { severity: 'orange', action: 'Обследование', detail: '> 7 дней — внебольничная инфекция' } },
    { id: 'rr8', type: 'result', text: 'СЕПСИС — агрессивная терапия', result: { severity: 'red', action: 'Протокол сепсиса', detail: 'qSOFA ≥ 2 — агрессивная терапия' } },
    { id: 'rr9', type: 'result', text: 'ОБСЛЕДОВАНИЕ + НАБЛЮДЕНИЕ', result: { severity: 'yellow', action: 'Обследование', detail: 'qSOFA < 2 — обследование и наблюдение' } },
    { id: 'rr10', type: 'result', text: 'СТАНДАРТНЫЙ ПРИЁМ — не экстренный', result: { severity: 'green', action: 'Стандартный приём', detail: 'Первичное обращение — стандартный приём' } },
  ],
  edges: [
    { from: 'r1', to: 'r2a', label: 'Да' },
    { from: 'r1', to: 'rr10', label: 'Нет' },
    { from: 'r2a', to: 'r3a', label: 'Усиление боли' },
    { from: 'r2a', to: 'r3b', label: 'Лихорадка' },
    { from: 'r2a', to: 'r3c', label: 'Изменение состояния' },
    { from: 'r3a', to: 'r4a', label: 'Да' },
    { from: 'r3a', to: 'r4b', label: 'Нет' },
    { from: 'r4a', to: 'rr1', label: 'Аппендэктомия' },
    { from: 'r4a', to: 'rr2', label: 'Холецистэктомия' },
    { from: 'r4a', to: 'rr3', label: 'Лапаротомия' },
    { from: 'r4b', to: 'rr4', label: 'Да' },
    { from: 'r4b', to: 'rr5', label: 'Нет' },
    { from: 'r3b', to: 'rr6', label: '< 7 дней' },
    { from: 'r3b', to: 'rr7', label: '> 7 дней' },
    { from: 'r3c', to: 'rr8', label: 'Да' },
    { from: 'r3c', to: 'rr9', label: 'Нет' },
  ],
};

const allTrees = [knifePainTree, falseWellbeingTree, elderlyTree, rePresentationTree];

// ------------------------------------------------------------------
// Single interactive tree renderer
// ------------------------------------------------------------------
function InteractiveTree({ tree }: { tree: DecisionTree }) {
  const [state, setState] = useState<TreeState>({
    currentNodeId: tree.rootId,
    path: [tree.rootId],
    choices: [],
  });

  const getNode = useCallback(
    (id: string) => tree.nodes.find((n) => n.id === id)!,
    [tree]
  );

  const getEdges = useCallback(
    (fromId: string) => tree.edges.filter((e) => e.from === fromId),
    [tree]
  );

  const handleChoice = useCallback(
    (edge: TreeEdge) => {
      setState((prev) => ({
        currentNodeId: edge.to,
        path: [...prev.path, edge.to],
        choices: [...prev.choices, { nodeId: prev.currentNodeId, choice: edge.label }],
      }));
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      currentNodeId: tree.rootId,
      path: [tree.rootId],
      choices: [],
    });
  }, [tree.rootId]);

  const jumpTo = useCallback((index: number) => {
    setState((prev) => ({
      currentNodeId: prev.path[index],
      path: prev.path.slice(0, index + 1),
      choices: prev.choices.slice(0, index),
    }));
  }, []);

  const currentNode = getNode(state.currentNodeId);
  const isResult = currentNode.type === 'result';

  return (
    <div className="w-full">
      {/* Breadcrumb trail */}
      <div className="flex items-center gap-1.5 flex-wrap mb-6">
        <span className="text-xs text-text-muted uppercase tracking-wider">Вы здесь:</span>
        {state.path.map((nodeId, i) => {
          const node = getNode(nodeId);
          const isLast = i === state.path.length - 1;
          return (
            <div key={`${nodeId}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <ArrowRight className="w-3 h-3 text-text-muted flex-shrink-0" />}
              <button
                onClick={() => !isLast && jumpTo(i)}
                className={`text-xs px-2 py-0.5 rounded-full transition-all duration-150 ${
                  isLast
                    ? 'bg-teal-400/20 text-teal-400 font-medium'
                    : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-elevated cursor-pointer'
                }`}
              >
                {node.type === 'result'
                  ? 'Результат'
                  : i === 0
                  ? 'Начало'
                  : `Шаг ${i}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Current node display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentNodeId}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: easeOutExpo }}
          className="w-full"
        >
          {isResult && currentNode.result ? (
            <ResultCard node={currentNode} />
          ) : (
            <QuestionCard
              node={currentNode}
              edges={getEdges(state.currentNodeId)}
              onChoice={handleChoice}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Reset button */}
      <button
        onClick={reset}
        className="mt-6 flex items-center gap-2 text-sm text-text-muted hover:text-teal-400 transition-colors duration-150"
      >
        <RotateCcw className="w-4 h-4" />
        Начать заново
      </button>
    </div>
  );
}

// ------------------------------------------------------------------
// Question card
// ------------------------------------------------------------------
function QuestionCard({
  node,
  edges,
  onChoice,
}: {
  node: TreeNode;
  edges: TreeEdge[];
  onChoice: (edge: TreeEdge) => void;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-primary p-6 md:p-8 shadow-card">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-1 h-full min-h-[40px] bg-teal-400 rounded-full flex-shrink-0" />
        <h3 className="text-lg md:text-xl font-semibold text-text-primary font-heading leading-snug">
          {node.text}
        </h3>
      </div>

      <div className="flex flex-wrap gap-3 ml-4">
        {edges.map((edge, i) => (
          <motion.button
            key={edge.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: easeOutExpo }}
            onClick={() => onChoice(edge)}
            className={getChoiceButtonClass(edge.label)}
          >
            {edge.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function getChoiceButtonClass(label: string): string {
  const base = 'px-5 py-2.5 rounded-lg text-sm font-medium border transition-all duration-150 ';
  if (label === 'Да') {
    return (
      base +
      'border-success-green/40 text-success-green hover:bg-success-green/10 hover:border-success-green'
    );
  }
  if (label === 'Нет') {
    return (
      base +
      'border-alert-red/40 text-alert-red hover:bg-alert-red/10 hover:border-alert-red'
    );
  }
  return (
    base +
    'border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-tertiary hover:border-teal-400/40'
  );
}

// ------------------------------------------------------------------
// Result card
// ------------------------------------------------------------------
function ResultCard({ node }: { node: TreeNode }) {
  if (!node.result) return null;
  const s = severityStyles(node.result.severity);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
      className={`rounded-xl border-2 ${s.border} ${s.bg} p-6 md:p-8 ${s.glow}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`${s.text}`}>{s.icon}</div>
        <h3 className={`text-xl md:text-2xl font-bold font-heading ${s.text}`}>
          {node.text}
        </h3>
      </div>
      <p className="text-base text-text-primary font-medium mb-2">
        {node.result.action}
      </p>
      {node.result.detail && (
        <p className="text-sm text-text-secondary">{node.result.detail}</p>
      )}
    </motion.div>
  );
}

// ------------------------------------------------------------------
// Main section component
// ------------------------------------------------------------------
export default function DecisionTreesSection() {
  const [activeTree, setActiveTree] = useState(0);

  return (
    <section className="w-full bg-bg-secondary py-10 px-4 sm:px-6 border-t border-border-subtle">
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <motion.div
          {...fadeInUp}
          className="mb-8"
        >
          <span className="text-xs font-medium text-teal-400 uppercase tracking-[0.06em] label">
            DECISION TREES
          </span>
          <h2 className="font-heading text-display-md font-semibold text-text-primary mt-2">
            Интерактивные алгоритмы принятия решений
          </h2>
          <p className="text-body-md text-text-secondary mt-2 max-w-[680px]">
            Выберите клинический сценарий и следуйте по алгоритму шаг за шагом.
          </p>
        </motion.div>

        {/* Scenario selector */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-thin">
          {allTrees.map((tree, i) => (
            <motion.button
              key={tree.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: easeOutExpo }}
              onClick={() => setActiveTree(i)}
              className={`flex-shrink-0 w-[240px] rounded-xl border p-4 text-left transition-all duration-200 ${
                activeTree === i
                  ? 'bg-bg-tertiary border-teal-400/60 shadow-glow-teal scale-[1.02]'
                  : 'bg-bg-primary border-border-subtle hover:border-teal-400/30 hover:-translate-y-0.5'
              }`}
            >
              <div className={`${tree.color} mb-2`}>{tree.icon}</div>
              <h3 className="text-sm font-semibold text-text-primary font-heading">
                {tree.title}
              </h3>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                {tree.description}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Active tree panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTree}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
          >
            <InteractiveTree tree={allTrees[activeTree]} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
