import Link from "next/link";
import { ArrowRight, Map, Cpu, Truck, LayoutDashboard, Scan } from "lucide-react";
import CaspianEcoWidget from "@/components/CaspianEcoWidget";
import CaspianSmartDispatch from "@/components/CaspianSmartDispatch";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-grid-pattern overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-8 py-20 relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center">
        
        <div className="animate-fade-in-up space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border2 bg-surface2 mb-8">
            <span className="w-2 h-2 rounded-full bg-accentWarm animate-pulse"></span>
            <span className="text-xs font-mono text-text2 uppercase tracking-widest">Mangistau Regional Logistics MVP</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-text1 leading-tight mb-6">
            Caspian OS
          </h1>
          <h2 className="text-[32px] md:text-[48px] font-medium text-text2 italic leading-tight">
            Интеллектуальная логистика<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7CF8E5] to-[#C3FBFF] not-italic">
              обратных рейсов.
            </span>
          </h2>
          
          <p className="text-text3 text-lg md:text-xl max-w-2xl mx-auto mt-6">
            Платформа для внутрирегиональных грузоперевозок. Мы не ищем перевозчика — мы монетизируем обратный путь и спасаем километры пустого пробега.
          </p>

          <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex gap-4">
              <Link href="/login" className="btn bg-accentWarm text-bg font-bold px-8 py-3 hover:bg-[#d49938] hover:-translate-y-1 transition-all">
                Launch Platform
              </Link>
            </div>
          </div>
        </div>

        {/* Caspian Intelligence Showcase */}
        <div className="w-full max-w-5xl mt-32 grid grid-cols-1 lg:grid-cols-2 gap-8 text-left animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CaspianSmartDispatch />
          <CaspianEcoWidget />
        </div>

        {/* Core Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl text-left animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="card group">
            <div className="card__aura bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_50%)]"></div>
            <Truck className="w-8 h-8 text-accentWarm mb-6" />
            <h3 className="text-xl font-semibold text-text1 mb-2">МАТЧИНГ ПО КОРИДОРАМ</h3>
            <p className="text-text3 text-sm">Грузы ищутся не "от точки к точке", а вдоль коридора возвращения перевозчика.</p>
          </div>
          
          <div className="card group">
            <div className="card__aura bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_50%)]"></div>
            <Map className="w-8 h-8 text-accentWarm mb-6" />
            <h3 className="text-xl font-semibold text-text1 mb-2">РЕАЛЬНАЯ ТОПОЛОГИЯ</h3>
            <p className="text-text3 text-sm">Матрица на 2080 дорожных расстояний из OSRM для точного расчета экономики.</p>
          </div>

          <div className="card group">
            <div className="card__aura bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_50%)]"></div>
            <LayoutDashboard className="w-8 h-8 text-accentWarm mb-6" />
            <h3 className="text-xl font-semibold text-text1 mb-2">АНАЛИТИКА ДЛЯ АКИМАТА</h3>
            <p className="text-text3 text-sm">Дашборд сэкономленного топлива и грузопотоков для прозрачности перед государством.</p>
          </div>
        </div>

      </div>
    </main>
  );
}
