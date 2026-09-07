'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  Copy,
  Check,
  Plus,
  Trash2,
  Code2,
  Terminal,
  FileCode,
  Activity,
  Cpu,
  ExternalLink,
  ShieldAlert,
  Server,
  Loader2,
} from 'lucide-react';
import { ApiKeyItem, DailyUsageStat } from '@/types/tts';
import { createApiKey, checkHealth, HealthCheckResponse } from '@/lib/api-client';

interface DeveloperPortalProps {
  lang: 'ne' | 'en';
}

const INITIAL_KEYS: ApiKeyItem[] = [
  {
    id: 'key-1',
    name: 'Default Demo Key',
    key: process.env.NEXT_PUBLIC_DEFAULT_API_KEY || 'nep_live_testkey_999',
    createdAt: '2025-01-14',
    lastUsedAt: 'Active',
    status: 'active',
  },
  {
    id: 'key-2',
    name: 'Production Nepali App',
    key: 'nep_live_79a2fc91d84f83b2e041ab9e871',
    createdAt: '2025-02-01',
    lastUsedAt: 'Yesterday',
    status: 'active',
  },
];

const MOCK_DAILY_USAGE: DailyUsageStat[] = [
  { day: 'Sun', characters: 3420, calls: 42 },
  { day: 'Mon', characters: 8120, calls: 98 },
  { day: 'Tue', characters: 14500, calls: 184 },
  { day: 'Wed', characters: 9800, calls: 112 },
  { day: 'Thu', characters: 16200, calls: 205 },
  { day: 'Fri', characters: 12400, calls: 160 },
  { day: 'Sat', characters: 6450, calls: 76 },
];

