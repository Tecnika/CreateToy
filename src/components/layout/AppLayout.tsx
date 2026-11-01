import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PageLoader } from '../ui/PageLoader';
import { HolidayEffect } from '../theme/HolidayEffect';
import { Footer } from './Footer';
import { Header } from './Header';

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <HolidayEffect />
      <Header />
      <main className="relative z-10">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
