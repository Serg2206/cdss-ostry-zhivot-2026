import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown } from 'lucide-react';
import { getCurrentVersion, setCurrentVersion, GUIDE_VERSIONS, VERSION_NOTES, type GuideVersion } from '../lib/versions';

export default function VersionSelector() {
  const [open, setOpen] = useState(false);
  const current = getCurrentVersion();

  const handleSelectVersion = (version: string) => {
    setCurrentVersion(version as any);
    setOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
      >
        <BookOpen className="h-4 w-4" />
        <span className="hidden sm:inline">Руководство</span>
        <span className="sm:hidden">РУК</span>
        <span className="text-teal-400 font-semibold">{current}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 z-50 bg-bg-secondary border border-border-subtle rounded-lg shadow-lg overflow-hidden min-w-[280px]"
            >
              <div className="p-3 border-b border-border-subtle">
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Выберите версию
                </div>
              </div>

              <div className="p-2 space-y-1">
                {GUIDE_VERSIONS.map((version: GuideVersion) => (
                  <button
                    key={version}
                    onClick={() => handleSelectVersion(version)}
                    className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
                      current === version
                        ? 'bg-teal-400/10 text-teal-400 font-semibold'
                        : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Руководство {version}</span>
                      {current === version && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-400">
                          активно
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-text-muted mt-1">
                      {VERSION_NOTES[version]}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
