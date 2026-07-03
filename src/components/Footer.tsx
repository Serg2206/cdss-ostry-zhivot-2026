import { Activity, Heart } from 'lucide-react'
import { Link } from 'react-router'

const footerLinks = {
  Продукт: ['Алгоритмы', 'Биомаркеры', 'AI-ассистент', 'PWA'],
  Тарифы: ['Free', 'Pro', 'Enterprise', 'ROI-калькулятор'],
  Ресурсы: ['Документация', 'API', 'Блог', 'Обновления'],
  Компания: ['О нас', 'Контакты', 'Вакансии', 'Партнеры'],
}

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#0A0E14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-base font-bold text-white">
                CDSS <span className="text-teal-400">ОЖ 2026</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Клиническая система поддержки принятия решений при остром животе
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-slate-500">
              &copy; 2026 CDSS Острый Живот. Все права защищены.
            </p>
            <p className="text-xs text-slate-600">
              Автор: проф. Сушков С.В., д.м.н. |{' '}
              <a href="https://ssvnauka.com" className="hover:text-teal-400 transition-colors">
                Медицинский центр «МАРИЯ», Харьков
              </a>{' '}
              | ssvnauka.com
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              Сделано с <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> для хирургов
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
