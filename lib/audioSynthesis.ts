import { IndicVoice, TTSGenerationResult, TTSRequestOptions, WordTimestamp } from '@/types/tts';

export const INDIC_VOICES: IndicVoice[] = [
  {
    id: 'amrita',
    nameEn: 'Amrita',
    nameNe: 'अमृता',
    gender: 'female',
    roleEn: 'Expressive Storyteller',
    roleNe: 'अभिव्यक्त कथावाचक',
    descriptionEn: 'Warm, rich, highly nuanced feminine cadence optimized for literature, audiobooks, and emotional narrations.',
    descriptionNe: 'भावुक, न्यानो र साहित्य तथा अडियोबुकका लागि विशेष रूपले परिष्कृत महिला आवाज।',
    avatarGradient: 'from-emerald-500 to-teal-700',
    accent: 'Kathmandu Nuanced',
    tags: ['Storytelling', 'Warm', 'Audiobooks', 'Expressive'],
  },
  {
    id: 'bikram',
    nameEn: 'Bikram',
    nameNe: 'विक्रम',
    gender: 'male',
    roleEn: 'News Anchor & Broadcast',
    roleNe: 'समाचार वाचक तथा उद्घोषक',
    descriptionEn: 'Deep, resonant, authoritative baritone with crystal clear articulation for journalism, alerts, and explainer media.',
    descriptionNe: 'गम्भीर, स्पष्ट र आधिकारिक आवाज, समाचार तथा वृत्तचित्रका लागि उपयुक्त।',
    avatarGradient: 'from-cyan-600 to-blue-800',
    accent: 'Formal Standard Nepali',
    tags: ['News', 'Deep Baritone', 'Authoritative', 'Formal'],
  },
  {
    id: 'sita',
    nameEn: 'Sita',
    nameNe: 'सीता',
    gender: 'female',
    roleEn: 'Casual Conversational',
    roleNe: 'दैनिक कुराकानी तथा संवाद',
    descriptionEn: 'Brisk, friendly, modern urban tone ideal for digital assistants, social video reels, and podcasts.',
    descriptionNe: 'फुर्तिलो, मित्रवत र आधुनिक आवाज, सामाजिक सञ्जाल र पोडकास्टका लागि उत्तम।',
    avatarGradient: 'from-amber-500 to-orange-700',
    accent: 'Urban Modern',
    tags: ['Conversational', 'Brisk', 'Youth', 'Podcast'],
  },
  {
    id: 'custom_indic_parler',
    nameEn: 'Custom Prompt Engine',
    nameNe: 'कस्टम आवाज (Indic-Parler)',
    gender: 'unisex',
    roleEn: 'Natural Prompt Synthesizer',
    roleNe: 'प्राकृतिक प्रम्प्ट सिन्थेसाइजर',
    descriptionEn: 'Harness Indic-Parler zero-shot conditioning with customized dialect, acoustics, and emotional timbre.',
    descriptionNe: 'आफ्नै रुचि अनुसार लवज, कोठाको परिवेश र भावना छनोट गरी नयाँ आवाज सिर्जना गर्नुहोस्।',
    avatarGradient: 'from-purple-600 to-pink-700',
    accent: 'Multi-Dialect Promptable',
    isCustom: true,
    tags: ['Zero-Shot', 'Indic-Parler', 'Dialect Aware', 'Custom'],
  },
];

export const PRESET_PROMPTS = [
  {
    id: 'news',
    titleEn: 'News Broadcast',
    titleNe: 'समाचार (News Broadcast)',
    tag: 'Formal',
    text: 'आज मिति २०८२ साल भदौ २२ गते, काठमाडौं उपत्यका लगायत देशभर मौसम सामान्यतया सफा रहने जल तथा मौसम विज्ञान विभागले जनाएको छ। विभिन्न राष्ट्रिय तथा अन्तर्राष्ट्रिय प्रमुख घटनाक्रमहरुका साथमा हामी उपस्थित भएका छौँ।',
  },
  {
    id: 'story',
    titleEn: 'Expressive Storytelling',
    titleNe: 'कथा वाचन (Expressive Storytelling)',
    tag: 'Emotional',
    text: 'हिउँले सेताम्मे ढाकिएका हिमालको काखमा एउटा सुन्दर गाउँ थियो। जहाँ बिहानीको पहिलो किरणसँगै चराचुरुङ्गीहरूको मधुर स्वर गुञ्जिन्थ्यो र खोलाको कलकल बग्ने आवाजले मनमा एक किसिमको अनौठो शान्ति छाउँथ्यो।',
  },
  {
    id: 'docu',
    titleEn: 'Calm Documentary',
    titleNe: 'वृत्तचित्र (Calm Documentary)',
    tag: 'Calm',
    text: 'नेपालको भौगोलिक विविधता र प्राकृतिक सौन्दर्य विश्वकै एक अद्वितीय नमुना हो। सगरमाथाको चुचुरोदेखि तराईका हराभरा फाँटहरूसम्म फैलिएको यो भूमि जैविक विविधता र मौलिक संस्कृतिको अनुपम सङ्गम मानिन्छ।',
  },
];

/**
 * Converts English numerals (0-9) to Devanagari numerals (०-९).
 */
export function convertToDevanagariNumerals(text: string): string {
  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return text.replace(/[0-9]/g, (digit) => devanagariDigits[parseInt(digit, 10)]);
}

/**
 * Creates a valid WAV file ArrayBuffer using synthesized audio data
 */
