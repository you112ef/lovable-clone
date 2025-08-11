"use client";

import { useEffect, useMemo, useState } from "react";

type ProviderId =
  | "anthropic"
  | "openai"
  | "azure-openai"
  | "google"
  | "mistral"
  | "cohere"
  | "groq"
  | "perplexity"
  | "openrouter"
  | "together"
  | "fireworks"
  | "deepseek"
  | "xai"
  | "bedrock"
  | "huggingface"
  | "stability"
  | "replicate"
  | "custom";

interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "password" | "textarea";
  helperText?: string;
}

interface ProviderDef {
  id: ProviderId;
  label: string;
  fields: FieldDef[];
}

const PROVIDERS: ProviderDef[] = [
  {
    id: "anthropic",
    label: "Anthropic (Claude)",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "sk-ant-..." },
      { key: "model", label: "Model", placeholder: "claude-3-5-sonnet-latest" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://api.anthropic.com" },
    ],
  },
  {
    id: "openai",
    label: "OpenAI",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "sk-..." },
      { key: "model", label: "Model", placeholder: "gpt-4o" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://api.openai.com/v1" },
      { key: "organization", label: "Organization (optional)" },
      { key: "project", label: "Project (optional)" },
    ],
  },
  {
    id: "azure-openai",
    label: "Azure OpenAI",
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "endpoint", label: "Endpoint", placeholder: "https://YOUR-RESOURCE.openai.azure.com" },
      { key: "deployment", label: "Deployment Name", placeholder: "gpt-4o" },
      { key: "apiVersion", label: "API Version", placeholder: "2024-06-01" },
    ],
  },
  {
    id: "google",
    label: "Google (Gemini)",
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "model", label: "Model", placeholder: "gemini-1.5-pro" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://generativelanguage.googleapis.com" },
    ],
  },
  {
    id: "mistral",
    label: "Mistral AI",
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "model", label: "Model", placeholder: "mistral-large-latest" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://api.mistral.ai/v1" },
    ],
  },
  {
    id: "cohere",
    label: "Cohere",
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "model", label: "Model", placeholder: "command-r-plus" },
      { key: "baseUrl", label: "Base URL (optional)" },
    ],
  },
  {
    id: "groq",
    label: "Groq",
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "model", label: "Model", placeholder: "llama-3.1-70b-versatile" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://api.groq.com/openai/v1" },
    ],
  },
  {
    id: "perplexity",
    label: "Perplexity",
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "model", label: "Model", placeholder: "llama-3.1-sonar-large" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://api.perplexity.ai" },
    ],
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "model", label: "Model", placeholder: "openrouter/anthropic/claude-3.5-sonnet" },
      { key: "baseUrl", label: "Base URL", placeholder: "https://openrouter.ai/api/v1" },
      { key: "siteUrl", label: "Site URL (optional)", placeholder: "https://yourdomain.com" },
      { key: "referer", label: "Referer (optional)", placeholder: "https://yourdomain.com" },
    ],
  },
  {
    id: "together",
    label: "Together AI",
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "model", label: "Model", placeholder: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://api.together.xyz/v1" },
    ],
  },
  {
    id: "fireworks",
    label: "Fireworks AI",
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "model", label: "Model", placeholder: "accounts/fireworks/models/llama-v3p1-70b-instruct" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://api.fireworks.ai/inference/v1" },
    ],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "model", label: "Model", placeholder: "deepseek-chat" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://api.deepseek.com" },
    ],
  },
  {
    id: "xai",
    label: "xAI (Grok)",
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "model", label: "Model", placeholder: "grok-2-1212" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://api.x.ai/v1" },
    ],
  },
  {
    id: "bedrock",
    label: "AWS Bedrock",
    fields: [
      { key: "accessKeyId", label: "AWS Access Key ID" },
      { key: "secretAccessKey", label: "AWS Secret Access Key", type: "password" },
      { key: "region", label: "Region", placeholder: "us-east-1" },
      { key: "model", label: "Model", placeholder: "anthropic.claude-3-5-sonnet-20240620-v1:0" },
    ],
  },
  {
    id: "huggingface",
    label: "Hugging Face Inference",
    fields: [
      { key: "apiKey", label: "API Token", type: "password" },
      { key: "repoId", label: "Model Repo (repoId)", placeholder: "meta-llama/Meta-Llama-3.1-8B-Instruct" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://api-inference.huggingface.co" },
    ],
  },
  {
    id: "stability",
    label: "Stability AI (Images)",
    fields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "engine", label: "Engine/Model", placeholder: "stable-diffusion-xl-1024-v1-0" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://api.stability.ai" },
    ],
  },
  {
    id: "replicate",
    label: "Replicate",
    fields: [
      { key: "apiKey", label: "API Token", type: "password" },
      { key: "model", label: "Model", placeholder: "replicate/llama-3.1-70b-instruct" },
      { key: "baseUrl", label: "Base URL (optional)", placeholder: "https://api.replicate.com/v1" },
    ],
  },
  {
    id: "custom",
    label: "Custom Provider",
    fields: [
      { key: "label", label: "Name", placeholder: "My Provider" },
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "baseUrl", label: "Base URL", placeholder: "https://api.example.com/v1" },
      { key: "model", label: "Model" },
      { key: "extraHeaders", label: "Extra Headers (JSON)", type: "textarea", helperText: "ex: {\"X-Custom\": \"value\"}" },
    ],
  },
];

function ns(provider: ProviderId, key: string) {
  return `provider_${provider}_${key}`;
}

