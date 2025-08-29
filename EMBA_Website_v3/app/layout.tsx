// app/layout.tsx
import './globals.css'
import HeaderClient from '@/components/HeaderClient'

export const metadata = { title: 'Amizade', description: 'Escola de Música' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-700 grid place-items-center text-white">♪</div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Escola de Música</p>
                <p className="font-semibold">Amizade</p>
              </div>
            </div>
            <HeaderClient />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
