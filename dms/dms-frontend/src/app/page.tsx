import React from 'react';

// 模擬數據 (實際應從 API 讀取)
const stats = [
  { label: '儲存文件', value: '1,284', change: '+12', color: 'emerald' },
  { label: '生效合約', value: '89', change: '-2', color: 'blue' },
  { label: '待簽核', value: '7', change: '+3', color: 'orange' },
  { label: '年度 ROI (節省)', value: 'NT$ 1.2M', change: '預估', color: 'amber' },
];

const recentDocs = [
  { id: '1', number: 'IT-2026-0302', title: '2026年度硬體預算草案', dept: 'IT', status: '有效', date: '2026-03-30' },
  { id: '2', number: 'HR-2026-0411', title: '三月份教育訓練清單', dept: 'HR', status: '存檔', date: '2026-04-01' },
  { id: '3', number: 'QA-2026-0001', title: 'ISO 27001 程序書 V2', dept: 'QA', status: '修訂中', date: '2026-04-02' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">總覽儀表板</h2>
          <p className="text-slate-500 mt-1">追蹤 ECOCO 文管狀況與合約週期。</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-emerald-200 transition-all active:scale-95">
          ＋ 新增文件
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-slate-500 mb-1">{s.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{s.value}</span>
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                s.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                s.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                'bg-slate-50 text-slate-500'
              }`}>
                {s.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Recent Content + Notifications */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Documents Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">最近上傳</h3>
            <a href="/documents" className="text-sm text-emerald-600 hover:underline">查看全部</a>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">文件編號</th>
                <th className="px-6 py-4">標題</th>
                <th className="px-6 py-4">部門</th>
                <th className="px-6 py-4">狀態</th>
                <th className="px-6 py-4 text-right">上傳日期</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">{doc.number}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{doc.title}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase">{doc.dept}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                      doc.status === '有效' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-400 font-mono">{doc.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expiry Alerts & Reminders */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              通知中心 <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-bounce">2</span>
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-orange-400/20 text-orange-400 flex items-center justify-center shrink-0">
                  ⚠️
                </div>
                <div>
                  <p className="text-sm font-semibold">合約即將到期</p>
                  <p className="text-xs text-slate-400 mt-1">「台電綠電採購專案」將於 15 天內到期。</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0">
                  ✅
                </div>
                <div>
                  <p className="text-sm font-semibold">備份完成</p>
                  <p className="text-xs text-slate-400 mt-1">昨日系統資料已成功備份至雲端（S3）。</p>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative Background Element */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
        </div>
      </section>
    </div>
  );
}
