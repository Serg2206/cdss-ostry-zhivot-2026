import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from './ChatWidget';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      {/* AI Assistant — internal Pro gating */}
      <ChatWidget />
    </div>
  );
}
