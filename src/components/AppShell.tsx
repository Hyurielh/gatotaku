import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { Footer } from './Footer';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#d6f5ec]">
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="96" cy="120" r="190" fill="#0f9f8f" fillOpacity="0.08" />
        <circle cx="1320" cy="90" r="260" fill="#0f9f8f" fillOpacity="0.07" />
        <circle cx="1180" cy="760" r="210" fill="#0f9f8f" fillOpacity="0.08" />
        <circle cx="180" cy="780" r="150" fill="#0f9f8f" fillOpacity="0.06" />
        <circle cx="720" cy="-80" r="120" fill="#ffffff" fillOpacity="0.45" />
        <path d="M0 470C220 430 310 530 520 490C730 450 790 330 1010 385C1210 435 1330 315 1440 345V900H0Z" fill="#ffffff" fillOpacity="0.18" />
      </svg>

      <div className="relative z-10 flex min-h-screen p-2 sm:p-4 lg:p-6">
        <div className="mx-auto flex min-h-[calc(100vh-1rem)] w-full max-w-[1520px] overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_24px_70px_rgba(15,159,143,0.18)] sm:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)]">
          <AppSidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />

          <div className="flex min-w-0 flex-1 flex-col">
            <AppHeader onMenuToggle={() => setIsMobileMenuOpen((current) => !current)} />
            <main id="main-content" className="flex-1 bg-white px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
