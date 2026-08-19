import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Crown, Check, Loader2, CreditCard, X } from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

type PlanType = 'month' | '6months' | 'year';

const PLANS = {
  month: { price: 30, cents: '3000', labelEn: '1 Month', labelAr: 'شهر واحد', discount: null },
  '6months': { price: 150, cents: '15000', labelEn: '6 Months', labelAr: '6 شهور', discount: '16%' },
  year: { price: 250, cents: '25000', labelEn: '1 Year', labelAr: 'سنة كاملة', discount: '30%' },
};

export default function Premium() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('month');

  const handleSubscribe = async () => {
    if (!user) {
      setError(language === 'en' ? 'Please log in first' : 'الرجاء تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/payment/paymob/init', {
        userId: user.uid,
        amountCents: PLANS[selectedPlan].cents,
      });

      if (response.data.success && response.data.iframeUrl) {
        window.location.href = response.data.iframeUrl;
      } else {
        throw new Error('Failed to get payment URL');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        (language === 'en' ? 'Failed to initialize payment. Please try again.' : 'فشل تهيئة الدفع. حاول مرة أخرى.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen sm:min-h-[80vh] flex items-center justify-center p-0 sm:p-4 bg-black sm:bg-transparent">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg md:max-w-xl min-h-screen sm:min-h-0 bg-[#141414] sm:rounded-3xl sm:border border-white/10 overflow-hidden shadow-2xl relative flex flex-col"
      >
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="p-8 pb-4 text-center bg-gradient-to-b from-[#E50914]/20 to-transparent flex-shrink-0">
          <div className="w-16 h-16 bg-[#E50914] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(229,9,20,0.5)]">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            {language === 'en' ? 'CineStream Premium' : 'CineStream بريميوم'}
          </h1>
          <p className="text-gray-400">
            {language === 'en' ? 'Unlock the ultimate streaming experience.' : 'افتح تجربة المشاهدة المطلقة.'}
          </p>
        </div>

        <div className="p-8 pt-4 space-y-6 overflow-y-auto flex-grow custom-scrollbar">
          <div className="space-y-4">
            {[
              language === 'en' ? 'Ad-free streaming' : 'مشاهدة بدون إعلانات',
              language === 'en' ? '4K Ultra HD Quality' : 'جودة 4K فائقة الوضوح',
              language === 'en' ? 'Priority servers' : 'سيرفرات أولوية وسريعة'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-300">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-500" />
                </div>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4">
            {(Object.keys(PLANS) as PlanType[]).map((plan) => {
              const details = PLANS[plan];
              const isSelected = selectedPlan === plan;
              return (
                <button
                  key={plan}
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? 'bg-[#E50914]/10 border-[#E50914]' 
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className={`font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {language === 'en' ? details.labelEn : details.labelAr}
                    </span>
                    {details.discount && (
                      <span className="text-xs text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-md mt-1">
                        {language === 'en' ? 'Save' : 'توفير'} {details.discount}
                      </span>
                    )}
                  </div>
                  <div className={`text-xl font-black ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                    {details.price} <span className="text-sm font-normal">EGP</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/10">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#E50914] hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>{language === 'en' ? 'Subscribe via Paymob' : 'اشترك عبر Paymob'}</span>
                </>
              )}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">
              {language === 'en' ? 'Secure payment powered by Paymob' : 'دفع آمن وموثوق عبر منصة Paymob'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
