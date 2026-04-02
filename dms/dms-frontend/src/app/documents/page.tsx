"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Document {
  id: string;
  doc_number: string;
  title: string;
  category_code: string;
  status: string;
  created_at: string;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // 獲取後端資料
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await api.get('/documents/');
        setDocs(response.data);
      } catch (err: any) {
        console.error("無法取得文件清單:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleAddTestDoc = async () => {
    const newDoc = {
      title: `新文件 ${Date.now().toString().slice(-4)}`,
      category_code: "IT",
      dept_code: "IT",
      summary: "手動測試合規文件",
      confidentiality: "public"
    };

    try {
      const targetUrl = 'http://127.0.0.1:8000/api/v1/documents/';
      console.log("【發送連線測試】:", targetUrl, newDoc);
      
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newDoc),
        mode: 'cors'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`伺服器回應錯誤 (${response.status}): ${errorText}`);
      }
      
      const resData = await response.json();
      console.log("【成功產出編號】:", resData);
      setDocs([resData, ...docs]);
      alert(`成功！產出編號: ${resData.doc_number}`);
    } catch (err: any) {
      console.group("【DMS 診斷報告】");
      console.error("錯誤名稱:", err.name);
      console.error("錯誤訊息:", err.message);
      console.groupEnd();
      alert(`新增失敗！\n原因: ${err.message}\n請確認後端黑視窗 (--host 0.0.0.0) 是否啟動？`);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">文件資料庫</h2>
          <p className="text-sm text-slate-500">管理公司所有合規性文件與編號紀錄。</p>
        </div>
        <button 
          onClick={handleAddTestDoc}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
        >
          ＋ 快速建立新文件 (IT)
        </button>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase">
            <tr>
              <th className="px-6 py-4">文件編號</th>
              <th className="px-6 py-4">標題</th>
              <th className="px-6 py-4">類別</th>
              <th className="px-6 py-4">狀態</th>
              <th className="px-6 py-4">建立時間</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">連線資料庫中...</td>
              </tr>
            ) : docs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">尚無文件數據，請先點擊右上方按鈕新增。</td>
              </tr>
            ) : (
              docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-emerald-600 font-bold">{doc.doc_number}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{doc.title}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500">{doc.category_code}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{doc.status}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 tracking-tighter">
                    {new Date(doc.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
