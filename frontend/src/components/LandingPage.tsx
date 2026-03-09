import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Loader2, ArrowRight, Camera, Heart, Shield } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export const LandingPage = () => {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="h-dvh overflow-hidden bg-landing relative flex flex-col items-center justify-center px-6">
      {/* Decorative circle outlines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full border border-foreground/[0.06]" />
        <div className="absolute top-[12%] -left-32 w-72 h-72 rounded-full border border-foreground/[0.06]" />
        <div className="absolute -bottom-20 right-[18%] w-56 h-56 rounded-full border border-foreground/[0.06]" />
        <div className="absolute top-[8%] right-[12%] w-40 h-40 rounded-full border border-foreground/[0.06]" />
        <div className="absolute bottom-[20%] -right-20 w-[280px] h-[280px] rounded-full border border-foreground/[0.06]" />
        <div className="absolute -bottom-36 -left-20 w-80 h-80 rounded-full border border-foreground/[0.06]" />
        <div className="absolute top-[55%] left-[8%] w-36 h-36 rounded-full border border-foreground/[0.06]" />
        <div className="absolute top-[40%] right-[35%] w-24 h-24 rounded-full border border-foreground/[0.06]" />
      </div>

      {/* Top bar: logo + theme toggle */}
      <div className="fixed top-4 left-5 sm:top-6 sm:left-8 z-30 flex items-center gap-2.5 animate-fade-up">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm">
          <Shield className="w-[18px] h-[18px] text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground text-lg tracking-tight">
          Secure
        </span>
      </div>
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30">
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center max-w-5xl w-full">
        {/* Headline */}
        <h1 className="text-center animate-fade-up-delay-1 leading-[0.92] mb-10 sm:mb-14">
          <span className="block text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight">
            <span className="text-foreground">Every </span>
            <span className="text-primary">Precious</span>
          </span>
          <span className="block text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight">
            <span className="text-accent">Moment,</span>
          </span>
          <span className="block text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight">
            <span className="text-foreground">Privately Kept.</span>
          </span>
        </h1>

        {/* Bottom section: preview card + subtitle/CTA */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16 w-full max-w-3xl animate-fade-up-delay-2">
          {/* Preview card */}
          <div className="hidden sm:block shrink-0">
            <div className="bg-card rounded-xl shadow-lg p-5 w-64 border border-border/50">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Today
                </span>
                <span className="text-xs text-muted-foreground">Feb 14</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/15 rounded-lg flex items-center justify-center">
                    <Camera className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      3 photos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Park adventure
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-accent/15 rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Milestone
                    </p>
                    <p className="text-xs text-muted-foreground">
                      First steps!
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center mt-3.5 pt-3 border-t border-border/50">
                <div className="flex -space-x-1.5">
                  <div className="w-5 h-5 bg-primary rounded-full border-2 border-card" />
                  <div className="w-5 h-5 bg-accent rounded-full border-2 border-card" />
                  <div className="w-5 h-5 bg-chart-3 rounded-full border-2 border-card" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">
                  +3 family
                </span>
              </div>
            </div>
          </div>

          {/* Subtitle + CTA */}
          <div className="flex flex-col items-center lg:items-start lg:pt-2">
            <p className="text-muted-foreground text-base sm:text-lg text-center lg:text-left leading-relaxed max-w-sm">
              A private family journal for milestones, daily moments, and growth
              — shared only with the people you trust.
            </p>
            <div className="mt-6 sm:mt-8 animate-fade-up-delay-3">
              <button
                onClick={() => login()}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-2.5 h-12 px-7 bg-accent text-accent-foreground rounded-full font-semibold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in with Internet Identity
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-4 sm:bottom-6 text-center text-muted-foreground text-sm z-10">
        &copy; 2026. Built with &hearts; using{" "}
        <a
          href="https://caffeine.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
};
