
import './globals.css';
import HeaderClient from '../components/HeaderClient';

export const metadata = {
  title: 'Escola de Música Amizade',
  description: 'Portal Escola de Música',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>
        <header className="sticky top-0 z-10 bg-white/90 border-b">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl grid place-items-center text-white text-xl" style={{background:'var(--brand-primary)'}}>♪</div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Escola de Música</div>
                <div className="text-lg font-semibold">Amizade</div>
              </div>
            </div>
            <HeaderClient />
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
