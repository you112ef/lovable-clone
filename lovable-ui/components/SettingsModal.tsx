"use client";

import { useEffect, useMemo, useState } from "react";

type ProviderId = "anthropic" | "openai" | "azure-openai" | "google" | "custom";

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
  models?: string[]; // options for model dropdown (or deployment for azure)
}

const PROVIDERS: ProviderDef[] = [
  {
    id: "anthropic",
    label: "Anthropic (Claude)",
    required: ["apiKey", "model"],
    models: [
      "claude-3-5-sonnet-latest",
      "claude-3-5-haiku-latest",
      "claude-3-opus-latest",
      "claude-3-haiku-20240307",
    ],
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "sk-ant-..." },
      // model will be rendered as dropdown; we still keep the key to store
      { key: "model", label: "Model", placeholder: "claude-3-5-sonnet-latest" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://api.anthropic.com" },
    ],
  },
  {
    id: "openai",
    label: "OpenAI",
    required: ["apiKey", "model"],
    models: ["gpt-4o", "gpt-4o-mini", "o3-mini", "o4-mini"],
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "sk-..." },
      { key: "model", label: "Model", placeholder: "gpt-4o" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://api.openai.com/v1" },
    ],
  },
  {
    id: "azure-openai",
    label: "Azure OpenAI",
    required: ["apiKey", "endpoint", "deployment", "apiVersion"],
    models: ["gpt-4o", "gpt-35-turbo", "gpt-4o-mini"],
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "endpoint", label: "Endpoint", placeholder: "https://YOUR-RESOURCE.openai.azure.com" },
      // deployment will be controlled by model dropdown
      { key: "deployment", label: "Deployment Name", placeholder: "gpt-4o" },
      { key: "apiVersion", label: "API Version", placeholder: "2024-06-01" },
    ],
  },
  {
    id: "google",
    label: "Google (Gemini)",
    required: ["apiKey", "model"],
    models: ["gemini-1.5-pro", "gemini-1.5-flash"],
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "model", label: "Model", placeholder: "gemini-1.5-pro" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://generativelanguage.googleapis.com" },
    ],
  },
  {
    id: "custom",
    label: "Custom",
    required: ["baseUrl"],
    // no predefined models; fallback to text input
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "model", label: "Model" },
      { key: "baseUrl", label: "Base URL", placeholder: "https://api.example.com/v1" },
    ],
  },
];

function ns(provider: ProviderId, key: string) {
  return `provider_${provider}_${key}`;
}

export default function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeProvider, setActiveProvider] = useState<ProviderId>("anthropic");
  const def = useMemo(() => PROVIDERS.find((p) => p.id === activeProvider)!, [activeProvider]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    try {
      const ap = localStorage.getItem("active_provider") as ProviderId | null;
      setActiveProvider(ap || "anthropic");
    } catch {}
  }, [open]);

  useEffect(() => {
    // Load stored values for the selected provider
    const next: Record<string, string> = {};
    def.fields.forEach((f) => {
      const v = typeof window !== "undefined" ? localStorage.getItem(ns(activeProvider, f.key)) : null;
      if (v) next[f.key] = v;
    });
    // Default model selection if not set and models list exists
    if (!next[activeProvider === "azure-openai" ? "deployment" : "model"] && def.models && def.models.length > 0) {
      const key = activeProvider === "azure-openai" ? "deployment" : "model";
      next[key] = def.models[0];
    }
    setValues(next);
    setErrors({});
  }, [def, activeProvider]);

  const validate = () => {
    const next: Record<string, string> = {};
    def.required.forEach((k) => {
      if (!values[k] || !String(values[k]).trim()) next[k] = "Required";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = () => {
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

  if (!open) return null;

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
          {/* Dropdown 1: Provider */}
          <label className="text-sm text-gray-300">Provider
            <select
              value={activeProvider}
              onChange={(e)=>setActiveProvider(e.target.value as ProviderId)}
              className="mt-1 w-full rounded-lg bg-black border border-gray-800 text-gray-200 px-3 py-2"
            >
              {PROVIDERS.map((p)=> (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>

          {/* Dropdown 2: Model (or deployment for Azure) */}
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
            // Fallback to text input if no predefined models (e.g., Custom)
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

          {/* Other fields except model/deployment */}
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