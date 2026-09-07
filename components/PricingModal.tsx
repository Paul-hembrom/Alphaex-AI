'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  Zap,
  Sparkles,
  QrCode,
  ShieldCheck,
  CreditCard,
  Building2,
  Smartphone,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react';
import { PricingPlan } from '@/types/tts';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ne' | 'en';
  onAddCredits: (amount: number, tierName: string) => void;
  initialMode?: 'plans' | 'topup';
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    nameEn: 'Free Starter',
    nameNe: 'निःशुल्क (Free)',
    priceNpr: 0,
    monthlyQuota: 10000,
    quotaLabelEn: '10,000 Chars / month',
    quotaLabelNe: '१०,००० अक्षर / महिना',
    featuresEn: [
      'Standard Nepali voices (Amrita, Bikram)',
      'Web Synthesis Studio access',
      'Basic 24kHz WAV export',
      'Community Discord support',
    ],
    featuresNe: [
      'मानक नेपाली आवाजहरू (अमृता, विक्रम)',
      'वेब स्टुडियो संश्लेषण सुविधा',
      '२४ किलोहर्ज WAV अडियो डाउनलोड',
      'सामुदायिक सहयोग',
    ],
  },
  {
    id: 'creator',
    nameEn: 'Creator Studio',
    nameNe: 'निर्माता (Creator Tier)',
    badge: 'लोकप्रिय (Most Popular)',
    priceNpr: 499,
    monthlyQuota: 100000,
    quotaLabelEn: '100,000 Chars / month',
    quotaLabelNe: '१००,००० अक्षर / महिना',
    popular: true,
    featuresEn: [
      'All 3 Native voices + Sita',
      'Studio Voice Cloning (15-sec audio upload)',
      'MMS Synchronous Karaoke subtitle export',
      'Commercial broadcast licensing',
      'Standard API Access (60 req/min)',
    ],
    featuresNe: [
      'सबै नेपाली आवाजहरू + सीता',
      'स्टुडियो आवाज क्लोनिङ (१५-सेकेन्ड अडियो)',
      'MMS सिङ्क्रोनाइज्ड काराओके सबटाइटल',
      'व्यावसायिक प्रसारण अनुमति',
      'मानक एपीआई पहुँच (६० अनुरोध/मिनेट)',
    ],
  },
  {
    id: 'developer',
    nameEn: 'Developer & Agency',
    nameNe: 'डेभलपर (Agency/Dev Tier)',
    priceNpr: 1999,
    monthlyQuota: 500000,
    quotaLabelEn: '500,000 Chars / month',
    quotaLabelNe: '५००,००० अक्षर / महिना',
    featuresEn: [
      '500,000 Characters included',
      'Unlimited Voice Clones & Indic-Parler prompts',
      'High-concurrency HF Space integration',
      'Sub-200ms streaming endpoint',
      'Dedicated support & custom pronunciation lexicon',
    ],
    featuresNe: [
      '५००,००० अक्षर समावेश',
      'असीमित आवाज क्लोन र इन्डिक-पार्लर प्रम्प्ट',
      'उच्च गतिको हगिङ फेस स्पेस इन्टिग्रेशन',
      'अल्ट्रा-लो लेटन्सी स्ट्रिमिङ एपीआई',
      'प्राथमिकता प्राविधिक सहयोग र अनुकूलित शब्दकोश',
    ],
  },
];

const TOP_UP_PACKS = [
  { id: 'pack-25k', chars: 25000, priceNpr: 149, labelEn: '25,000 Chars', labelNe: '२५,००० अक्षर' },
  { id: 'pack-50k', chars: 50000, priceNpr: 299, labelEn: '50,000 Chars', labelNe: '५०,००० अक्षर', popular: true },
  { id: 'pack-150k', chars: 150000, priceNpr: 799, labelEn: '150,000 Chars', labelNe: '१५०,००० अक्षर' },
];