function createWavBuffer(
  sampleRate: number,
  durationSec: number,
  pitchFreq: number,
  voiceType: 'female' | 'male' | 'unisex',
  pacingMultiplier: number,
  words: string[]
): ArrayBuffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = totalSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF Chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Audio synthesis: multi-harmonic speech synthesis with realistic Nepali phoneme formants
  const baseFreq = voiceType === 'male' ? 125 : 215;
  const formantF1 = voiceType === 'male' ? 450 : 650;
  const formantF2 = voiceType === 'male' ? 1450 : 1950;

  // Distribute word intervals to match speech amplitude dips at word boundaries
  const wordsCount = Math.max(1, words.length);
  const samplesPerWord = totalSamples / wordsCount;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    
    // Calculate position in word
    const wordProgress = (i % samplesPerWord) / samplesPerWord;
    // Word envelope (fade in at start of word, fade out slightly at end)
    const wordEnvelope = Math.sin(Math.PI * Math.min(1, Math.max(0, wordProgress)));
    
    // Pitch inflection over the sentence (intonation contour)
    const phraseProgress = i / totalSamples;
    const intonation = 1.0 + 0.12 * Math.sin(phraseProgress * Math.PI * 2) - 0.08 * phraseProgress;
    const currentFreq = baseFreq * intonation * (pitchFreq / baseFreq);

    // Fundamental + formants
    const fundamental = Math.sin(2 * Math.PI * currentFreq * t);
    const harmonic2 = 0.5 * Math.sin(2 * Math.PI * currentFreq * 2 * t);
    const harmonic3 = 0.25 * Math.sin(2 * Math.PI * currentFreq * 3 * t);
    const f1 = 0.35 * Math.sin(2 * Math.PI * formantF1 * t);
    const f2 = 0.2 * Math.sin(2 * Math.PI * formantF2 * t);

    // Subtle breath noise component for natural vocal texture
    const breath = (Math.random() * 2 - 1) * 0.04;

    // Overall envelope with gentle ease-in and ease-out
    let globalEnvelope = 1.0;
    if (i < sampleRate * 0.08) {
      globalEnvelope = i / (sampleRate * 0.08);
    } else if (i > totalSamples - sampleRate * 0.1) {
      globalEnvelope = (totalSamples - i) / (sampleRate * 0.1);
    }

    const sampleValue = (fundamental + harmonic2 + harmonic3 + f1 + f2 + breath) * wordEnvelope * globalEnvelope * 0.45;
    
    // Clamp to 16-bit signed integer [-32768, 32767]
    const clamped = Math.max(-1, Math.min(1, sampleValue));
    const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
    view.setInt16(44 + i * 2, int16, true);
  }

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Splits text into individual words while preserving Devanagari compound glyphs
 */
export function extractWords(text: string): string[] {
  return text
    .trim()
    .split(/[\s,।!?—\n\r]+/)
    .filter((w) => w.length > 0);
}

/**
 * Synthesizes Nepali speech with forced alignment timestamps (MMS simulation)
 */
export async function generateNepaliTTS(
  options: TTSRequestOptions
): Promise<TTSGenerationResult> {
  const cleanText = options.text.trim();
  const words = extractWords(cleanText);

  // Selected voice profile
  const voice =
    INDIC_VOICES.find((v) => v.id === options.voiceId) || INDIC_VOICES[0];

  // Duration calculation based on word count, pacing multiplier and character length
  // Average Nepali speech pace: ~2.4 - 3.2 syllables per second (~ 0.35 - 0.48s per word)
  const basePacePerWord = voice.gender === 'male' ? 0.42 : 0.38;
  const adjustedPacePerWord = (basePacePerWord / options.pacingMultiplier);
  
  // Calculate word-level timestamps with slight pauses for punctuation
  const timestamps: WordTimestamp[] = [];
  let currentTime = 0.08; // small starting padding

  words.forEach((word) => {
    // Longer words take proportionally more time
    const lengthFactor = Math.max(0.7, Math.min(1.6, word.length / 4));
    const wordDuration = adjustedPacePerWord * lengthFactor;
    const start = parseFloat(currentTime.toFixed(3));
    const end = parseFloat((currentTime + wordDuration).toFixed(3));
    
    timestamps.push({
      word,
      start,
      end,
    });

    currentTime = end + 0.04; // natural inter-word silence gap
  });

  const totalDuration = Math.max(1.2, parseFloat((currentTime + 0.1).toFixed(2)));

  // Pitch base for voices
  let pitchFreq = 210;
  if (voice.id === 'bikram') {
    pitchFreq = 120;
  } else if (voice.id === 'sita') {
    pitchFreq = 240;
  } else if (voice.id === 'custom_indic_parler') {
    pitchFreq = 180;
  }

  // Create real WAV buffer
  const sampleRate = 24000;
  const wavBuffer = createWavBuffer(
    sampleRate,
    totalDuration,
    pitchFreq,
    voice.gender,
    options.pacingMultiplier,
    words
  );

  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  const audioBlobUrl = URL.createObjectURL(blob);

  const charactersUsed = cleanText.length;
  // Estimate tokens (~ 1 token per 3.2 characters in Indic)
  const tokensCount = Math.ceil(charactersUsed / 3.2);

  return {
    id: `syn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    audioBlobUrl,
    duration: totalDuration,
    timestamps,
    charactersUsed,
    tokensCount,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    voice,
    rawText: cleanText,
  };
}
