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
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
    if (plan.id === user?.subscription?.planId) return;
    setSelectedPlanForCheckout(plan);
  };

  const handleExecutePayment = async () => {
    if (!selectedPlanForCheckout) return;
    setIsProcessing(true);

    try {
      // Simulate or call server-side checkout verification
      const res = await fetch('/api/webhooks/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'payment.succeeded',
          userId: user?.id || 'demo_user',
          planId: selectedPlanForCheckout.id,
          amount: billingCycle === 'yearly' ? selectedPlanForCheckout.priceYearly : selectedPlanForCheckout.priceMonthly,
          currency: 'USD',
          status: 'succeeded'
        }),
      });

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
      alert('Payment processing failed. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title & Tagline */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-proz-purple/20 text-proz-purple border border-proz-purple/30">
          PROZ MOVIE Subscriptions
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
                  disabled={isCurrent}
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 rounded-full text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                      : plan.isPopular
                      ? 'glass-button-primary shadow-cyan-glow'
                      : 'glass-button-secondary hover:border-proz-cyan/40'
                  }`}
                >
                  {isCurrent ? 'Active Plan' : plan.priceMonthly === 0 ? 'Downgrade to Free' : `Upgrade to ${plan.name}`}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-proz-midnight/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl glass-card border border-proz-border/60 shadow-glass-lg space-y-5">
            
            <div className="flex items-center justify-between border-b border-proz-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-proz-white">
                  Confirm Subscription
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
                <div className="p-4 rounded-2xl bg-proz-navy/70 border border-proz-border/40 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-proz-white">{selectedPlanForCheckout.name}</h4>
                    <p className="text-xs text-proz-cyan">{selectedPlanForCheckout.quality}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-proz-white">
                      ${billingCycle === 'yearly' ? selectedPlanForCheckout.priceYearly : selectedPlanForCheckout.priceMonthly}
                    </span>
                    <span className="text-[10px] text-proz-grey block">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-proz-grey">Payment Gateway</label>
                  <div className="p-3 rounded-xl border border-proz-cyan/40 bg-proz-cyan/10 flex items-center justify-between text-xs text-proz-white">
                    <span className="flex items-center gap-2 font-medium">
                      <CreditCard className="w-4 h-4 text-proz-cyan" />
                      PROZ Instant Sandbox / Stripe Gateway
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">READY</span>
                  </div>
                </div>

                <button
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-full glass-button-primary text-xs font-bold shadow-cyan-glow flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>Verifying with Payment Provider...</span>
                  ) : (
                    <span>
                      Pay ${billingCycle === 'yearly' ? selectedPlanForCheckout.priceYearly : selectedPlanForCheckout.priceMonthly} & Start Streaming
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
