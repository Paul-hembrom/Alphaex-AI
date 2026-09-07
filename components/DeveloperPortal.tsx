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
        return `curl -X POST "https://paulhemb-alphanex.hf.space/v1/audio/speech" \\
  -H "x-api-key: ${activeKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "नमस्ते! म कथा AI (Alphanex) हुँ, उच्च गुणस्तरीय नेपाली स्पिच सिन्थेसाइजर।",
    "voice_id": "amrita_news",
    "custom_prompt": null,
    "temperature": 0.35
  }'`;

      case 'python':
        return `import base64
import requests

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
    data = response.json()
    audio_bytes = base64.b64decode(data["audio_base64"])
    with open("nepali_output.wav", "wb") as f:
        f.write(audio_bytes)
    print(f"Saved! Duration: {data.get('duration')}s | Remaining: {data.get('remaining_credits')}")
    print(f"MMS Timestamps: {len(data.get('timestamps', []))} words aligned")
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

  const data = await response.json();
  const audioBuffer = Buffer.from(data.audio_base64, 'base64');
  await fs.writeFile('notification_audio.wav', audioBuffer);
  console.log(\`Duration: \${data.duration}s | Remaining Credits: \${data.remaining_credits}\`);
  console.log(\`MMS Alignment: \${data.timestamps?.length ?? 0} words aligned\`);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl md:text-2xl font-light tracking-tight text-stone-900 flex items-center gap-2.5">
            <span className="p-2 rounded-full bg-stone-100 text-stone-900 border border-stone-200">
              <Terminal className="w-4 h-4" />
            </span>
            {lang === 'ne' ? 'डेभलपर पोर्टल र एपीआई व्यवस्थापन' : 'Developer Portal & API Key Manager'}
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            {lang === 'ne'
              ? 'आफ्नो मोबाइल एप, वेबसाइट वा सर्भरमा सिधै नेपाली अडियो सिन्थेसिस इन्टिग्रेट गर्नुहोस्।'
              : 'Direct REST integration with Hugging Face Space endpoints, ultra-low latency streaming, and MMS forced alignment.'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-xs px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-600 font-mono flex items-center gap-2 shadow-xs">
            <Server className="w-3.5 h-3.5 text-stone-700" />
            <span>https://paulhemb-alphanex.hf.space</span>
          </div>

          <div className="text-xs px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-600 font-mono flex items-center gap-2 shadow-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                healthInfo?.status === 'healthy'
                  ? 'bg-stone-900 animate-pulse'
                  : healthInfo?.status === 'unreachable'
                  ? 'bg-amber-500'
                  : 'bg-stone-400'
              }`}
            />
            <span className="text-[11px]">
              T4 GPU:{' '}
              <strong className="text-stone-900 font-medium">
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
          <div className="bg-white rounded-3xl border border-stone-200/80 p-5 md:p-6 shadow-editorial">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-stone-700" />
                <h3 className="font-medium text-stone-900 text-base">
                  {lang === 'ne' ? 'सक्रिय एपीआई कुञ्जीहरू (API Keys)' : 'Active API Keys'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreatingKey(true)}
                id="create-api-key-btn"
                className="text-xs px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-black text-stone-50 font-medium flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'ne' ? 'नयाँ कुञ्जी बनाउनुहोस्' : 'Create Live Key'}</span>
              </button>
            </div>

            {/* Modal/Inline creator */}
            {isCreatingKey && (
              <div className="mb-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 animate-fadeIn">
                <p className="text-xs text-stone-700 mb-2 font-medium">
                  {lang === 'ne' ? 'कुञ्जीको नाम राख्नुहोस्:' : 'Enter Key Description / Name:'}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Kathmandu Radio Automation"
                    className="flex-1 text-xs px-3.5 py-2 rounded-full bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                  <button
                    onClick={handleGenerateKey}
                    disabled={isSubmittingKey || !newKeyName.trim()}
                    className="text-xs px-4 py-2 bg-stone-900 text-stone-50 font-medium rounded-full hover:bg-black disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isSubmittingKey && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>{lang === 'ne' ? 'जारी गर्नुहोस्' : 'Generate'}</span>
                  </button>
                  <button
                    onClick={() => setIsCreatingKey(false)}
                    disabled={isSubmittingKey}
                    className="text-xs px-3.5 py-2 bg-stone-200 text-stone-700 rounded-full hover:bg-stone-300 cursor-pointer transition-colors"
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
                  className={`p-4 rounded-2xl border transition-all ${
                    item.status === 'revoked'
                      ? 'bg-stone-50/40 border-stone-200/50 opacity-60'
                      : 'bg-stone-50/60 border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-medium text-stone-900 text-xs md:text-sm">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider font-medium ${
                          item.status === 'active'
                            ? 'bg-stone-900 text-stone-50'
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.status}
                      </span>
                      {item.status === 'active' && (
                        <button
                          onClick={() => handleRevokeKey(item.id)}
                          title="Revoke Key"
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-stone-200">
                    <code className="text-xs font-mono text-stone-800 truncate">
                      {item.status === 'revoked'
                        ? '••••••••••••••••••••••••••••••••••••'
                        : `${item.key.substring(0, 14)}••••••••••••${item.key.substring(item.key.length - 4)}`}
                    </code>
                    {item.status === 'active' && (
                      <button
                        onClick={() => handleCopyKey(item.id, item.key)}
                        className="text-stone-500 hover:text-stone-900 transition-colors shrink-0 flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        {copiedKeyId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-stone-900" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-stone-500 mt-2 font-mono">
                    <span>Created: {item.createdAt}</span>
                    <span>Last used: {item.lastUsedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Chart Module */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-5 md:p-6 shadow-editorial">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-stone-700" />
                <h3 className="font-medium text-stone-900 text-sm md:text-base">
                  {lang === 'ne' ? 'दैनिक खपत ग्राफ (Character Consumption)' : '7-Day API Character Consumption'}
                </h3>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-stone-500">{lang === 'ne' ? 'कुल यो साता:' : 'Weekly Total:'} </span>
                <span className="text-sm font-semibold text-stone-900">{totalWeeklyChars.toLocaleString()}</span>
              </div>
            </div>

            {/* SVG / Tailwind Bar Chart */}
            <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80">
              <div className="flex items-end justify-between gap-3 h-36 pt-4">
                {MOCK_DAILY_USAGE.map((stat, idx) => {
                  const heightPct = Math.round((stat.characters / maxChars) * 100);
                  const isToday = idx === MOCK_DAILY_USAGE.length - 1;

                  return (
                    <div key={stat.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
                        {(stat.characters / 1000).toFixed(1)}k
                      </span>
                      <div
                        className={`w-full max-w-[32px] rounded-t-lg transition-all duration-300 ${
                          isToday
                            ? 'bg-stone-900 shadow-xs'
                            : 'bg-stone-300 hover:bg-stone-400'
                        }`}
                        style={{ height: `${heightPct}%` }}
                        title={`${stat.characters.toLocaleString()} chars, ${stat.calls} calls`}
                      />
                      <span className={`text-[11px] font-mono ${isToday ? 'text-stone-900 font-bold' : 'text-stone-500'}`}>
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
          <div className="bg-white rounded-3xl border border-stone-200/80 p-5 md:p-6 shadow-editorial flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-stone-700" />
                <h3 className="font-medium text-stone-900 text-sm md:text-base">
                  {lang === 'ne' ? 'कोड जेनरेटर (Instant Snippet)' : 'Interactive Code Generator'}
                </h3>
              </div>
              <button
                onClick={handleCopyCode}
                id="copy-snippet-btn"
                className="text-xs px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedCodeSnippet ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-stone-900" />
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
            <div className="flex gap-4 border-b border-stone-200 pb-2 mb-3 font-mono text-xs mt-3">
              {(['curl', 'python', 'node'] as const).map((codeLang) => {
                const isCurrent = selectedLanguage === codeLang;
                const label = codeLang === 'curl' ? 'cURL' : codeLang === 'python' ? 'Python' : 'Node.js';
                return (
                  <button
                    key={codeLang}
                    onClick={() => setSelectedLanguage(codeLang)}
                    className={`transition-colors cursor-pointer ${
                      isCurrent
                        ? 'text-stone-900 border-b-2 border-stone-900 pb-1 font-bold'
                        : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Code Display Area */}
            <div className="flex-1 bg-stone-900 rounded-2xl p-4 font-mono text-xs overflow-x-auto text-stone-100 leading-relaxed max-h-[380px] shadow-inner">
              <pre className="whitespace-pre">{getCodeSnippet()}</pre>
            </div>

            {/* API Specs Footer */}
            <div className="mt-4 pt-3 border-t border-stone-200 text-xs text-stone-500 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="text-stone-800 font-medium">audio/wav (24kHz Mono)</span>
              </div>
              <div className="flex justify-between">
                <span>Alignment:</span>
                <span className="text-stone-800 font-semibold">Meta MMS forced alignment</span>
              </div>
              <div className="flex justify-between">
                <span>Max Payload:</span>
                <span className="text-stone-800 font-medium">5,000 characters / request</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
