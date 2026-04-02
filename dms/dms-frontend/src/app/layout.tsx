import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DMS | 文管平台雛型",
  description: "ECOCO 文件管理與合約監控平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
            <h1 className="text-2xl font-bold mb-10 text-emerald-400">DMS 200W</h1>
            <nav className="space-y-4">
              <a href="/" className="block p-2 hover:bg-slate-800 rounded">📊 總覽儀表板</a>
              <a href="/documents" className="block p-2 hover:bg-slate-800 rounded">📄 文件資料庫</a>
              <a href="/contracts" className="block p-2 hover:bg-slate-800 rounded">📜 合約管理</a>
              <a href="/rules" className="block p-2 hover:bg-slate-800 rounded">⚙️ 編號規則</a>
            </nav>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
