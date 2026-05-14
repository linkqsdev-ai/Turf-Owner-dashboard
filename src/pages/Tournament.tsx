import { Trophy, Clock, Construction, ArrowRight } from 'lucide-react';

export default function Tournament() {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2.5">
          Tournament
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary/10 text-brand-primary uppercase tracking-wider">
            In Progress
          </span>
        </h1>
        <p className="text-text-secondary text-[13px]">Manage turf tournaments, teams, fixtures, and registrations.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 px-6 bg-bg-primary border border-border-light rounded-2xl shadow-premium relative overflow-hidden group">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-brand-primary/10 transition-colors duration-700" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/5 rounded-full -ml-32 -mb-32 blur-3xl group-hover:bg-brand-primary/10 transition-colors duration-700" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <div className="w-20 h-20 bg-bg-secondary rounded-2xl flex items-center justify-center mb-8 border border-border-light shadow-inner group-hover:scale-110 transition-transform duration-500">
            <Trophy className="w-10 h-10 text-brand-primary" />
          </div>
          
          <h2 className="text-2xl font-bold text-text-primary mb-4 tracking-tight">
            Tournament module is coming soon
          </h2>
          
          <p className="text-text-secondary text-[14px] leading-relaxed mb-10">
            We are building tools to create tournaments, manage teams, schedule matches, and track winners. Stay tuned for a comprehensive league management ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <button 
              disabled 
              className="flex-1 w-full px-6 py-3 bg-brand-primary/10 text-brand-primary rounded-xl font-bold text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
            >
              <Clock className="w-4 h-4" />
              Coming Soon
            </button>
            
            <button 
              disabled 
              className="flex-1 w-full px-6 py-3 border border-border-light text-text-muted rounded-xl font-bold text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
            >
              Learn More
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-12 flex items-center gap-2 px-4 py-2 bg-bg-secondary/50 rounded-full border border-border-light">
            <Construction className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Currently under heavy development</span>
          </div>
        </div>
      </div>
    </div>
  );
}
