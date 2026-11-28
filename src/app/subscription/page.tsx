"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Check, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  Tv, 
  Download, 
  Volume2, 
  Zap, 
  CreditCard,
  QrCode,
  Wallet,
  Coins,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { brandConfig } from '@/config/brand.config';

interface PlanDetail {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  quality: string;
  screens: number;
  features: string[];
  isPopular?: boolean;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, upgradeSubscription } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanDetail | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'paypal' | 'crypto'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Form states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [upiId, setUpiId] = useState('user@okhdfcbank');

  const PLANS: PlanDetail[] = [
    {
      id: "plan_free",
      name: "FREE",
      priceMonthly: 0,
      priceYearly: 0,
      quality: "720p HD",
      screens: 1,
      features: [
        "Ad-supported streaming",
        "720p standard high definition",
        "Stream on 1 device at a time",
        "Access to select movies & series",
        "Stereo 2.0 Audio"
      ]
    },
    {
      id: "plan_basic",
      name: "BASIC",
      priceMonthly: 4.99,
      priceYearly: 49.99,
      quality: "1080p Full HD",
      screens: 2,
      features: [
        "100% Ad-Free experience",
        "1080p Full HD streaming",
        "Stream on 2 devices simultaneously",
        "Full Hollywood & Anime catalog",
        "Dolby Digital 5.1 Surround"
      ]
    },
    {
      id: "plan_standard",
      name: "STANDARD",
      priceMonthly: 9.99,
      priceYearly: 99.99,
      quality: "1080p FHD + Downloads",
      screens: 4,
      isPopular: true,
      features: [
        "100% Ad-Free streaming",
        "1080p Full HD with HDR10",
        "Stream on 4 devices simultaneously",
        "Offline downloads on up to 4 devices",
        "Unlimited Watchlist & History sync",
        "Early access to PROZ Originals"
      ]
    },
    {
      id: "plan_premium",
      name: "PREMIUM VIP",
      priceMonthly: 14.99,
      priceYearly: 149.99,
      quality: "4K UHD + HDR + Atmos",
      screens: 6,
      features: [
        "Ultimate 4K Ultra HD resolution",
        "Dolby Vision & HDR10+ support",
        "Dolby Atmos 7.1 Spatial Audio",
        "Stream on 6 screens simultaneously",
        "Unlimited offline downloads",
        "VIP Premiere screenings access",
        "Priority Customer Support"
      ]
    }
  ];

  const handleSelectPlan = (plan: PlanDetail) => {
    setSelectedPlanForCheckout(plan);
  };

  const handleExecutePayment = async () => {
    if (!selectedPlanForCheckout) return;
    setIsProcessing(true);

    try {
      // Simulate or call server-side checkout verification
      await fetch('/api/webhooks/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'payment.succeeded',
          userId: user?.id || 'demo_user',
          planId: selectedPlanForCheckout.id,
          paymentMethod,
          amount: billingCycle === 'yearly' ? selectedPlanForCheckout.priceYearly : selectedPlanForCheckout.priceMonthly,
          currency: 'USD',
          status: 'succeeded'
        }),
      }).catch(() => {});

      // Update state in client context
      upgradeSubscription(selectedPlanForCheckout.id);
      setIsProcessing(false);
      setPaymentSuccess(true);

      setTimeout(() => {
        setPaymentSuccess(false);
        setSelectedPlanForCheckout(null);
        router.push('/');
      }, 2500);
    } catch (e) {
      setIsProcessing(false);
      upgradeSubscription(selectedPlanForCheckout.id);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setSelectedPlanForCheckout(null);
      }, 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title & Tagline */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-proz-purple/20 text-proz-purple border border-proz-purple/30">
          PROZ Entertainment Subscriptions
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-proz-white tracking-tight">
          Choose the Perfect Entertainment Plan
        </h1>
        <p className="text-xs sm:text-sm text-proz-grey">
          Stream in stunning 4K UHD with adaptive bitrate, Dolby Atmos audio, and multi-screen access. Cancel anytime with zero fees.
        </p>

        {/* Billing Cycle Switcher */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <div className="p-1 rounded-full glass-card border border-proz-border/50 flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-proz-purple to-proz-cyan text-proz-white shadow-cyan-glow'
                  : 'text-proz-grey hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-proz-purple to-proz-cyan text-proz-white shadow-cyan-glow'
                  : 'text-proz-grey hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = user?.subscription?.planId === plan.id;
          const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                plan.isPopular
                  ? 'glass-card border-2 border-proz-cyan shadow-cyan-glow transform lg:-translate-y-2'
                  : isCurrent
                  ? 'glass-card border border-emerald-500/50'
                  : 'glass-card border border-proz-border/50 hover:border-proz-cyan/40'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-proz-purple to-proz-cyan text-white text-[11px] font-extrabold tracking-wider uppercase shadow-cyan-glow">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-proz-white">{plan.name}</h3>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                      Current Plan
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-proz-white">
                    ${price}
                  </span>
                  <span className="text-xs text-proz-grey">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-proz-navy/70 border border-proz-border/40 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-proz-white font-medium">
                    <span>Quality</span>
                    <span className="text-proz-cyan">{plan.quality}</span>
                  </div>
                  <div className="flex items-center justify-between text-proz-white font-medium">
                    <span>Max Screens</span>
                    <span>{plan.screens} {plan.screens === 1 ? 'Screen' : 'Screens'}</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 pt-2 text-xs text-proz-grey">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-proz-cyan shrink-0 mt-0.5" />
                      <span className="text-proz-white/90 leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 rounded-full text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                      : plan.isPopular
                      ? 'glass-button-primary shadow-cyan-glow'
                      : 'glass-button-secondary hover:border-proz-cyan/40'
                  }`}
                >
                  {isCurrent ? 'Current Plan (Change)' : plan.priceMonthly === 0 ? 'Select Free' : `Get ${plan.name}`}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Checkout Modal with Multi-Payment Options */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-proz-midnight/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl glass-card border border-proz-border/60 shadow-glass-lg space-y-5">
            
            <div className="flex items-center justify-between border-b border-proz-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-proz-white">
                  Confirm Subscription & Payment
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlanForCheckout(null)}
                className="text-proz-grey hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-proz-white">Subscription Activated!</h4>
                <p className="text-xs text-proz-grey">
                  Welcome to {selectedPlanForCheckout.name} VIP. Enjoy unrestricted 4K entertainment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Plan Summary */}
                <div className="p-4 rounded-2xl bg-proz-navy/70 border border-proz-border/40 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-proz-white">{selectedPlanForCheckout.name} VIP</h4>
                    <p className="text-xs text-proz-cyan">{selectedPlanForCheckout.quality} · {selectedPlanForCheckout.screens} Screens</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-proz-white">
                      ${billingCycle === 'yearly' ? selectedPlanForCheckout.priceYearly : selectedPlanForCheckout.priceMonthly}
                    </span>
                    <span className="text-[10px] text-proz-grey block">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-proz-grey">Select Payment Method</label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-proz-cyan bg-proz-cyan/15 text-white shadow-cyan-glow'
                          : 'border-[#334155]/60 bg-[#111827] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-proz-cyan" />
                      <span className="text-[10px]">Cards</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-proz-cyan bg-proz-cyan/15 text-white shadow-cyan-glow'
                          : 'border-[#334155]/60 bg-[#111827] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px]">UPI / QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'paypal'
                          ? 'border-proz-cyan bg-proz-cyan/15 text-white shadow-cyan-glow'
                          : 'border-[#334155]/60 bg-[#111827] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px]">PayPal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('crypto')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'crypto'
                          ? 'border-proz-cyan bg-proz-cyan/15 text-white shadow-cyan-glow'
                          : 'border-[#334155]/60 bg-[#111827] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="text-[10px]">Crypto</span>
                    </button>
                  </div>
                </div>

                {/* Conditional Payment Method Fields */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-proz-elevated/70 border border-proz-border text-xs">
                    <div>
                      <label className="text-[10px] text-proz-grey font-semibold block mb-1">Card Number (Visa / Mastercard / Amex)</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 glass-input rounded-xl font-mono text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-proz-grey font-semibold block mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 glass-input rounded-xl font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-proz-grey font-semibold block mb-1">Security Code (CVC)</label>
                        <input
                          type="password"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full px-3 py-2 glass-input rounded-xl font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-proz-elevated/70 border border-proz-border text-xs">
                    <div>
                      <label className="text-[10px] text-proz-grey font-semibold block mb-1">UPI ID / VPA (Google Pay, PhonePe, Paytm, BHIM)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okaxis"
                        className="w-full px-3 py-2 glass-input rounded-xl font-mono text-xs"
                      />
                    </div>
                    <p className="text-[10px] text-proz-grey">A payment request will be sent to your UPI app for instant approval.</p>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="p-3.5 rounded-2xl bg-proz-elevated/70 border border-proz-border text-xs space-y-2">
                    <p className="text-xs text-proz-white font-semibold">PayPal One-Click Checkout</p>
                    <p className="text-[11px] text-proz-grey">You will be safely redirected to PayPal to complete your subscription authorization.</p>
                  </div>
                )}

                {paymentMethod === 'crypto' && (
                  <div className="p-3.5 rounded-2xl bg-proz-elevated/70 border border-proz-border text-xs space-y-2">
                    <p className="text-xs text-proz-cyan font-semibold">Web3 &amp; Crypto Payments</p>
                    <p className="text-[11px] text-proz-grey">Supports USDT (TRC-20 / ERC-20), Bitcoin, and Ethereum via decentralized gateway.</p>
                  </div>
                )}

                <button
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-full glass-button-primary text-xs font-bold shadow-cyan-glow flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>Authorizing Payment with Provider...</span>
                  ) : (
                    <span>
                      Pay ${billingCycle === 'yearly' ? selectedPlanForCheckout.priceYearly : selectedPlanForCheckout.priceMonthly} &amp; Activate Plan
                    </span>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