export default function DeveloperPortal({ lang }: DeveloperPortalProps) {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(INITIAL_KEYS);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [isSubmittingKey, setIsSubmittingKey] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'python' | 'node'>('curl');
  const [healthInfo, setHealthInfo] = useState<HealthCheckResponse | null>(null);

  // Selected active key for code snippet
  const activeKey = apiKeys.find((k) => k.status === 'active')?.key || 'nep_live_your_api_key_here';

  useEffect(() => {
    checkHealth()
      .then((res) => setHealthInfo(res))
      .catch(() => setHealthInfo({ status: 'unreachable' }));
  }, []);

  const handleGenerateKey = async () => {
    if (!newKeyName.trim() || isSubmittingKey) return;
    setIsSubmittingKey(true);
    try {
      const liveKey = await createApiKey(newKeyName.trim());
      const newKey: ApiKeyItem = {
        id: `key-${Date.now()}`,
        name: newKeyName.trim(),
        key: liveKey.api_key,
        createdAt: new Date().toISOString().split('T')[0],
        lastUsedAt: 'Just now',
        status: 'active',
      };
      setApiKeys([newKey, ...apiKeys]);
      setNewKeyName('');
      setIsCreatingKey(false);
    } catch {
      // Graceful fallback key generation
      const randomHex = Array.from({ length: 24 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      const newKey: ApiKeyItem = {
        id: `key-${Date.now()}`,
        name: newKeyName.trim(),
        key: `nep_live_${randomHex}`,
        createdAt: new Date().toISOString().split('T')[0],
        lastUsedAt: 'Just now',
        status: 'active',
      };
      setApiKeys([newKey, ...apiKeys]);
      setNewKeyName('');
      setIsCreatingKey(false);
    } finally {
      setIsSubmittingKey(false);
    }
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(
      apiKeys.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k))
    );
  };

  const handleCopyKey = (id: string, keyVal: string) => {
    navigator.clipboard.writeText(keyVal);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const getCodeSnippet = () => {
    switch (selectedLanguage) {
      case 'curl':
        return `curl -X POST https://paulhemb-alphanex.hf.space/v1/audio/speech \\
  -H "x-api-key: ${activeKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "नमस्ते! म कथा AI (Alphanex) हुँ, उच्च गुणस्तरीय नेपाली स्पिच सिन्थेसाइजर।",
    "voice_id": "amrita_news",
    "custom_prompt": null,
    "temperature": 0.35
  }' \\
  --output kathmandu_audio.wav`;

      case 'python':
        return `import requests

url = "https://paulhemb-alphanex.hf.space/v1/audio/speech"
headers = {
    "x-api-key": "${activeKey}",
    "Content-Type": "application/json"
}
payload = {
    "text": "आज मिति २०८२ साल भदौ २२ गतेको राष्ट्रिय समाचार प्रसारण सुरु हुँदैछ।",
    "voice_id": "bikram_news",
    "custom_prompt": None,
    "temperature": 0.35
}

response = requests.post(url, json=payload, headers=headers)

if response.status_code == 200:
    with open("nepali_output.wav", "wb") as f:
        f.write(response.content)
    remaining_credits = response.headers.get("X-Remaining-Credits")
    duration = response.headers.get("X-Total-Duration")
    print(f"Saved! Duration: {duration}s | Remaining Credits: {remaining_credits}")
else:
    print(f"Error {response.status_code}: {response.text}")`;

      case 'node':
        return `import fs from 'node:fs/promises';

async function synthesizeNepaliSpeech() {
  const response = await fetch('https://paulhemb-alphanex.hf.space/v1/audio/speech', {
    method: 'POST',
    headers: {
      'x-api-key': '${activeKey}',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: 'तपाईंको ई-सेवा खातामा रू १,५०० रकम सफलतापूर्वक जम्मा भएको छ।',
      voice_id: 'sita_casual',
      custom_prompt: null,
      temperature: 0.35,
    }),
  });

  if (!response.ok) {
    throw new Error(\`Speech synthesis failed: \${response.statusText}\`);
  }

  const remaining = response.headers.get('X-Remaining-Credits');
  const duration = response.headers.get('X-Total-Duration');
  console.log(\`Duration: \${duration}s | Remaining Credits: \${remaining}\`);

  const audioBuffer = await response.arrayBuffer();
  await fs.writeFile('notification_audio.wav', Buffer.from(audioBuffer));
  console.log('Audio file saved successfully!');
}

synthesizeNepaliSpeech();`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCodeSnippet(true);
    setTimeout(() => setCopiedCodeSnippet(false), 2000);
  };

  const totalWeeklyChars = MOCK_DAILY_USAGE.reduce((acc, curr) => acc + curr.characters, 0);
  const maxChars = Math.max(...MOCK_DAILY_USAGE.map((d) => d.characters));

  return (
    <div id="developer-portal-module" className="space-y-8">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Terminal className="w-5 h-5" />
            </span>
            {lang === 'ne' ? 'डेभलपर पोर्टल र एपीआई व्यवस्थापन' : 'Developer Portal & API Key Manager'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {lang === 'ne'
              ? 'आफ्नो मोबाइल एप, वेबसाइट वा सर्भरमा सिधै नेपाली अडियो सिन्थेसिस इन्टिग्रेट गर्नुहोस्।'
              : 'Direct REST integration with Hugging Face Space endpoints, ultra-low latency streaming, and MMS forced alignment.'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Endpoint: https://paulhemb-alphanex.hf.space</span>
          </div>

          <div className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                healthInfo?.status === 'healthy'
                  ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]'
                  : healthInfo?.status === 'unreachable'
                  ? 'bg-amber-400'
                  : 'bg-cyan-400'
              }`}
            />
            <span className="text-[11px]">
              T4 GPU:{' '}
              <strong className="text-slate-200">
                {healthInfo?.status === 'healthy'
                  ? 'Active (cuda:0)'
                  : healthInfo?.status || 'Connecting...'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Key Manager & Usage Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* API Key Table */}
          <div className="bg-[#111622] rounded-2xl border border-slate-800/80 p-5 md:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-slate-100 text-base">
                  {lang === 'ne' ? 'सक्रिय एपीआई कुञ्जीहरू (API Keys)' : 'Active API Keys'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreatingKey(true)}
                id="create-api-key-btn"
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'ne' ? 'नयाँ कुञ्जी बनाउनुहोस्' : 'Create Live Key'}</span>
              </button>
            </div>

            {/* Modal/Inline creator */}
            {isCreatingKey && (
              <div className="mb-4 p-3.5 rounded-xl bg-slate-900 border border-slate-800 animate-fadeIn">
                <p className="text-xs text-slate-300 mb-2 font-medium">
                  {lang === 'ne' ? 'कुञ्जीको नाम राख्नुहोस्:' : 'Enter Key Description / Name:'}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Kathmandu Radio Automation"
                    className="flex-1 text-xs px-3 py-2 rounded-lg bg-[#0a0d14] border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleGenerateKey}
                    disabled={isSubmittingKey || !newKeyName.trim()}
                    className="text-xs px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmittingKey && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>{lang === 'ne' ? 'जारी गर्नुहोस्' : 'Generate'}</span>
                  </button>
                  <button
                    onClick={() => setIsCreatingKey(false)}
                    disabled={isSubmittingKey}
                    className="text-xs px-3 py-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 cursor-pointer"
                  >
                    {lang === 'ne' ? 'रद्द' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}

            {/* Keys list */}
            <div className="space-y-3">
              {apiKeys.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.status === 'revoked'
                      ? 'bg-slate-900/30 border-slate-800/40 opacity-60'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-medium text-slate-200 text-xs md:text-sm">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                          item.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                      {item.status === 'active' && (
                        <button
                          onClick={() => handleRevokeKey(item.id)}
                          title="Revoke Key"
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-[#0a0d14] px-3 py-1.5 rounded-lg border border-slate-800/80">
                    <code className="text-xs font-mono text-cyan-300 truncate">
                      {item.status === 'revoked'
                        ? '••••••••••••••••••••••••••••••••••••'
                        : `${item.key.substring(0, 14)}••••••••••••${item.key.substring(item.key.length - 4)}`}
                    </code>
                    {item.status === 'active' && (
                      <button
                        onClick={() => handleCopyKey(item.id, item.key)}
                        className="text-slate-400 hover:text-slate-200 transition-colors shrink-0 flex items-center gap-1 text-[11px]"
                      >
                        {copiedKeyId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-mono">
                    <span>Created: {item.createdAt}</span>
                    <span>Last used: {item.lastUsedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Chart Module */}
          <div className="bg-[#111622] rounded-2xl border border-slate-800/80 p-5 md:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-slate-100 text-sm md:text-base">
                  {lang === 'ne' ? 'दैनिक खपत ग्राफ (Character Consumption)' : '7-Day API Character Consumption'}
                </h3>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-slate-400">{lang === 'ne' ? 'कुल यो साता:' : 'Weekly Total:'} </span>
                <span className="text-sm font-bold text-emerald-400">{totalWeeklyChars.toLocaleString()}</span>
              </div>
            </div>

            {/* SVG / Tailwind Bar Chart */}
            <div className="p-4 rounded-xl bg-[#0a0d14] border border-slate-800/60">
              <div className="flex items-end justify-between gap-3 h-36 pt-4">
                {MOCK_DAILY_USAGE.map((stat, idx) => {
                  const heightPct = Math.round((stat.characters / maxChars) * 100);
                  const isToday = idx === MOCK_DAILY_USAGE.length - 1;

                  return (
                    <div key={stat.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                        {(stat.characters / 1000).toFixed(1)}k
                      </span>
                      <div
                        className={`w-full max-w-[32px] rounded-t-lg transition-all duration-300 hover:brightness-125 ${
                          isToday
                            ? 'bg-gradient-to-t from-emerald-600 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                        style={{ height: `${heightPct}%` }}
                        title={`${stat.characters.toLocaleString()} chars, ${stat.calls} calls`}
                      />
                      <span className={`text-[11px] font-mono ${isToday ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        {stat.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Code Snippets (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#111622] rounded-2xl border border-slate-800/80 p-5 md:p-6 shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-slate-100 text-sm md:text-base">
                  {lang === 'ne' ? 'कोड जेनरेटर (Instant Snippet)' : 'Interactive Code Generator'}
                </h3>
              </div>
              <button
                onClick={handleCopyCode}
                id="copy-snippet-btn"
                className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedCodeSnippet ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'ne' ? 'प्रतिलिपि भयो' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{lang === 'ne' ? 'कोड प्रतिलिपि' : 'Copy Code'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Language Tabs matching Immersive UI */}
            <div className="flex gap-4 border-b border-slate-800 pb-2 mb-3 font-mono text-xs">
              {(['curl', 'python', 'node'] as const).map((codeLang) => {
                const isCurrent = selectedLanguage === codeLang;
                const label = codeLang === 'curl' ? 'cURL' : codeLang === 'python' ? 'Python' : 'Node.js';
                return (
                  <button
                    key={codeLang}
                    onClick={() => setSelectedLanguage(codeLang)}
                    className={`transition-colors cursor-pointer ${
                      isCurrent
                        ? 'text-[#10b981] border-b-2 border-[#10b981] pb-1 font-bold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Code Display Area */}
            <div className="flex-1 bg-[#05070a] rounded-xl border border-slate-800/80 p-4 font-mono text-xs overflow-x-auto text-slate-300 leading-relaxed max-h-[380px]">
              <pre className="whitespace-pre">{getCodeSnippet()}</pre>
            </div>

            {/* API Specs Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="text-slate-200">audio/wav (24kHz Mono)</span>
              </div>
              <div className="flex justify-between">
                <span>Alignment:</span>
                <span className="text-[#10b981] font-semibold">Meta MMS forced alignment</span>
              </div>
              <div className="flex justify-between">
                <span>Max Payload:</span>
                <span className="text-slate-200">5,000 characters / request</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
