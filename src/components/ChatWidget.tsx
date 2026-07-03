import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Stethoscope,
  Lock,
  Crown,
  Sparkles,
  FlaskConical,
} from 'lucide-react';
import { useSubscription, activateDemoPro, isDemoActive } from '../hooks/useSubscription';

// ═══════════════════════════════════════════════════
// AI Medical Knowledge Base — Client-side
// ═══════════════════════════════════════════════════

interface KnowledgeEntry {
  keywords: string[];
  response: string;
  category: string;
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ['тишпа', 'цитокин', 'каскад', 'tnf', 'il-1', 'il-6', 'pct', 'crp'],
    category: 'TISCPA',
    response:
      '**Каскад TISCPA** — хронология цитокиновой активации при остром животе:\n\n' +
      '1. **TNF-α** (0–1 ч) — первичный триггер, активация эндотелия\n' +
      '2. **IL-1β** (1–3 ч) — усиление воспаления, лихорадка\n' +
      '3. **IL-6** (3–6 ч) — острый фазовый ответ, индукция CRP\n' +
      '4. **IL-10** (6–12 ч) — анти-воспалительный контррегулятор\n' +
      '5. **PCT** (12–24 ч) — маркёр бактериальной инфекции\n' +
      '6. **CRP** (24–48 ч) — поздний фазовый белок\n\n' +
      'Клиническое значение: ранняя диагностика определяется IL-6 и TNF-α, ' +
      'а PCT помогает дифференцировать бактериальный и стерильный перитонит.',
  },
  {
    keywords: ['d-лактат', 'd-lactate', 'ишемия', 'кишечник', 'barrier'],
    category: 'Барьерная дисфункция',
    response:
      '**D-лактат** — ключевой маркёр ишемии кишечника:\n\n' +
      '- Норма: 0.006–0.02 ммоль/л\n' +
      '- Порог ОЖ: > 0.5 ммоль/л\n' +
      '- Критический: > 3.0 ммоль/л\n' +
      '- AUC диагностики: 0.89\n\n' +
      'D-лактат — продукт бактериального метаболизма, практически не всасывается в норме. ' +
      'При ишемии кишечника повышается проницаемость слизистой, и D-лактат попадает в кровоток. ' +
      'Сочетание с I-FABP (> 500 pg/mL) повышает специфичность диагностики.',
  },
  {
    keywords: ['i-fabp', 'fabp', 'энтероцит', 'некроз'],
    category: 'Барьерные маркёры',
    response:
      '**I-FABP** (Intestinal Fatty Acid Binding Protein):\n\n' +
      '- Молекулярная масса: 15 кДа\n' +
      '- T1/2 в плазме: ~11 мин\n' +
      '- Норма: < 150 pg/mL\n' +
      '- Критический: > 500 pg/mL\n' +
      '- AUC (мета-анализ): 0.86\n\n' +
      'I-FABP — цитоплазматический белок энтероцитов. Высвобождается при повреждении ' +
      'кишечной стенки. Короткий период полураспада делает его ранним маркёром острой ' +
      'кишечной ишемии. Нормализация в течение 2–4 часов может указывать на транзиторную ишемию.',
  },
  {
    keywords: ['pct', 'прокальцитонин', 'бактериальный', 'инфекция'],
    category: 'Воспалительные маркёры',
    response:
      '**Прокальцитонин (PCT)** — специфичный маркёр бактериальной инфекции:\n\n' +
      '- Норма: < 0.5 нг/мл\n' +
      '- Умеренное повышение: 0.5–2.0 нг/мл\n' +
      '- Выраженное: 2.0–10 нг/мл\n' +
      '- Критическое: > 10 нг/мл\n\n' +
      'Ключевое преимущество: **не повышается при вирусных инфекциях и стерильном воспалении**. ' +
      'При остром панкреатите PCT > 2 нг/мл указывает на инфицированный некроз. ' +
      'Динамика PCT эффективнее одиночного значения: снижение на > 50% за 48 ч — положительный прогностический знак.',
  },
  {
    keywords: ['аппендицит', 'appendicitis'],
    category: 'Дифференциальная диагностика',
    response:
      '**Острый аппендицит** — дифференциальный диагноз:\n\n' +
      '**Атипичные формы:**\n' +
      '- Ретроцекальный (20%): поздние боли в правом подреберье\n' +
      '- Тазовый: диарея, тенезмы, дизурия\n' +
      '- Позадибрюшинный: минимальная болезненность, высокий риск перфорации\n\n' +
      '**Молекулярные маркёры:**\n' +
      '- CRP > 100 мг/л + лейкоцитоз > 15×10⁹ — высокая вероятность осложнённого аппендицита\n' +
      '- IL-6 > 50 pg/mL — ранняя индикация воспаления\n' +
      '- PCT > 0.5 — перфорация или абсцесс\n\n' +
      '**Alvarado score ≥ 7** — показание к хирургическому вмешательству.',
  },
  {
    keywords: ['панкреатит', 'pancreatitis', 'липаза', 'амylаза'],
    category: 'Дифференциальная диагностика',
    response:
      '**Острый панкреатит** — диагностика по биомаркерам:\n\n' +
      '**Критерии (2+ из 3):**\n' +
      '1. Боли в эпигастрии с иррадиацией в спину\n' +
      '2. Липаза > 3× ВГН (специфичнее амилазы)\n' +
      '3. Характерные находки на КТ\n\n' +
      '**Тяжесть по BISAP:**\n' +
      '- BUN > 8.9 ммоль/л\n' +
      '- Импаирмент психики (GCS < 15)\n' +
      '- SIRS (2+ критерия)\n' +
      '- Возраст > 60 лет\n' +
      '- Плевральный выпот\n\n' +
      '**Прогноз:** PCT > 2 нг/мл на день 3 — предиктор инфицированного некроза.',
  },
  {
    keywords: ['qsofa', 'sofa', 'quick', 'сепсис', 'sepsis'],
    category: 'Шкалы оценки',
    response:
      '**qSOFA** (Quick Sequential Organ Failure Assessment):\n\n' +
      '| Критерий | Балл |\n' +
      '|----------|------|\n' +
      '| ЧСС ≥ 22/мин | +1 |\n' +
      '| Сист. АД ≤ 100 мм рт.ст. | +1 |\n' +
      '| Altered mental status | +1 |\n\n' +
      '**Интерпретация:**\n' +
      '- 0–1 балл: низкий риск (смертность ~3%)\n' +
      '- ≥ 2 балла: высокий риск (смертность ~25%) — нужна госпитализация в ОРИТ\n\n' +
      '**Важно:** qSOFA — инструмент скрининга, не заменяет полный SOFA. ' +
      'Отрицательный qSOFA не исключает сепсис при клинической подозрении.',
  },
  {
    keywords: ['лактат', 'lactate', 'метаболический', 'ацидоз'],
    category: 'Метаболические маркёры',
    response:
      '**Лактат и метаболические маркёры:**\n\n' +
      '- Лактат норма: 0.5–1.5 ммоль/л\n' +
      '- При ОЖ: повышение в 2–10 раз\n\n' +
      '**Интерпретация уровней лактата:**\n' +
      '- 2–4 ммоль/л: умеренная тканевая гипоксия\n' +
      '- 4–10 ммоль/л: тяжёлая гипоперфузия\n' +
      '- > 10 ммоль/л: критическая, прогноз неблагоприятный\n\n' +
      '**Соотношение лактат/пируват > 20** — показатель анаэробного гликолиза.\n\n' +
      'При ДКА лактат может быть нормальным или умеренно повышенным, тогда как D-лактат и ' +
      'кетоновые тела резко повышены — это ключевой дифференциальный признак.',
  },
  {
    keywords: ['hla-dr', 'иммунопаралич', 'immunoparalysis'],
    category: 'Иммунные маркёры',
    response:
      '**HLA-DR** — маркёр иммунного статуса:\n\n' +
      '- Норма: 13,500–40,000 AB/C\n' +
      '- Иммунопаралич: < 8,000 AB/C\n' +
      '- Критический: < 30% экспрессии\n\n' +
      'HLA-DR на моноцитах — маркёр адаптивного иммунитета. Снижение ассоциировано с ' +
      'иммунопараличом и вторичными инфекциями при сепсисе. Иммунопаралич встречается ' +
      'у 30–50% пациентов с тяжёлым сепсисом и ассоциирован с повышенной смертностью.',
  },
  {
    keywords: ['перитонит', 'peritonitis', 'брюшина'],
    category: 'Клинические синдромы',
    response:
      '**Перитонит** — биомаркерный профиль:\n\n' +
      '**Характерный паттерн:**\n' +
      '- ↑↑ Лактат (85/100)\n' +
      '- ↑↑ PCT (88/100)\n' +
      '- ↑↑ CRP (90/100)\n' +
      '- ↑↑ IL-6 (80/100)\n' +
      '- Норма кетоновые тела\n\n' +
      '**Дифференциальный диагноз:**\n' +
      'Выраженный воспалительный ответ с преобладанием бактериальной компоненты. ' +
      'PCT > 2 нг/мл подтверждает бактериальную этиологию. ' +
      'Стерильный перитонит (химический) имеет нормальный PCT при высоких CRP и IL-6.',
  },
  {
    keywords: ['pla2', 'фосфолипаза', 'phospholipase'],
    category: 'Ферментные маркёры',
    response:
      '**PLA2-II** (Фосфолипаза A2 группы II):\n\n' +
      '- Молекулярная масса: 13–15 кДа\n' +
      '- Норма: < 10 U/mL\n' +
      '- Критический: > 30 U/mL\n' +
      '- Пик концентрации: день 2–3\n\n' +
      'Ключевой фермент воспалительного каскада, активируется при панкреатите и перитоните. ' +
      'Высокая специфичность при остром панкреатите. Комбинация PLA2-II > 30 U/mL + ' +
      'PCT > 2 нг/мл — высокая вероятность панкреонекроза.',
  },
  {
    keywords: ['hello', 'привет', 'здравствуй', 'старт', 'help', 'помощь'],
    category: 'Общее',
    response:
      '**CDSS AI-ассистент** — ваш помощник по диагностике острого живота.\n\n' +
      'Я могу помочь с:\n' +
      '- 📊 Интерпретацией биомаркеров (TISCPA, D-лактат, PCT, IL-6...)\n' +
      '- 🔬 Молекулярным каскадом цитокинов\n' +
      '- 📋 Дифференциальной диагностикой (аппендицит, панкреатит, перитонит)\n' +
      '- 📏 Шкалами оценки (qSOFA, BISAP, Alvarado)\n' +
      '- 🧬 Барьерной дисфункцией и иммунопараличом\n\n' +
      'Просто напишите ваш вопрос о биомаркерах или диагностике острого живота!',
  },
];

