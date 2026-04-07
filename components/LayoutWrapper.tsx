'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Custom logic for Header and Footer visibility
  const noHeaderPaths = ['/login', '/billing', '/privacidad', '/terminos', '/planes', '/servicios'];
  const noFooterPaths = ['/login', '/billing', '/privacidad', '/terminos'];

  const showHeader = !noHeaderPaths.includes(pathname);
  const showFooter = !noFooterPaths.includes(pathname);

  return (
    <div className="min-h-screen bg-black font-sans text-gray-200 flex flex-col">
      {showHeader && <Header />}
      <main className="grow">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
