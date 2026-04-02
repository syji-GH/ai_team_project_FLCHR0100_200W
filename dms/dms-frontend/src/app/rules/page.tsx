"use client";

import React from 'react';

const rules = [
  { id: '1', code: 'IT', pattern: 'ECOCO-IT-{YYYY}-{SEQ:4}', last: 'ECOCO-IT-2026-0034', reset: '每年重置' },
  { id: '2', code: 'HR', pattern: 'ECOCO-HR-{YYYY}-{SEQ:4}', last: 'ECOCO-HR-2026-0012', reset: '每年重置' },
  { id: '3', code: 'QA', pattern: 'ISO-{YYYY}-{MM}-{SEQ:3}', last: 'ISO-2026-04-001', reset: '每月重置' },
];

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">文件編號規則</h2>
          <p className="text-sm text-slate-500">定義全公司的文件流水號格式與自動產生邏輯。</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
          ＋ 新增規則
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-widest">{rule.code}</span>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">{rule.reset}</span>
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest label mb-1">編號 Pattern</p>
            <p className="text-sm font-mono text-slate-800 mb-6 bg-slate-50 p-2 rounded border border-dashed border-slate-200">{rule.pattern}</p>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest label mb-1">最新產生的編號</p>
            <p className="text-lg font-mono font-bold text-slate-900">{rule.last}</p>

            {/* Decorative Gradient Icon */}
            <div className="absolute -bottom-1 -right-1 text-slate-50/50 group-hover:text-emerald-500/10 text-6xl font-black italic transition-colors">
              {rule.code}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
