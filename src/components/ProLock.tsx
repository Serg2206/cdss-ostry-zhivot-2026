import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, Sparkles, FlaskConical } from 'lucide-react';
import { useSubscription, activateDemoPro, isDemoActive } from '../hooks/useSubscription';
import type { ReactNode } from 'react';

interface ProLockProps {
  children: ReactNode;
  featureName?: string;
  description?: string;
}

/**
 * ProLock — обёртка для Pro-функций.
 *
 * Если пользователь не имеет Pro-подписки, показывает
 * красивый оверлей с CTA для апгрейда.
 * Если Pro активен — рендерит children.
 */
export default function ProLock({
  children,
  featureName = 'Pro-функция',
  description = 'Получите полный доступ ко всем возможностям CDSS Pro',
}: ProLockProps) {
  const { isPro, goToCheckout } = useSubscription();
  const [demoActivated, setDemoActivated] = useState(isDemoActive());

  const handleDemo = () => {
    activateDemoPro();
    setDemoActivated(true);
    window.location.reload();
  };

  // ✅ Pro или Demo активен — показываем контент
  if (isPro || demoActivated) {
    return <>{children}</>;
  }

  // 🔒 Бесплатный пользователь — показываем блокировку
  return (
    <div className="relative">
      {/* Размытое содержимое позади */}
      <div className="blur-[6px] opacity-30 pointer-events-none select-none max-h-[500px] overflow-hidden">
        {children}
      </div>

      {/* Оверлей CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-10 flex items-center justify-center"
      >
        <div className="bg-bg-elevated/95 backdrop-blur-xl border border-border-subtle rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
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
            {featureName}
          </h3>
          <p className="text-body-md text-text-secondary text-center mb-6">
            {description}
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

          {/* Note */}
          <p className="text-caption text-text-muted text-center mt-3">
            Оплата через Stripe — безопасно и мгновенно
          </p>
        </div>
      </motion.div>
    </div>
  );
}
