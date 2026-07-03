import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  AlertCircle,
  Menu,
  X,
  Crown,
} from 'lucide-react';
import { useSubscription, isDemoActive } from '../hooks/useSubscription';

const navLinks = [
  {
    label: 'Модули',
    dropdown: [
      { label: 'Молекулярный патогенез', path: '/molecular' },
      { label: 'Биомаркерная навигация', path: '/biomarkers' },
      { label: 'Маски острого живота', path: '/diagnostics' },
      { label: 'Алгоритмы и чек-листы', path: '/algorithms' },
      { label: 'Тесты для самопроверки', path: '/tests' },
    ],
  },
  {
    label: 'Быстрый доступ',
    path: '/algorithms',
  },
  {
    label: 'Поиск',
    path: '/',
  },
];

const allRoutes = [
  { path: '/', label: 'Главная' },
  { path: '/molecular', label: 'Молекулярный патогенез' },
  { path: '/biomarkers', label: 'Биомаркерная навигация' },
  { path: '/diagnostics', label: 'Маски острого живота' },
  { path: '/algorithms', label: 'Алгоритмы и чек-листы' },
  { path: '/tests', label: 'Тесты для самопроверки' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modulesOpen, setModulesOpen] = useState(false);
  const location = useLocation();
  const { isPro, goToCheckout } = useSubscription();
  const demoActive = isDemoActive();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setModulesOpen(false);
  }, [location.pathname]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredRoutes = searchQuery
    ? allRoutes.filter((r) =>
        r.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allRoutes;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ease-smooth"
        style={{
          backgroundColor: scrolled ? 'rgba(11, 15, 20, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled
            ? '1px solid #25303D'
            : '1px solid transparent',
        }}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo" className="h-10 w-10" />
            <span className="font-heading text-lg font-semibold text-text-primary hidden sm:block">
              CDSS Острый Живот
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setModulesOpen(true)}
                  onMouseLeave={() => setModulesOpen(false)}
                >
                  <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-150">
                    {link.label}
                    <ChevronDown
                      className="h-4 w-4 transition-transform duration-200"
                      style={{
                        transform: modulesOpen ? 'rotate(180deg)' : 'rotate(0)',
                      }}
                    />
                  </button>
                  <AnimatePresence>
                    {modulesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{
                          duration: 0.2,
                          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                        }}
                        className="absolute top-full left-0 mt-1 w-64 rounded-lg border border-border-subtle bg-bg-elevated shadow-modal py-2"
                      >
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="block px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors duration-150"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.path || '/'}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-150"
                  onClick={() => {
                    if (link.label === 'Поиск') {
                      setSearchOpen(true);
                    }
                  }}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-full bg-bg-tertiary border border-border-subtle px-3 py-1.5 text-xs text-text-muted hover:border-teal-400 hover:text-text-secondary transition-all duration-150"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden md:inline">⌘K</span>
            </button>

            {/* Pro badge or Upgrade button */}
            {isPro ? (
              <div className={`hidden md:flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${demoActive ? 'bg-teal-400/10 border-teal-400/30 text-teal-400' : 'bg-amber-400/10 border-amber-400/30 text-amber-400'}`}>
                <Crown className="h-3.5 w-3.5" />
                {demoActive ? 'Pro Demo' : 'Pro'}
              </div>
            ) : (
              <button
                onClick={goToCheckout}
                className="hidden md:flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 border border-amber-400/50 px-3 py-1.5 text-xs font-semibold text-text-inverse hover:from-amber-300 hover:to-amber-400 hover:scale-[1.03] active:scale-[0.97] transition-all duration-150 shadow-sm"
              >
                <Crown className="h-3.5 w-3.5" />
                Pro — $4.99
              </button>
            )}

            {/* Emergency button - desktop */}
            <a
              href="tel:103"
              className="hidden md:flex items-center gap-1.5 rounded-full bg-alert-red/10 border border-alert-red/30 px-3 py-1.5 text-xs font-medium text-alert-red animate-pulse-badge hover:bg-alert-red/20 transition-colors duration-150"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              103
            </a>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="fixed top-16 left-0 right-0 z-40 border-b border-border-subtle bg-bg-secondary/95 backdrop-blur-lg lg:hidden"
          >
            <nav className="flex flex-col p-4 space-y-1">
              {allRoutes.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="px-4 py-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors duration-150"
                >
                  {route.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search modal overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4"
            style={{ backgroundColor: 'rgba(11, 15, 20, 0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="w-full max-w-xl rounded-xl border border-border-subtle bg-bg-elevated shadow-modal overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
                <Search className="h-5 w-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Поиск по биомаркерам, алгоритмам, синдромам..."
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-xs text-text-muted hover:text-text-secondary px-2 py-1 rounded border border-border-subtle"
                >
                  ESC
                </button>
              </div>
              <div className="max-h-[300px] overflow-y-auto py-2">
                {filteredRoutes.map((route) => (
                  <Link
                    key={route.path}
                    to={route.path}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors duration-150"
                  >
                    <Search className="h-3.5 w-3.5 text-text-muted" />
                    {route.label}
                  </Link>
                ))}
                {filteredRoutes.length === 0 && (
                  <div className="px-4 py-6 text-sm text-text-muted text-center">
                    Ничего не найдено
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
