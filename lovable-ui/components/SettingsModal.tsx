"use client";

import { useEffect, useMemo, useState } from "react";

type ProviderId = string;

interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "password";
}

interface ProviderDef {
  id: ProviderId;
  label: string;
  fields: FieldDef[];
  required: string[];
  models?: string[];
}

function ns(provider: ProviderId, key: string) {
  return `provider_${provider}_${key}`;
}

export default function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [catalog, setCatalog] = useState<ProviderDef[]>([]);
  const [activeProvider, setActiveProvider] = useState<ProviderId>("");
  const def = useMemo(() => catalog.find((p) => p.id === activeProvider) as ProviderDef | undefined, [catalog, activeProvider]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await fetch("/providers.json", { cache: "no-cache" });
        const data = await res.json();
        const list = (data.providers || []) as ProviderDef[];
        setCatalog(list);
        const ap = (localStorage.getItem("active_provider") as ProviderId) || list[0]?.id || "";
        setActiveProvider(ap);
      } catch {}
    })();
  }, [open]);

  useEffect(() => {
    if (!def) return;
    const next: Record<string, string> = {};
    def.fields.forEach((f) => {
      const v = typeof window !== "undefined" ? localStorage.getItem(ns(activeProvider, f.key)) : null;
      if (v) next[f.key] = v;
    });
    const modelKey = activeProvider === "azure-openai" ? "deployment" : "model";
    if (!next[modelKey] && def.models && def.models.length > 0) {
      next[modelKey] = def.models[0];
    }
    setValues(next);
    setErrors({});
  }, [def, activeProvider]);

  const validate = () => {
    if (!def) return false;
    const next: Record<string, string> = {};
    def.required.forEach((k) => {
      if (!values[k] || !String(values[k]).trim()) next[k] = "Required";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = () => {
    if (!def) return;
    if (!validate()) return;
    try {
      localStorage.setItem("active_provider", activeProvider);
      def.fields.forEach((f) => {
        localStorage.setItem(ns(activeProvider, f.key), values[f.key] || "");
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    } catch {}
  };

  if (!open || !def) return null;

  const modelKey = activeProvider === "azure-openai" ? "deployment" : "model";
  const modelError = !!errors[modelKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0b0b0b] border border-gray-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-800">
          <h2 className="text-white text-lg sm:text-xl font-semibold">Model Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 gap-4">
          <label className="text-sm text-gray-300">Provider
            <select
              value={activeProvider}
              onChange={(e)=>setActiveProvider(e.target.value as ProviderId)}
              className="mt-1 w-full rounded-lg bg-black border border-gray-800 text-gray-200 px-3 py-2"
            >
              {catalog.map((p)=> (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>

          {def.models && def.models.length > 0 ? (
            <label className="text-sm text-gray-300">{activeProvider === "azure-openai" ? "Deployment" : "Model"}
              <select
                value={values[modelKey] || def.models[0]}
                onChange={(e)=> setValues((s)=> ({...s, [modelKey]: e.target.value}))}
                className={`mt-1 w-full rounded-lg bg:black border ${modelError ? 'border-red-600' : 'border-gray-800'} text-gray-200 px-3 py-2`}
              >
                {def.models.map((m)=>(
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {modelError && <div className="text-xs text-red-400 mt-1">Required</div>}
            </label>
          ) : (
            <label className="text-sm text-gray-300">Model
              <input
                value={values.model || ""}
                onChange={(e)=>setValues((s)=>({...s, model: e.target.value}))}
                placeholder="model"
                className={`mt-1 w-full rounded-lg bg-black border ${modelError? 'border-red-600' : 'border-gray-800'} text-gray-200 px-3 py-2`}
              />
              {modelError && <div className="text-xs text-red-400 mt-1">Required</div>}
            </label>
          )}

          {def.fields.filter((f)=> f.key !== "model" && f.key !== "deployment").map((f)=>{
            const hasError = !!errors[f.key];
            return (
              <label key={f.key} className="text-sm text-gray-300">
                {f.label}
                <input
                  value={values[f.key] || ""}
                  onChange={(e)=>setValues((s)=>({...s, [f.key]: e.target.value}))}
                  placeholder={f.placeholder}
                  type={f.type === "password" ? "password" : "text"}
                  className={`mt-1 w-full rounded-lg bg-black border ${hasError? 'border-red-600' : 'border-gray-800'} text-gray-200 px-3 py-2`}
                />
                {hasError && <div className="text-xs text-red-400 mt-1">{errors[f.key]}</div>}
              </label>
            );
          })}

          <p className="text-xs text-gray-500">Only essential fields. Values are stored locally in your browser.</p>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-800">
          <div className="text-xs text-gray-500">Minimal • Exact • Responsive</div>
          <div className="flex items-center gap-2">
            {saved && <div className="text-green-400 text-sm">Saved</div>}
            <button onClick={save} className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-100">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}