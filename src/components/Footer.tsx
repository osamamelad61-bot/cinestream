import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';
import { Film, Zap, Search, Heart, User, Smartphone, Moon, Sparkles } from 'lucide-react';
import VisitorCount from './VisitorCount';

export default function Footer() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const features = [
    {
      icon: <Film className="w-5 h-5 text-red-500" />,
      textEn: "Massive movie & series browsing experience",
      textAr: "تجربة تصفح هائلة للأفلام والمسلسلات"
    },
    {
      icon: <Sparkles className="w-5 h-5 text-yellow-500" />,
      textEn: "Cinematic UI with smooth transitions",
      textAr: "واجهة مستخدم سينمائية مع انتقالات سلسة"
    },
    {
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      textEn: "Fast and optimized performance",
      textAr: "أداء سريع ومحسن"
    },
    {
      icon: <Search className="w-5 h-5 text-green-500" />,
      textEn: "Smart search system",
      textAr: "نظام بحث ذكي"
    },
    {
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      textEn: "Personalized watchlists & favorites",
      textAr: "قوائم مشاهدة ومفضلات شخصية"
    },
    {
      icon: <User className="w-5 h-5 text-purple-500" />,
      textEn: "Secure user accounts and authentication",
      textAr: "حسابات مستخدمين آمنة ومصادقة"
    },
    {
      icon: <Smartphone className="w-5 h-5 text-orange-500" />,
      textEn: "Fully responsive design for all devices",
      textAr: "تصميم مستجيب تماماً لجميع الأجهزة"
    },
    {
      icon: <Moon className="w-5 h-5 text-indigo-500" />,
      textEn: "Elegant dark theme for binge watching",
      textAr: "سمة داكنة أنيقة للمشاهدة المتواصلة"
    }
  ];

  return (
    <footer className="relative mt-20 border-t border-[var(--border-color)] bg-[var(--nav-bg)]/80 backdrop-blur-xl overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Decorative background artifacts */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 blur-[120px] rounded-full -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-start">
          
          {/* Brand & Description Section */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">CineStream</span>
                <span className="text-sm font-medium px-2 py-0.5 rounded-full border border-red-500/30 text-red-400 bg-red-500/10">PREMIUM</span>
              </h2>
              
              <div className="space-y-4 text-gray-400 leading-relaxed text-lg lg:max-w-md">
                <p className="font-medium text-white/90">
                  {isAr 
                    ? "CineStream ليس مجرد موقع أفلام... إنه عالم سينمائي متكامل تم بناؤه لعشاق الترفيه الحقيقيين."
                    : "CineStream isn’t just a movie website… it’s a complete cinematic universe built for true entertainment lovers."
                  }
                </p>
                <p>
                  {isAr
                    ? "منصة بث حديثة وأنيقة بواجهة داكنة فاخرة، ورسوم متحركة سلسة، وأداء فائق السرعة، وتجربة مستخدم متميزة مستوحاة من أكبر خدمات البث في العالم."
                    : "A sleek, modern streaming platform with a luxurious dark interface, smooth animations, blazing-fast performance, and a premium user experience inspired by the world’s biggest streaming services."
                  }
                </p>
                <p>
                  {isAr
                    ? "منذ اللحظة التي تدخل فيها إلى الصفحة الرئيسية، يتم الترحيب بك بأقسام بطولية ديناميكية، وأفلام رائجة، وبحث قوي، ومجموعات مصنفة، ومرئيات غامرة تجعل كل زيارة تبدو وكأنها خطوة داخل سينما حقيقية."
                    : "From the moment you enter the homepage, you’re welcomed with dynamic hero sections, trending movies, powerful search, categorized collections, and immersive visuals that make every visit feel like stepping into a real cinema."
                  }
                </p>
              </div>
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: isAr ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid gap-6"
            >
              <h3 className="text-xl font-semibold text-white/90 mb-2">
                {isAr ? "لماذا CineStream؟" : "Why CineStream?"}
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="mt-1 p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                      {feature.icon}
                    </div>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-snug">
                      {isAr ? feature.textAr : feature.textEn}
                    </p>
                  </div>
                ))}
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-gray-500 italic text-sm border-t border-white/5 pt-8"
              >
                {isAr
                  ? "يجمع CineStream بين الوظائف القوية والجمالية المتميزة لإنشاء تجربة بث من الجيل التالي تبدو حديثة وغامرة ولا تُنسى."
                  : "CineStream combines powerful functionality with a premium aesthetic to create a next-generation streaming experience that feels modern, immersive, and unforgettable."
                }
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} CineStream. {isAr ? "جميع الحقوق محفوظة. تم التطوير بكل حب لعشاق السينما." : "All rights reserved. Built with passion for cinema lovers."}</p>
          <div className="flex items-center gap-6">
            <VisitorCount />
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">{isAr ? "الخصوصية" : "Privacy"}</a>
              <a href="#" className="hover:text-white transition-colors">{isAr ? "الشروط" : "Terms"}</a>
              <a href="#" className="hover:text-white transition-colors">{isAr ? "دعم" : "Support"}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
