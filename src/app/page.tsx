import Link from "next/link";
import { ArrowRight, Activity, Map, Cpu } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-grid-pattern overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-8 py-20 relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center">
        
        <div className="animate-fade-in-up space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border2 bg-surface2 mb-8">
            <span className="w-2 h-2 rounded-full bg-accentWarm animate-pulse"></span>
            <span className="text-xs font-mono text-text2 uppercase tracking-widest">Live Operations Center</span>
          </div>

          <h1 className="text-[64px] md:text-[88px] font-bold leading-tight tracking-tight">
            CaspianOS
          </h1>
          <h2 className="text-[32px] md:text-[48px] font-medium text-text2 italic leading-tight">
            Understand the corridor.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7CF8E5] to-[#C3FBFF] not-italic">
              Prevent the bottleneck.
            </span>
          </h2>
          
          <p className="text-text3 text-lg md:text-xl max-w-2xl mx-auto mt-6">
            Real-time cargo intelligence and AI decision support for the Trans-Caspian logistics corridor.
          </p>

          <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="btn text-base px-8 py-4">
              Open Operations Center <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/track/demo" className="btn text-base px-8 py-4 bg-transparent">
              Track Sample Cargo
            </Link>
          </div>
        </div>

        {/* Animated Flow */}
        <div className="w-full max-w-5xl mt-24 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between text-xs font-mono text-text4 relative">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] border-t border-dashed border-border1 -z-10"></div>
            {['Cargo', 'Port', 'Rail', 'Road', 'Border', 'Destination'].map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-3 bg-bg px-4">
                <div className="w-3 h-3 rounded-full border border-borderH1 bg-surface2"></div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Core Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-5xl text-left animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="card group">
            <div className="card__aura bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_50%)]"></div>
            <Activity className="w-8 h-8 text-accentWarm mb-6" />
            <h3 className="text-xl font-semibold text-text1 mb-2">LIVE CARGO TWIN</h3>
            <p className="text-text3 text-sm">Know where cargo is and what state it is in. Track condition, location, and chain of custody.</p>
          </div>
          
          <div className="card group">
            <div className="card__aura bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_50%)]"></div>
            <Map className="w-8 h-8 text-accentWarm mb-6" />
            <h3 className="text-xl font-semibold text-text1 mb-2">BOTTLENECK RADAR</h3>
            <p className="text-text3 text-sm">Predict where delays will emerge. Anticipate port congestion and border queues before they happen.</p>
          </div>

          <div className="card group">
            <div className="card__aura bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_50%)]"></div>
            <Cpu className="w-8 h-8 text-accentWarm mb-6" />
            <h3 className="text-xl font-semibold text-text1 mb-2">AI INTERVENTION</h3>
            <p className="text-text3 text-sm">Simulate and apply the action that prevents delays. Reallocate resources dynamically based on ML prediction.</p>
          </div>
        </div>

      </div>
    </main>
  );
}
