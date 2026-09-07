export type Language = 'ne' | 'en';

export type VoiceGender = 'female' | 'male' | 'unisex';

export interface IndicVoice {
  id: string;
  nameEn: string;
  nameNe: string;
  gender: VoiceGender;
  roleEn: string;
  roleNe: string;
  descriptionEn: string;
  descriptionNe: string;
  avatarGradient: string;
  accent: string;
  isCustom?: boolean;
  sampleRate?: number;
  tags: string[];
}

export interface WordTimestamp {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
}

export interface TTSRequestOptions {
  text: string;
  voiceId: string;
  pacingMultiplier: number;     // 0.5x to 2.0x
  temperature: number;          // 0.1 to 1.0
  repetitionPenalty: number;    // 1.0 to 2.0
  topK: number;                 // 10 to 100
  customPrompt?: string;
  dialect?: string;
  acousticEnvironment?: string;
}

export interface TTSGenerationResult {
  id: string;
  audioBlobUrl: string;
  duration: number; // in seconds
  timestamps: WordTimestamp[];
  charactersUsed: number;
  tokensCount: number;
  createdAt: string;
  voice: IndicVoice;
  rawText: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt: string;
  status: 'active' | 'revoked';
}

export interface DailyUsageStat {
  day: string;
  characters: number;
  calls: number;
}

export interface PricingPlan {
  id: string;
  nameEn: string;
  nameNe: string;
  badge?: string;
  priceNpr: number;
  monthlyQuota: number;
  quotaLabelEn: string;
  quotaLabelNe: string;
  featuresEn: string[];
  featuresNe: string[];
  popular?: boolean;
}

export interface VoiceCloneProfile {
  id: string;
  name: string;
  tone: string;
  dialect: string;
  acoustics: string;
  sampleFileName?: string;
  durationRecorded?: number;
  status: 'ready' | 'training' | 'processing';
  createdAt: string;
}