// ═══════════════════════════════════════════════════
// Matching Logic
// ═══════════════════════════════════════════════════

function findBestResponse(query: string): string | null {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/);

  // Score each entry
  const scored = KNOWLEDGE_BASE.map((entry) => {
    let score = 0;
    for (const kw of entry.keywords) {
      const kwLower = kw.toLowerCase();
      // Full keyword match
      if (lower.includes(kwLower)) {
        score += 3;
        continue;
      }
      // Word-by-word partial match
      for (const word of words) {
        if (word.length >= 3 && kwLower.includes(word)) {
          score += 1;
        }
        if (word.length >= 3 && word.includes(kwLower)) {
          score += 1;
        }
      }
    }
    return { entry, score };
  });

  scored.sort((a, b) => b.score - a.score);

  if (scored.length === 0 || scored[0].score === 0) {
    return null;
  }

  return scored[0].entry.response;
}

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ═══════════════════════════════════════════════════
// ChatWidget Component
// ═══════════════════════════════════════════════════

export default function ChatWidget() {
  const { isPro, goToCheckout } = useSubscription();
  const [demoActivated, setDemoActivated] = useState(isDemoActive());
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '**Здравствуйте!** Я AI-ассистент CDSS по острому животу.\n\n' +
        'Спросите меня о биомаркерах, цитокиновом каскаде, дифференциальной диагностике ' +
        'или шкалах оценки — я помогу с интерпретацией и клиническими рекомендациями.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      const response = findBestResponse(text);

      let assistantContent: string;
      if (response) {
        assistantContent = response;
      } else {
        assistantContent =
          'Извините, я не нашёл точного ответа в своей базе знаний.\n\n' +
          'Попробуйте переформулировать вопрос, используя ключевые термины:\n' +
          '- **TISCPA**, цитокины (TNF-α, IL-6, PCT, CRP)\n' +
          '- **D-лактат**, I-FABP, барьерная дисфункция\n' +
          '- **Аппендицит**, панкреатит, перитонит\n' +
          '- **qSOFA**, BISAP, Alvarado\n' +
          '- **HLA-DR**, иммунопаралич\n' +
          '- Лактат, метаболический ацидоз\n\n' +
          'Или напишите **"помощь"** для списка тем.';
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, delay);
  }, [input, isTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const hasAccess = isPro || demoActivated;

  const handleChatClick = useCallback(() => {
    if (hasAccess) {
      setIsOpen(!isOpen);
    } else {
      setShowUpgrade(true);
    }
  }, [hasAccess, isOpen]);

  const handleDemo = useCallback(() => {
    activateDemoPro();
    setDemoActivated(true);
    setShowUpgrade(false);
    setIsOpen(true);
  }, []);

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={handleChatClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[70] w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-teal-500/40 transition-shadow duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageCircle className="w-6 h-6" />
              {/* Notification dot */}
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-teal-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-[70] w-[380px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-140px)] rounded-2xl border border-border-subtle bg-bg-secondary shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle bg-bg-elevated flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-body-sm font-semibold text-text-primary truncate">
                  AI-ассистент CDSS
                </h4>
                <p className="text-caption text-text-muted truncate">
                  Острый живот — диагностика
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-caption text-amber-400 font-medium">Pro</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-2.5 ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      msg.role === 'user'
                        ? 'bg-bg-tertiary border border-border-subtle'
                        : 'bg-gradient-to-br from-teal-400 to-teal-600'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-text-secondary" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-body-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-teal-400/15 text-text-primary border border-teal-400/20'
                        : 'bg-bg-tertiary text-text-primary border border-border-subtle'
                    }`}
                    // Simple markdown-like rendering: bold text
                    dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-teal-400">$1</strong>')
                        .replace(/\n/g, '<br/>')
                        .replace(/\|(.+?)\|/g, '<span class="font-mono-data text-teal-300">|$1|</span>'),
                    }}
                  />
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-bg-tertiary border border-border-subtle rounded-xl px-4 py-3">
                    <Loader2 className="w-4 h-4 text-text-muted animate-spin" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-border-subtle p-3 bg-bg-elevated">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Спросите о биомаркерах..."
                  className="flex-1 h-10 px-4 rounded-lg bg-bg-primary border border-border-subtle text-body-sm text-text-primary placeholder:text-text-muted outline-none transition-all duration-150 focus:border-teal-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-lg bg-teal-400 text-text-inverse flex items-center justify-center hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-caption text-text-muted text-center mt-2">
                AI-ассистент работает на основе медицинских руководств
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(11, 15, 20, 0.8)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowUpgrade(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-bg-elevated/95 backdrop-blur-xl border border-border-subtle rounded-xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Pro Badge */}
              <div className="flex items-center justify-center mb-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-teal-400 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-text-inverse" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-heading text-heading-lg font-semibold text-text-primary text-center mb-2">
                AI-ассистент CDSS
              </h3>
              <p className="text-body-md text-text-secondary text-center mb-6">
                Интеллектуальный помощник по диагностике острого живота: биомаркеры, дифференциальная диагностика, шкалы оценки
              </p>

              {/* Features list */}
              <ul className="space-y-2.5 mb-6">
                {[
                  'Биомаркерный калькулятор с интерпретацией',
                  'AI-ассистент по острому животу 24/7',
                  'Расчёт интегрального индекса тяжести',
                  'Динамическое наблюдение и тренды',
                  'Полный доступ ко всем модулям',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-body-sm text-text-secondary">
                    <Lock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="text-center mb-5">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-heading text-display-lg font-bold text-amber-400">$4.99</span>
                  <span className="text-body-md text-text-muted">/месяц</span>
                </div>
                <p className="text-body-sm text-text-muted mt-1">
                  Отмена в любое время. Без скрытых платежей.
                </p>
              </div>

              {/* CTA Buttons */}
              <button
                onClick={goToCheckout}
                className="w-full h-14 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-text-inverse font-semibold text-heading-md hover:from-amber-300 hover:to-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Crown className="w-5 h-5" />
                Активировать Pro
              </button>

              {/* Demo Mode Button */}
              <button
                onClick={handleDemo}
                className="w-full mt-2 h-10 rounded-lg bg-bg-tertiary border border-dashed border-teal-400/40 text-teal-400 text-body-sm font-medium hover:bg-teal-400/10 hover:border-teal-400/60 transition-all duration-150 flex items-center justify-center gap-2"
              >
                <FlaskConical className="w-4 h-4" />
                Демо Pro (24 часа)
              </button>

              {/* Close */}
              <button
                onClick={() => setShowUpgrade(false)}
                className="w-full mt-2 h-10 text-body-sm text-text-muted hover:text-text-primary transition-colors duration-150"
              >
                Продолжить без Pro
              </button>

              {/* Note */}
              <p className="text-caption text-text-muted text-center mt-3">
                Оплата через Stripe — безопасно и мгновенно
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
