import React from 'react';
import { motion } from "framer-motion";
import { Check, Zap, Crown, PlayCircle, ShieldCheck, CreditCard, Smartphone, Mail, Bell, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';

export default function Subscription() {
  const { user, profile } = useAuth();
  const [isNotifying, setIsNotifying] = React.useState(false);
  const [notifSuccess, setNotifSuccess] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubscribe = (plan: string) => {
    if (!user) {
      // Prompt login
      return;
    }
    navigate(`/payment?plan=${plan}`);
  };

  const handleWatchAd = () => {
    navigate('/ad-gateway');
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar onSearch={() => {}} />
      
      <main className="pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
        <header className="text-center mb-16 space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tight"
          >
            اختر خطة المشاهدة المناسبة لك
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            استمتع بآلاف الأفلام والمسلسلات بجودة عالية وبدون فواصل إعلانية مع اشتراك بريميوم، أو اختر المشاهدة المجانية بمشاهدة إعلان واحد.
          </motion.p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Ad-based Access */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 flex flex-col hover:bg-zinc-900/80 transition-colors"
          >
            <div className="mb-8">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                <PlayCircle className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">مشاهدة مع إعلان</h3>
              <p className="text-gray-400 text-sm">احصل على ساعة كاملة من المشاهدة المجانية بعد مشاهدة إعلان واحد.</p>
            </div>

            <div className="text-4xl font-bold mb-8">
              مجاناً <span className="text-sm font-normal text-gray-500">/ 60 دقيقة</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="text-green-500 w-5 h-5 flex-shrink-0" />
                <span>دخول لكافة محتوى الموقع</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="text-green-500 w-5 h-5 flex-shrink-0" />
                <span>جودة تصل إلى 720p HD</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="text-green-500 w-5 h-5 flex-shrink-0" />
                <span>متاح لكافة الأجهزة</span>
              </li>
            </ul>

            <button 
              onClick={handleWatchAd}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
            >
              شاهد إعلان الآن
            </button>
          </motion.div>

          {/* Premium Plan */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900 border-2 border-[#E50914] rounded-2xl p-8 flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(229,9,20,0.2)]"
          >
            <div className="absolute top-4 left-4 bg-[#E50914] text-white text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase">
              الأكثر طلباً
            </div>
            
            <div className="mb-8">
              <div className="w-12 h-12 bg-[#E50914]/20 rounded-xl flex items-center justify-center mb-4">
                <Crown className="text-[#E50914]" />
              </div>
              <h3 className="text-2xl font-bold mb-2">بيرميوم VIP</h3>
              <p className="text-gray-400 text-sm">تجربة لا محدودة، جودة فائقة، وبدون أي إعلانات.</p>
            </div>

            <div className="text-4xl font-bold mb-8">
              50 ج.م <span className="text-sm font-normal text-gray-500">/ شهرياً</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <ShieldCheck className="text-[#E50914] w-5 h-5 flex-shrink-0" />
                <span>بدون أي إعلانات نهائياً</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="text-green-500 w-5 h-5 flex-shrink-0" />
                <span>جودة تصل إلى 4K Ultra HD</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="text-green-500 w-5 h-5 flex-shrink-0" />
                <span>دعم كامل لسيرفرات VIP</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="text-green-500 w-5 h-5 flex-shrink-0" />
                <span>إمكانية التحميل للمشاهدة لاحقاً</span>
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe('premium')}
              className="w-full py-4 bg-[#E50914] hover:bg-[#b90710] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#E50914]/30"
            >
              اشترك الآن
            </button>
          </motion.div>

          {/* Payment Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6">
              <h4 className="font-bold flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-gray-400" />
                طرق الدفع في مصر
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 rounded-lg p-3 text-center text-xs text-gray-400 border border-white/5">فودافون كاش</div>
                <div className="bg-black/40 rounded-lg p-3 text-center text-xs text-gray-400 border border-white/5">أورانج كاش</div>
                <div className="bg-black/40 rounded-lg p-3 text-center text-xs text-gray-400 border border-white/5">فوري وبساطة</div>
                <div className="bg-black/40 rounded-lg p-3 text-center text-xs text-gray-400 border border-white/5">فيزا وماستركارد</div>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6 flex-1">
              <h4 className="font-bold flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-[#E50914]" />
                مزايا الدفع المحلي
              </h4>
              <ul className="space-y-3 text-xs text-gray-400">
                <li>• تفعيل فوري للاشتراك</li>
                <li>• لا حاجة لبطاقة دولية</li>
                <li>• دفع آمن عبر Paymob</li>
                <li>• أسعار خاصة للمصريين</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Notification Functionality Preview */}
        {user && (
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 p-8 bg-zinc-950 border border-white/5 rounded-3xl"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Bell className="text-[#E50914]" />
                  مركز التنبيهات (تجريبي)
                </h2>
                <p className="text-gray-400 text-sm">
                  يمكنك الآن تلقي إشعارات عبر البريد الإلكتروني ({user.email}) بخصوص الإصدارات الجديدة وحالة اشتراكك.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  disabled={isNotifying}
                  onClick={async () => {
                    setIsNotifying(true);
                    try {
                      const res = await fetch('/api/notifications/new-release', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ movieTitle: 'Gladiator II', releaseDate: 'قريباً' })
                      });
                      if (res.ok) setNotifSuccess('تم إرسال إشعار الإصدار الجديد بنجاح!');
                    } finally {
                      setIsNotifying(false);
                      setTimeout(() => setNotifSuccess(null), 3000);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>تجربة إشعار فيلم جديد</span>
                </button>
                
                <button 
                  disabled={isNotifying}
                  onClick={async () => {
                    setIsNotifying(true);
                    try {
                      const res = await fetch('/api/notifications/check-expirations', {
                        method: 'POST'
                      });
                      if (res.ok) setNotifSuccess('تم التحقق من الاشتراكات المنتهية بنجاح!');
                    } finally {
                      setIsNotifying(false);
                      setTimeout(() => setNotifSuccess(null), 3000);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  <span>فحص صلاحية الاشتراك</span>
                </button>
              </div>
            </div>
            
            {notifSuccess && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-center text-sm font-bold"
              >
                {notifSuccess}
              </motion.div>
            )}
          </motion.section>
        )}
      </main>
    </div>
  );
}
