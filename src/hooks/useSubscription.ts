import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cdss_pro_subscription';
const PAYMENT_SUCCESS_PARAM = 'payment_success';

// ═══════════════════════════════════════════════════
// Stripe Payment Link — ЗАМЕНИТЕ на свой из дашборда Stripe
// Инструкция:
// 1. Зарегистрируйтесь на https://dashboard.stripe.com (бесплатно)
// 2. Products → Add product → "CDSS Pro Subscription" → Price: $4.99/month
// 3. Скопируйте Payment Link URL и вставьте сюда
//
// Для тестирования без Stripe:
// - Нажмите кнопку "Demo Pro" в интерфейсе приложения
// - Или выполните в консоли браузера: activateDemoPro()
// ═══════════════════════════════════════════════════
export const STRIPE_PAYMENT_LINK =
  (import.meta.env.VITE_STRIPE_PAYMENT_LINK as string) ||
  'https://buy.stripe.com/test_YOUR_LINK_HERE';

// ═══════════════════════════════════════════════════
// DEMO MODE — для тестирования и презентаций
// ═══════════════════════════════════════════════════
const DEMO_STORAGE_KEY = 'cdss_pro_demo';

export function activateDemoPro(): boolean {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const demoState: SubscriptionState = {
    isPro: true,
    activatedAt: now.toISOString(),
    expiresAt: tomorrow.toISOString(),
  };
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoState));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoState));
  return true;
}

export function isDemoActive(): boolean {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return false;
    const demo = JSON.parse(raw) as SubscriptionState;
    if (!demo.expiresAt) return false;
    return new Date() < new Date(demo.expiresAt);
  } catch {
    return false;
  }
}

export function deactivateDemo(): void {
  localStorage.removeItem(DEMO_STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
}

export interface SubscriptionState {
  isPro: boolean;
  activatedAt: string | null;
  expiresAt: string | null;
}

function readStorage(): SubscriptionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SubscriptionState;
  } catch {
    return null;
  }
}

function writeStorage(state: SubscriptionState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function checkUrlPaymentSuccess(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get(PAYMENT_SUCCESS_PARAM) === '1';
}

function cleanUrlParams() {
  const url = new URL(window.location.href);
  url.searchParams.delete(PAYMENT_SUCCESS_PARAM);
  window.history.replaceState({}, '', url.toString());
}

/**
 * Hook для управления Pro-подпиской.
 *
 * - При mount проверяет localStorage
 * - Если в URL есть ?payment_success=1 — активирует Pro и чистит URL
 * - Возвращает isPro + функцию для перехода к оплате
 */
export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>(() => {
    const stored = readStorage();
    // Авто-активация если ?payment_success=1 в URL
    if (checkUrlPaymentSuccess()) {
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const activated: SubscriptionState = {
        isPro: true,
        activatedAt: now.toISOString(),
        expiresAt: nextMonth.toISOString(),
      };
      writeStorage(activated);
      cleanUrlParams();
      return activated;
    }
    // Проверяем не истёк ли срок
    if (stored?.isPro && stored?.expiresAt) {
      if (new Date() > new Date(stored.expiresAt)) {
        const expired: SubscriptionState = {
          isPro: false,
          activatedAt: stored.activatedAt,
          expiresAt: stored.expiresAt,
        };
        writeStorage(expired);
        return expired;
      }
    }
    return stored ?? { isPro: false, activatedAt: null, expiresAt: null };
  });

  // Также проверяем URL-параметры при фокусе окна
  // (на случай если пользователь вернулся с оплаты)
  useEffect(() => {
    const handleFocus = () => {
      if (checkUrlPaymentSuccess()) {
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const activated: SubscriptionState = {
          isPro: true,
          activatedAt: now.toISOString(),
          expiresAt: nextMonth.toISOString(),
        };
        writeStorage(activated);
        setState(activated);
        cleanUrlParams();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  /** Переход к Stripe Checkout */
  const goToCheckout = useCallback(() => {
    const returnUrl = new URL(window.location.href);
    returnUrl.searchParams.set(PAYMENT_SUCCESS_PARAM, '1');

    const checkoutUrl = new URL(STRIPE_PAYMENT_LINK);
    checkoutUrl.searchParams.set(
      'success_url',
      returnUrl.toString()
    );
    checkoutUrl.searchParams.set(
      'cancel_url',
      window.location.href
    );

    window.location.href = checkoutUrl.toString();
  }, []);

  /** Ручная активация (для демо/тестирования) */
  const activatePro = useCallback(() => {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const activated: SubscriptionState = {
      isPro: true,
      activatedAt: now.toISOString(),
      expiresAt: nextMonth.toISOString(),
    };
    writeStorage(activated);
    setState(activated);
  }, []);

  /** Отмена подписки */
  const cancelPro = useCallback(() => {
    const cancelled: SubscriptionState = {
      isPro: false,
      activatedAt: state.activatedAt,
      expiresAt: state.expiresAt,
    };
    writeStorage(cancelled);
    setState(cancelled);
  }, [state.activatedAt, state.expiresAt]);

  return {
    isPro: state.isPro,
    activatedAt: state.activatedAt,
    expiresAt: state.expiresAt,
    goToCheckout,
    activatePro,
    cancelPro,
  };
}
