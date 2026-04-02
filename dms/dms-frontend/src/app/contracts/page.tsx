"use client";

import React, { useState } from 'react';

const mockContracts = [
  { id: '1', num: 'CON-2026-0301', part: '台電綠能', amt: 'NT$ 450,000', end: '2026-12-31', status: '執行中' },
  { id: '2', num: 'CON-2026-0412', part: '微軟 Azure', amt: 'NT$ 1,200,000', end: '2027-04-12', status: '執行中' },
  { id: '3', num: 'CON-2026-0504', part: '勞務委外契約', amt: 'NT$ 80,000', end: '2026-05-04', status: '即將到期' },
];

export default function ContractsPage() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">合約管理平台</h2>
          <p className="text-sm text-slate-500">追蹤所有商業契約的到期日與執行金額。</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-100">
          ＋ 登記新合約
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-blue-50 border-l-4 border-l-blue-500 shadow-sm">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">年度合約總額</p>
          <p className="text-2xl font-bold text-slate-800">NT$ 2.85M</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-orange-50 border-l-4 border-l-orange-500 shadow-sm">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">即將到期 (30天)</p>
          <p className="text-2xl font-bold text-slate-800">2 <span className="text-sm font-normal text-slate-400">件</span></p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <table className="w-full text-left font-sans">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">合約編號</th>
              <th className="px-6 py-4">簽約對方</th>
              <th className="px-6 py-4">合約金額</th>
              <th className="px-6 py-4">到期日</th>
              <th className="px-6 py-4">狀態</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockContracts.map((con) => (
              <tr key={con.id} className="hover:bg-blue-50/20 transition-colors group">
                <td className="px-6 py-5 font-mono text-xs text-slate-500">{con.num}</td>
                <td className="px-6 py-5 font-bold text-slate-900 group-hover:text-blue-600">{con.part}</td>
                <td className="px-6 py-5 text-sm font-semibold">{con.amt}</td>
                <td className="px-6 py-5 text-xs text-slate-500">{con.end}</td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                    con.status === '執行中' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                  }`}>{con.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