export default function PricingModal({
  isOpen,
  onClose,
  lang,
  onAddCredits,
  initialMode = 'plans',
}: PricingModalProps) {
  const [activeTab, setActiveTab] = useState<'plans' | 'topup'>(initialMode);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(PRICING_PLANS[1]);
  const [selectedPack, setSelectedPack] = useState(TOP_UP_PACKS[1]);
  const [paymentGateway, setPaymentGateway] = useState<'esewa' | 'khalti' | 'connectips'>('esewa');
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  if (!isOpen) return null;

  const currentAmount = activeTab === 'plans' ? selectedPlan.priceNpr : selectedPack.priceNpr;
  const currentChars = activeTab === 'plans' ? selectedPlan.monthlyQuota : selectedPack.chars;
  const currentTitle = activeTab === 'plans'
    ? lang === 'ne' ? selectedPlan.nameNe : selectedPlan.nameEn
    : lang === 'ne' ? selectedPack.labelNe : selectedPack.labelEn;

  const handleProcessPayment = () => {
    // Simulate payment confirmation
    setCheckoutSuccess(true);
    setTimeout(() => {
      onAddCredits(currentChars, currentTitle);
      setCheckoutSuccess(false);
      setShowCheckout(false);
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        id="pricing-checkout-modal"
        className="bg-[#111622] w-full max-w-4xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-100">
                {lang === 'ne' ? 'योजना तथा क्रेडिट रिचार्ज' : 'Plans & Credit Top-Up'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ne'
                  ? 'नेपालको आफ्नै भुक्तानी गेटवे (eSewa, Khalti, ConnectIPS) बाट तुरुन्त भुक्तानी'
                  : 'Instant Nepali payment processing via eSewa, Khalti, & ConnectIPS'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View switcher */}
            <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800">
              <button
                onClick={() => {
                  setActiveTab('plans');
                  setShowCheckout(false);
                }}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'plans' && !showCheckout
                    ? 'bg-[#10b981] text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'ne' ? 'मासिक योजनाहरू' : 'Monthly Plans'}
              </button>
              <button
                onClick={() => {
                  setActiveTab('topup');
                  setShowCheckout(false);
                }}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'topup' && !showCheckout
                    ? 'bg-[#10b981] text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'ne' ? 'क्रेडिट टप-अप' : 'Quick Top-Up'}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {showCheckout ? (
            /* Checkout with QR and Local Gateways */
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">
                    {lang === 'ne' ? 'छानिएको प्याकेज' : 'Selected Item'}
                  </span>
                  <span className="text-base font-bold text-slate-100">{currentTitle}</span>
                  <span className="text-xs text-emerald-400 ml-2 font-mono">
                    (+{currentChars.toLocaleString()} {lang === 'ne' ? 'अक्षर' : 'chars'})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">{lang === 'ne' ? 'कुल रकम' : 'Total Due'}</span>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    रू {currentAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Gateway selector */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">
                  {lang === 'ne' ? 'भुक्तानी विधि छान्नुहोस् (Payment Gateway)' : 'Choose Payment Method'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* eSewa */}
                  <button
                    onClick={() => setPaymentGateway('esewa')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      paymentGateway === 'esewa'
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#60bb46]/20 border border-[#60bb46]/40 flex items-center justify-center font-black text-xs text-[#60bb46]">
                      eS
                    </div>
                    <span className="text-xs font-bold text-slate-200">eSewa</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Instant 0% Fee</span>
                  </button>

                  {/* Khalti */}
                  <button
                    onClick={() => setPaymentGateway('khalti')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      paymentGateway === 'khalti'
                        ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/20'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#5c2d91]/30 border border-[#5c2d91]/50 flex items-center justify-center font-black text-xs text-purple-300">
                      KH
                    </div>
                    <span className="text-xs font-bold text-slate-200">Khalti</span>
                    <span className="text-[10px] text-purple-400 font-mono">Wallet Pay</span>
                  </button>

                  {/* ConnectIPS */}
                  <button
                    onClick={() => setPaymentGateway('connectips')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      paymentGateway === 'connectips'
                        ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/20'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-black text-xs text-blue-400">
                      cIPS
                    </div>
                    <span className="text-xs font-bold text-slate-200">ConnectIPS</span>
                    <span className="text-[10px] text-blue-400 font-mono">Direct Bank</span>
                  </button>
                </div>
              </div>

              {/* QR Mockup & Verification Code */}
              <div className="p-5 rounded-2xl bg-[#0a0d14] border border-slate-800 text-center relative overflow-hidden">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-44 h-44 bg-white p-2.5 rounded-xl shadow-lg relative flex items-center justify-center">
                    {/* Stylized QR representation */}
                    <div className="w-full h-full border-4 border-slate-900 grid grid-cols-6 grid-rows-6 p-1 gap-1">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className={`${
                            i % 2 === 0 || i % 7 === 0 || i < 6 || i > 29 || i % 6 === 0
                              ? 'bg-slate-950'
                              : 'bg-white'
                          } rounded-xs`}
                        />
                      ))}
                    </div>
                    {/* Centered logo badge */}
                    <div className="absolute inset-0 m-auto w-10 h-10 bg-[#111622] rounded-lg border-2 border-emerald-500 flex items-center justify-center text-[10px] font-black text-emerald-400">
                      कथाAI
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      {lang === 'ne' ? 'QR कोड स्क्यान गरी भुक्तानी गर्नुहोस्' : 'Scan to Pay via any Mobile Banking / Wallet'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Merchant: ALPHANEX-AI-KATHMANDU • Bill Ref: #NX-842917
                    </p>
                  </div>
                </div>
              </div>

              {/* Pay Button / Back Button */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  {lang === 'ne' ? 'पछाडि फर्किनुहोस्' : 'Change Selection'}
                </button>
                <button
                  onClick={handleProcessPayment}
                  id="confirm-nepali-payment-btn"
                  disabled={checkoutSuccess}
                  className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {checkoutSuccess ? (
                    <>
                      <BadgeCheck className="w-5 h-5 text-slate-950 animate-bounce" />
                      <span>{lang === 'ne' ? 'भुक्तानी सफल भयो!' : 'Payment Verified & Credits Added!'}</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {lang === 'ne'
                          ? `रू ${currentAmount.toLocaleString()} भुक्तानी सम्पन्न गर्नुहोस्`
                          : `Confirm & Pay NPR ${currentAmount.toLocaleString()}`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : activeTab === 'plans' ? (
            /* Monthly Plans Tier Grid */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PRICING_PLANS.map((plan) => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl p-5 border relative flex flex-col justify-between transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-b from-[#161d2d] to-[#111622] border-emerald-500/60 shadow-xl shadow-emerald-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 shadow-md uppercase tracking-wider">
                        {plan.badge || 'Recommended'}
                      </span>
                    )}

                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-100 text-base">
                          {lang === 'ne' ? plan.nameNe : plan.nameEn}
                        </h3>
                      </div>

                      <div className="my-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl md:text-3xl font-extrabold text-slate-100 font-mono">
                            {plan.priceNpr === 0 ? (lang === 'ne' ? 'निःशुल्क' : 'Free') : `रू ${plan.priceNpr}`}
                          </span>
                          {plan.priceNpr > 0 && <span className="text-xs text-slate-400">/mo</span>}
                        </div>
                        <p className="text-xs text-cyan-400 font-medium mt-1 font-mono">
                          {lang === 'ne' ? plan.quotaLabelNe : plan.quotaLabelEn}
                        </p>
                      </div>

                      <ul className="space-y-2.5 my-5 text-xs text-slate-300">
                        {(lang === 'ne' ? plan.featuresNe : plan.featuresEn).map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        if (plan.priceNpr === 0) {
                          onAddCredits(plan.monthlyQuota, plan.nameEn);
                          onClose();
                        } else {
                          setShowCheckout(true);
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        plan.popular
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <span>
                        {plan.priceNpr === 0
                          ? lang === 'ne' ? 'निःशुल्क सुरु गर्नुहोस्' : 'Start Free'
                          : lang === 'ne' ? 'यो योजना छान्नुहोस्' : 'Upgrade Plan'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Quick Top-Up Packs */
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="text-center">
                <h3 className="text-base font-bold text-slate-200">
                  {lang === 'ne' ? 'तत्काल अक्षर क्रेडिट थप्नुहोस्' : 'Instant Character Top-Up Packs'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'ne'
                    ? 'कुनै समय सीमा छैन, जुनसुकै बेला प्रयोग गर्न सकिन्छ।'
                    : 'Credits never expire. Top-up anytime via eSewa / Khalti / ConnectIPS.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {TOP_UP_PACKS.map((pack) => {
                  const isSelected = selectedPack.id === pack.id;
                  return (
                    <div
                      key={pack.id}
                      onClick={() => setSelectedPack(pack)}
                      className={`cursor-pointer p-4 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {pack.popular && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-block mb-2">
                          Best Value
                        </span>
                      )}
                      <p className="text-lg font-bold text-slate-100 font-mono">
                        {lang === 'ne' ? pack.labelNe : pack.labelEn}
                      </p>
                      <p className="text-xl font-extrabold text-emerald-400 mt-2 font-mono">
                        रू {pack.priceNpr}
                      </p>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>
                  {lang === 'ne'
                    ? `${selectedPack.labelNe} को लागि रू ${selectedPack.priceNpr} भुक्तानी गर्नुहोस्`
                    : `Top Up ${selectedPack.labelEn} for NPR ${selectedPack.priceNpr}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Guarantee */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            256-bit SSL Encrypted Payment
          </span>
          <span>Nepal Rastra Bank Licensed Gateways</span>
        </div>
      </div>
    </div>
  );
}