function getInitial(provider: ProviderId) {
  const def = PROVIDERS.find((p) => p.id === provider)!;
  const values: Record<string, string> = {};
  def.fields.forEach((f) => {
    const v = typeof window !== "undefined" ? localStorage.getItem(ns(provider, f.key)) : null;
    if (v) values[f.key] = v;
  });
  return values;
}

export default function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeProvider, setActiveProvider] = useState<ProviderId>("anthropic");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [generateApiUrl, setGenerateApiUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const def = useMemo(() => PROVIDERS.find((p) => p.id === activeProvider)!, [activeProvider]);

  useEffect(() => {
    if (!open) return;
    try {
      const ap = localStorage.getItem("active_provider") as ProviderId | null;
      setActiveProvider(ap || "anthropic");
      const g = localStorage.getItem("generate_api_url");
      if (g) setGenerateApiUrl(g);
    } catch {}
  }, [open]);

  useEffect(() => {
    setFormValues(getInitial(activeProvider));
  }, [activeProvider]);

  const save = () => {
    try {
      localStorage.setItem("active_provider", activeProvider);
      localStorage.setItem("generate_api_url", generateApiUrl);
      def.fields.forEach((f) => {
        const v = formValues[f.key] || "";
        localStorage.setItem(ns(activeProvider, f.key), v);
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {}
  };

  const exportConfig = () => {
    const data: any = { active_provider: activeProvider, generate_api_url: generateApiUrl };
    PROVIDERS.forEach((p) => {
      data[p.id] = {};
      p.fields.forEach((f) => {
        const v = typeof window !== "undefined" ? localStorage.getItem(ns(p.id, f.key)) : null;
        if (v) data[p.id][f.key] = v;
      });
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.active_provider) localStorage.setItem("active_provider", data.active_provider);
    if (data.generate_api_url) localStorage.setItem("generate_api_url", data.generate_api_url);
    PROVIDERS.forEach((p) => {
      const values = data[p.id] || {};
      p.fields.forEach((f) => {
        if (values[f.key] !== undefined) localStorage.setItem(ns(p.id, f.key), String(values[f.key]));
      });
    });
    setActiveProvider((data.active_provider as ProviderId) || activeProvider);
    setGenerateApiUrl(data.generate_api_url || generateApiUrl);
    setFormValues(getInitial((data.active_provider as ProviderId) || activeProvider));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const resetAll = () => {
    PROVIDERS.forEach((p) => p.fields.forEach((f) => localStorage.removeItem(ns(p.id, f.key))));
    localStorage.removeItem("active_provider");
    localStorage.removeItem("generate_api_url");
    setFormValues({});
    setGenerateApiUrl("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#0b0b0b] border border-gray-800 shadow-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-800">
          <h2 className="text-white text-lg sm:text-xl font-semibold">Settings</h2>
          <div className="flex items-center gap-2 text-xs">
            <button onClick={exportConfig} className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-200 hover:bg-gray-800">Export</button>
            <label className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-200 hover:bg-gray-800 cursor-pointer">
              Import
              <input type="file" accept="application/json" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) importConfig(f); }} />
            </label>
            <button onClick={resetAll} className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-200 hover:bg-gray-800">Reset</button>
            <button onClick={onClose} className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-200 hover:bg-gray-800">Close</button>
          </div>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 gap-6">
          <section className="space-y-3">
            <h3 className="text-white font-medium">AI Provider</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm text-gray-300">Provider
                <select value={activeProvider} onChange={(e)=>setActiveProvider(e.target.value as ProviderId)} className="mt-1 w-full rounded-lg bg-black border border-gray-800 text-gray-200 px-3 py-2">
                  {PROVIDERS.map((p)=> (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </label>
              <div className="hidden sm:block" />
              {def.fields.map((f)=> (
                <label key={f.key} className="text-sm text-gray-300">
                  {f.label}
                  {f.type === "textarea" ? (
                    <textarea
                      value={formValues[f.key] || ""}
                      onChange={(e)=>setFormValues((s)=>({...s, [f.key]: e.target.value}))}
                      placeholder={f.placeholder}
                      className="mt-1 w-full rounded-lg bg-black border border-gray-800 text-gray-200 px-3 py-2 min-h-[88px]"
                    />
                  ) : (
                    <input
                      value={formValues[f.key] || ""}
                      onChange={(e)=>setFormValues((s)=>({...s, [f.key]: e.target.value}))}
                      placeholder={f.placeholder}
                      type={f.type === "password" ? "password" : "text"}
                      className="mt-1 w-full rounded-lg bg-black border border-gray-800 text-gray-200 px-3 py-2"
                    />
                  )}
                  {f.helperText && <div className="text-xs text-gray-500 mt-1">{f.helperText}</div>}
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500">Values are stored locally in your browser. For server-side usage, configure environment variables on your API host.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-white font-medium">Generation API</h3>
            <label className="text-sm text-gray-300 block">External API URL
              <input value={generateApiUrl} onChange={(e)=>setGenerateApiUrl(e.target.value)} placeholder="https://your-api.example.com/api/generate-daytona" className="mt-1 w-full rounded-lg bg-black border border-gray-800 text-gray-200 px-3 py-2" />
            </label>
            <p className="text-xs text-gray-500">If set, the app will call this URL instead of the built-in Pages API (disabled on Cloudflare Pages).</p>
          </section>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-800">
          <div className="text-xs text-gray-500">Responsive • Mobile-friendly • Import/Export</div>
          <div className="flex items-center gap-2">
            {saved && <div className="text-green-400 text-sm">Saved</div>}
            <button onClick={save} className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-100">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}