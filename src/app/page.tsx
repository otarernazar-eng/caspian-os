import Link from "next/link";
import { ArrowRight, Map, Cpu, Truck, LayoutDashboard } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-grid-pattern overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-8 py-20 relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center">
        
        <div className="animate-fade-in-up space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border2 bg-surface2 mb-8">
            <span className="w-2 h-2 rounded-full bg-accentWarm animate-pulse"></span>
            <span className="text-xs font-mono text-text2 uppercase tracking-widest">Mangistau Regional Logistics MVP</span>
          </div>

          <h1 className="text-[64px] md:text-[88px] font-bold leading-tight tracking-tight">
            Мангистау Биржа
          </h1>
          <h2 className="text-[32px] md:text-[48px] font-medium text-text2 italic leading-tight">
            Оптимизация логистики<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7CF8E5] to-[#C3FBFF] not-italic">
              последнего километра.
            </span>
          </h2>
          
          <p className="text-text3 text-lg md:text-xl max-w-2xl mx-auto mt-6">
            Платформа для внутрирегиональных грузоперевозок: отслеживание автопарка в реальном времени, биржа перевозчиков и маршрутизация до отдалённых посёлков.
          </p>

          <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="btn text-base px-8 py-4">
              Войти в Систему <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/register" className="btn text-base px-8 py-4 bg-transparent">
              Регистрация
            </Link>
          </div>
        </div>

        {/* Core Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-5xl text-left animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="card group">
            <div className="card__aura bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_50%)]"></div>
            <Truck className="w-8 h-8 text-accentWarm mb-6" />
            <h3 className="text-xl font-semibold text-text1 mb-2">БИРЖА ПЕРЕВОЗОК</h3>
            <p className="text-text3 text-sm">Грузоотправители размещают заявки, перевозчики берут заказы. Без звонков и простоев.</p>
          </div>
          
          <div className="card group">
            <div className="card__aura bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_50%)]"></div>
            <Map className="w-8 h-8 text-accentWarm mb-6" />
            <h3 className="text-xl font-semibold text-text1 mb-2">GPS-ОТСЛЕЖИВАНИЕ</h3>
            <p className="text-text3 text-sm">Мониторинг статуса доставки и местоположения грузов в реальном времени на карте.</p>
          </div>

          <div className="card group">
            <div className="card__aura bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_50%)]"></div>
            <LayoutDashboard className="w-8 h-8 text-accentWarm mb-6" />
            <h3 className="text-xl font-semibold text-text1 mb-2">АНАЛИТИКА ДЛЯ АКИМАТА</h3>
            <p className="text-text3 text-sm">Дашборд грузопотоков для планирования дорог и субсидирования отдалённых посёлков.</p>
          </div>
        </div>

      </div>
    </main>
  );
}
