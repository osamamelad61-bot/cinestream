import React, { useState } from 'react';
import { motion } from "framer-motion";
import { CreditCard, Wallet, Smartphone, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { upgradeToPremium } from '@/services/firebaseService';
import Navbar from '@/components/Navbar';

export default function Payment() {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'premium';
  const [method, setMethod] = useState<'card' | 'wallet' | 'fawry'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!user) return;
    setIsProcessing(true);
    
    try {
      // 1. Initiate payment (mock)
      const initPath = method === 'card' ? '/api/payment/paymob/initiate' : '/api/payment/fawry/initiate';
      const initRes = await fetch(initPath, { method: 'POST' });
      const initData = await initRes.json();
      
      // 2. Simulate "callback" from payment gateway
      // In production, Paymob would hit our backend webhook directly.
      // Here we simulate the successful verification call.
      const verifyRes = await fetch('/api/payment/verify-and-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          plan: plan,
          paymentId: initData.paymentId
        })
      });
      
      if (verifyRes.ok) {
        // Perform client-side update as fallback for backend permission issues
        await upgradeToPremium(user.uid, initData.paymentId);
        
        setIsSuccess(true);
        await refreshProfile();
        
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('حدث خطأ أثناء معالجة الدفع. يرجى المحاولة لاحقاً.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center p-6 text-white text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 max-w-md">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="text-green-500 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold">تم الدفع بنجاح!</h2>
          <p className="text-gray-400">مبروك! حسابك الآن بريميوم VIP. سيتم تحويلك للصفحة الرئيسية واستمتع بمشاهدة لا محدودة.</p>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
             <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3 }} className="h-full bg-green-500" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar onSearch={() => {}} />
      <main className="pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <header className="space-y-2">
              <h1 className="text-3xl font-bold">طريقة الدفع</h1>
              <p className="text-gray-400">اختر الطريقة المفضلة لديك للدفع في مصر.</p>
            </header>

            <div className="space-y-4">
              <button 
                onClick={() => setMethod('card')}
                className={`w-full p-6 rounded-2xl border transition-all flex items-center gap-4 ${method === 'card' ? 'bg-[#E50914]/10 border-[#E50914]' : 'bg-zinc-900 border-white/5 hover:border-white/10'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method === 'card' ? 'bg-[#E50914] text-white' : 'bg-white/5 text-gray-400'}`}>
                  <CreditCard />
                </div>
                <div className="text-right flex-1">
                  <p className="font-bold">البطاقات البنكية</p>
                  <p className="text-xs text-gray-500">فيزا وماستركارد وكافة الكروت مسبقة الدفع</p>
                </div>
              </button>

              <button 
                onClick={() => setMethod('wallet')}
                className={`w-full p-6 rounded-2xl border transition-all flex items-center gap-4 ${method === 'wallet' ? 'bg-[#E50914]/10 border-[#E50914]' : 'bg-zinc-900 border-white/5 hover:border-white/10'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method === 'wallet' ? 'bg-[#E50914] text-white' : 'bg-white/5 text-gray-400'}`}>
                  <Smartphone />
                </div>
                <div className="text-right flex-1">
                  <p className="font-bold">المحافظ الإلكترونية (كاش)</p>
                  <p className="text-xs text-gray-500">فودافون كاش، أورانج، اتصالات كاش</p>
                </div>
              </button>

              <button 
                onClick={() => setMethod('fawry')}
                className={`w-full p-6 rounded-2xl border transition-all flex items-center gap-4 ${method === 'fawry' ? 'bg-[#E50914]/10 border-[#E50914]' : 'bg-zinc-900 border-white/5 hover:border-white/10'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method === 'fawry' ? 'bg-[#E50914] text-white' : 'bg-white/5 text-gray-400'}`}>
                  <Wallet />
                </div>
                <div className="text-right flex-1">
                  <p className="font-bold">الدفع عبر فوري</p>
                  <p className="text-xs text-gray-500">ادفع في أي كشك أو نقطة فوري قريبة منك</p>
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900 rounded-2xl p-8 space-y-6 border border-white/5">
              <h3 className="text-xl font-bold border-b border-white/5 pb-4">ملخص الطلب</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold">الخطة:</span>
                  <span className="bg-[#E50914]/20 text-[#E50914] px-2 py-1 rounded text-xs font-bold tracking-widest uppercase">
                    {plan === 'premium' ? 'بيرميوم VIP' : plan}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold">المدة:</span>
                  <span>شهر واحد</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold border-t border-white/5 pt-4 mt-6">
                  <span>الإجمالي:</span>
                  <span>50 ج.م</span>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-4 bg-[#E50914] hover:bg-[#b90710] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#E50914]/30 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>إتمام الدفع</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 justify-center text-gray-500">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px]">دفع آمن بالكامل عبر Paymob</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                بإتمامك لهذه العملية أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بـ CineStream.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
