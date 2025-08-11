"use client";

import { useEffect, useState } from "react";

type Provider = "Anthropic" | "OpenAI" | "Google" | "Custom";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [provider, setProvider] = useState<Provider>("Anthropic");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [generateApiUrl, setGenerateApiUrl] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    try {
      const p = localStorage.getItem("ai_provider");
      const k = localStorage.getItem("ai_api_key");
      const b = localStorage.getItem("ai_base_url");
      const m = localStorage.getItem("ai_model");
      const g = localStorage.getItem("generate_api_url");
      if (p) setProvider(p as Provider);
      if (k) setApiKey(k);
      if (b) setBaseUrl(b);
      if (m) setModel(m);
      if (g) setGenerateApiUrl(g);
    } catch {}
  }, [open]);

  const save = () => {
    try {
      localStorage.setItem("ai_provider", provider);
      localStorage.setItem("ai_api_key", apiKey);
      localStorage.setItem("ai_base_url", baseUrl);
      localStorage.setItem("ai_model", model);
      localStorage.setItem("generate_api_url", generateApiUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {}
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0b0b0b] border border-gray-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-800">
          <h2 className="text-white text-lg sm:text-xl font-semibold">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 gap-6">
          <section className="space-y-3">
            <h3 className="text-white font-medium">AI Provider</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm text-gray-300">Provider
                <select value={provider} onChange={(e)=>setProvider(e.target.value as Provider)} className="mt-1 w-full rounded-lg bg-black border border-gray-800 text-gray-200 px-3 py-2">
                  <option>Anthropic</option>
                  <option>OpenAI</option>
                  <option>Google</option>
                  <option>Custom</option>
                </select>
              </label>
              <label className="text-sm text-gray-300">Model
                <input value={model} onChange={(e)=>setModel(e.target.value)} placeholder={provider === 'Anthropic' ? 'claude-3-5-sonnet' : provider === 'OpenAI' ? 'gpt-4o' : ''} className="mt-1 w-full rounded-lg bg-black border border-gray-800 text-gray-200 px-3 py-2" />
              </label>
              <label className="text-sm text-gray-300">API Key
                <input value={apiKey} onChange={(e)=>setApiKey(e.target.value)} type="password" placeholder="sk-..." className="mt-1 w-full rounded-lg bg-black border border-gray-800 text-gray-200 px-3 py-2" />
              </label>
              <label className="text-sm text-gray-300">Base URL (optional)
                <input value={baseUrl} onChange={(e)=>setBaseUrl(e.target.value)} placeholder={provider==='OpenAI' ? 'https://api.openai.com/v1' : ''} className="mt-1 w-full rounded-lg bg-black border border-gray-800 text-gray-200 px-3 py-2" />
              </label>
            </div>
            <p className="text-xs text-gray-500">Values are stored locally only (browser). For server-side usage, configure environment variables on your API host.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-white font-medium">Generation API</h3>
            <label className="text-sm text-gray-300 block">External API URL
              <input value={generateApiUrl} onChange={(e)=>setGenerateApiUrl(e.target.value)} placeholder="https://your-api.example.com/api/generate-daytona" className="mt-1 w-full rounded-lg bg-black border border-gray-800 text-gray-200 px-3 py-2" />
            </label>
            <p className="text-xs text-gray-500">If set, the app will call this URL instead of the built-in Pages API (disabled on Cloudflare Pages).</p>
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-800">
          <div className="text-xs text-gray-500">Responsive • Mobile-friendly • Saves locally</div>
          <div className="flex items-center gap-2">
            {saved && <div className="text-green-400 text-sm">Saved</div>}
            <button onClick={save} className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-100">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}