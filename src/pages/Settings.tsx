import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Key, ShieldCheck, User, Mail, Trash2, Camera, Globe, Calendar, FileText, AlertTriangle, Eye, EyeOff, Upload } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useFeedback } from '@/context/FeedbackContext';
import { getUserProfile, updateUserSettings, changeUserPassword, changeUserEmail, deleteUserAccount } from '@/services/firebaseService';

import { AVATAR_COLLECTIONS } from '@/data/avatars';

type SettingsTab = 'profile' | 'security' | 'account';

export default function Settings() {
  const { user, profile, refreshProfile, logout } = useAuth();
  const { t, language } = useLanguage();
  const { showFeedback } = useFeedback();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [avatarCategory, setAvatarCategory] = useState<keyof typeof AVATAR_COLLECTIONS>('portraits');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile State
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bio, setBio] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  
  // Security State
  const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Delete State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then((p) => {
        if (p) {
          setDisplayName(p.displayName || user.displayName || '');
          setPhotoURL(p.photoURL || user.photoURL || '');
          setBio(p.bio || '');
          setBirthDate(p.birthDate || '');
          setCountry(p.country || '');
        }
        setLoading(false);
      });
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateUserSettings(user.uid, {
        displayName,
        photoURL,
        bio,
        birthDate,
        country
      });
      await refreshProfile();
      showFeedback(
        language === 'en' ? 'Profile updated successfully!' : 'تم تحديث الملف الشخصي بنجاح!',
        'success'
      );
    } catch (error) {
      showFeedback(
        language === 'en' ? 'Failed to update profile.' : 'فشل تحديث الملف الشخصي.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showFeedback(
        language === 'en' ? 'Passwords do not match.' : 'كلمات المرور غير متوافقة.',
        'warning'
      );
      return;
    }
    if (newPassword.length < 6) {
      showFeedback(
        language === 'en' ? 'Password must be at least 6 characters.' : 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.',
        'warning'
      );
      return;
    }

    setSaving(true);
    try {
      await changeUserPassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setOldPassword('');
      showFeedback(
        language === 'en' ? 'Password changed successfully!' : 'تم تغيير كلمة المرور بنجاح!',
        'success'
      );
    } catch (error: any) {
      if (error.message.includes('auth/requires-recent-login')) {
         showFeedback(
           language === 'en' ? 'Please log out and log in again to change your password.' : 'يرجى تسجيل الخروج والولوج مجدداً لتغيير كلمة المرور.',
           'error'
         );
      } else {
        showFeedback(
          language === 'en' ? 'Failed to change password.' : 'فشل تغيير كلمة المرور.',
          'error'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || newEmail === user?.email) return;

    setSaving(true);
    try {
      await changeUserEmail(newEmail);
      showFeedback(
        language === 'en' ? `Verification email sent to ${newEmail}. Please verify to complete the update.` : `تم إرسال رسالة تأكيد إلى ${newEmail}. يرجى القبول لإتمام التغيير.`,
        'success'
      );
    } catch (error: any) {
      if (error.message.includes('auth/requires-recent-login')) {
        showFeedback(
          language === 'en' ? 'Please log out and log in again to change your email.' : 'يرجى تسجيل الخروج والولوج مجدداً لتغيير بريدك الإلكتروني.',
          'error'
        );
      } else {
        showFeedback(
          language === 'en' ? 'Failed to initiate email change.' : 'فشل بدء تغيير البريد الإلكتروني.',
          'error'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUserAccount();
      await logout();
      showFeedback(
        language === 'en' ? 'Account deleted successfully.' : 'تم حذف الحساب بنجاح.',
        'info'
      );
    } catch (error: any) {
      if (error.message.includes('auth/requires-recent-login')) {
        showFeedback(
          language === 'en' ? 'Please log out and log in again to delete your account.' : 'يرجى تسجيل الخروج والولوج مجدداً لحذف حسابك.',
          'error'
        );
      } else {
        showFeedback(
          language === 'en' ? 'Failed to delete account. You might need to re-authenticate.' : 'فشل حذف الحساب. قد تحتاج إلى إعادة تسجيل الدخول.',
          'error'
        );
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <div className="flex h-[70vh] items-center justify-center p-4">
           <div className="text-center">
              <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold">{language === 'en' ? 'Please log in to access settings' : 'يرجى تسجيل الدخول للوصول إلى الإعدادات'}</h2>
           </div>
        </div>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback(
        language === 'en' ? 'Please select an image file.' : 'يرجى اختيار ملف صورة.',
        'warning'
      );
      return;
    }

    if (file.size > 1024 * 1024) {
      showFeedback(
        language === 'en' ? 'Image size must be less than 1MB.' : 'يجب أن يكون حجم الصورة أقل من 1 ميجابايت.',
        'warning'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhotoURL(base64);
      showFeedback(
        language === 'en' ? 'Image uploaded locally. Click "Update Profile" to save.' : 'تم رفع الصورة محلياً. اضغط "تحديث الملف" للحفظ.',
        'info'
      );
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: 'profile', icon: User, label: language === 'en' ? 'Profile' : 'الملف الشخصي' },
    { id: 'security', icon: ShieldCheck, label: language === 'en' ? 'Security' : 'الأمان' },
    { id: 'account', icon: Trash2, label: language === 'en' ? 'Account' : 'الحساب' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 pt-28 pb-12 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black md:text-5xl tracking-tighter">
              {language === 'en' ? 'Settings' : 'الإعدادات'}
            </h1>
            <p className="mt-2 text-gray-500 font-medium">
              {language === 'en' ? 'Manage your account and preferences' : 'إدارة حسابك وتفضيلاتك'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-1 rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] p-3 shadow-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                    activeTab === tab.id 
                    ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/20 scale-[1.02]' 
                    : 'text-gray-400 hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 md:p-10 shadow-2xl"
              >
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSave} className="space-y-8">
                    <div className="flex flex-col md:flex-row items-center gap-8 border-b border-[var(--border-color)] pb-8">
                       <div className="relative group">
                          <div className="h-32 w-32 rounded-full border-4 border-[var(--border-color)] bg-[var(--bg-primary)] overflow-hidden shadow-xl">
                             <img 
                               src={photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                               alt="Profile" 
                               className="h-full w-full object-cover"
                             />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                             <Camera className="text-white h-8 w-8" />
                          </div>
                       </div>
                       <div className="flex-1 space-y-2 text-center md:text-left">
                          <h2 className="text-2xl font-black">{language === 'en' ? 'Profile Details' : 'تفاصيل الملف الشخصي'}</h2>
                          <p className="text-sm text-gray-500">{language === 'en' ? 'Update your personal information and profile picture.' : 'تحديث معلوماتك الشخصية وصورة ملفك الشخصي.'}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <User className="h-3 w-3" /> {language === 'en' ? 'Full Name' : 'الاسم الكامل'}
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-5 py-3 outline-none focus:border-[#E50914] focus:ring-4 focus:ring-[#E50914]/10 transition-all"
                        />
                      </div>

                      <div className="space-y-6 md:col-span-2">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <Camera className="h-3 w-3" /> {language === 'en' ? 'Profile Avatar' : 'الصورة الرمزية'}
                          </label>
                          <div className="flex items-center gap-4 text-xs font-bold text-[#E50914] bg-[#E50914]/10 px-3 py-1.5 rounded-full">
                            <span className="animate-pulse">●</span>
                            {language === 'en' ? 'Over 100+ Avatars Available' : 'أكثر من 100 صورة متاحة'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-black/40 p-6 rounded-[2.5rem] border border-white/5 shadow-inner">
                          {/* Left: Category Selector */}
                          <div className="md:col-span-3 space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                            {Object.keys(AVATAR_COLLECTIONS).map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setAvatarCategory(cat as any)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-tighter transition-all group ${
                                  avatarCategory === cat 
                                  ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/20' 
                                  : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                <span>
                                  {cat === 'portraits' ? (language === 'en' ? 'Portraits' : 'بورتريه') :
                                   cat === 'lifestyle' ? (language === 'en' ? 'Lifestyle' : 'لايف ستايل') :
                                   cat === 'nature' ? (language === 'en' ? 'Nature' : 'طبيعة') :
                                   (language === 'en' ? cat : cat)}
                                </span>
                                <span className={`text-[9px] opacity-50 ${avatarCategory === cat ? 'text-white' : 'text-gray-600'}`}>
                                  {AVATAR_COLLECTIONS[cat as keyof typeof AVATAR_COLLECTIONS]?.length}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* Right: Grid */}
                          <div className="md:col-span-9 space-y-4">
                            <div className="flex flex-wrap gap-3 max-h-[350px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
                              <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                                accept="image/*" 
                                className="hidden" 
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-16 w-16 md:h-20 md:w-20 rounded-full border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 hover:border-[#E50914] hover:text-[#E50914] transition-all bg-white/5 shrink-0 group"
                                title={language === 'en' ? 'Upload' : 'رفع'}
                              >
                                <Upload className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] mt-1 uppercase font-bold text-gray-600 group-hover:text-[#E50914]">{language === 'en' ? 'Custom' : 'مخصص'}</span>
                              </button>
                              
                              {user.providerData[0]?.photoURL && (
                                <button
                                  type="button"
                                  onClick={() => setPhotoURL(user.providerData[0].photoURL!)}
                                  className={`h-16 w-16 md:h-20 md:w-20 rounded-full border-4 transition-all overflow-hidden bg-white/5 shrink-0 ${
                                    photoURL === user.providerData[0].photoURL ? 'border-[#E50914] scale-105 shadow-xl shadow-[#E50914]/40 z-10' : 'border-transparent hover:border-white/20'
                                  }`}
                                >
                                  <img src={user.providerData[0].photoURL} alt="Account" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                </button>
                              )}

                              <AnimatePresence mode="popLayout">
                                {AVATAR_COLLECTIONS[avatarCategory]?.map((avatar, idx) => (
                                  <motion.button
                                    key={avatar.url}
                                    type="button"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.02 }}
                                    onClick={() => setPhotoURL(avatar.url)}
                                    className={`h-16 w-16 md:h-20 md:w-20 rounded-full border-4 transition-all overflow-hidden bg-white/5 shrink-0 ${
                                      photoURL === avatar.url ? 'border-[#E50914] scale-105 shadow-xl shadow-[#E50914]/40 z-10' : 'border-transparent hover:border-white/20 hover:scale-105'
                                    }`}
                                    title={avatar.name}
                                  >
                                    <img 
                                      src={avatar.url} 
                                      alt={avatar.name} 
                                      className="h-full w-full object-cover" 
                                      referrerPolicy="no-referrer"
                                      loading="lazy"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${avatar.name}&background=random`;
                                      }}
                                    />
                                  </motion.button>
                                ))}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <FileText className="h-3 w-3" /> {language === 'en' ? 'Bio' : 'نبذة تعريفية'}
                        </label>
                        <textarea
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder={language === 'en' ? 'Tell us something about yourself...' : 'أخبرنا شيئاً عن نفسك...'}
                          className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-5 py-3 outline-none focus:border-[#E50914] focus:ring-4 focus:ring-[#E50914]/10 transition-all resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <Calendar className="h-3 w-3" /> {language === 'en' ? 'Birthday' : 'تاريخ الميلاد'}
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-5 py-3 outline-none focus:border-[#E50914] focus:ring-4 focus:ring-[#E50914]/10 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <Globe className="h-3 w-3" /> {language === 'en' ? 'Country' : 'البلد'}
                        </label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder={language === 'en' ? 'Egypt, Saudi Arabia...' : 'مصر، السعودية...'}
                          className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-5 py-3 outline-none focus:border-[#E50914] focus:ring-4 focus:ring-[#E50914]/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                       <button
                         type="submit"
                         disabled={saving}
                         className="flex items-center gap-2 rounded-2xl bg-[#E50914] px-8 py-4 font-bold text-white shadow-lg shadow-[#E50914]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                       >
                         {saving ? <div className="h-5 w-5 animate-spin border-2 border-white/30 border-t-white rounded-full" /> : <Save className="h-5 w-5" />}
                         <span>{language === 'en' ? 'Update Profile' : 'تحديث الملف الشخصي'}</span>
                       </button>
                    </div>
                  </form>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-12">
                    {/* Email Change */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
                        <Mail className="h-6 w-6 text-[#E50914]" />
                        <h3 className="text-xl font-bold">{language === 'en' ? 'Update Email' : 'تحديث البريد الإلكتروني'}</h3>
                      </div>
                      <form onSubmit={handleEmailChange} className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{language === 'en' ? 'Current Email' : 'البريد الحالي'}</label>
                           <input 
                             type="email" 
                             disabled 
                             value={user?.email || ''} 
                             className="w-full rounded-2xl border border-[var(--border-color)] bg-gray-500/5 px-5 py-3 text-gray-500 cursor-not-allowed"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{language === 'en' ? 'New Email' : 'البريد الجديد'}</label>
                           <input 
                             type="email" 
                             value={newEmail} 
                             onChange={(e) => setNewEmail(e.target.value)}
                             required
                             placeholder={language === 'en' ? 'Enter new email address' : 'أدخل عنوان بريدك الجديد'}
                             className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-5 py-3 outline-none focus:border-[#E50914] focus:ring-4 focus:ring-[#E50914]/10 transition-all"
                           />
                        </div>
                        <button
                          type="submit"
                          disabled={saving || !newEmail || newEmail === user?.email}
                          className="rounded-2xl bg-[#E50914] px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          {language === 'en' ? 'Change Email' : 'تغيير البريد'}
                        </button>
                      </form>
                    </section>

                    {/* Password Change */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
                        <Key className="h-6 w-6 text-[#E50914]" />
                        <h3 className="text-xl font-bold">{language === 'en' ? 'Change Password' : 'تغيير كلمة المرور'}</h3>
                      </div>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 relative">
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{language === 'en' ? 'Old Password' : 'كلمة السر القديمة'}</label>
                             <input 
                               type={showPasswords ? "text" : "password"}
                               value={oldPassword} 
                               onChange={(e) => setOldPassword(e.target.value)}
                               className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-5 py-3 outline-none focus:border-[#E50914] transition-all"
                             />
                          </div>
                          <div className="hidden md:block"></div>
                          
                          <div className="space-y-2 relative">
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{language === 'en' ? 'New Password' : 'كلمة السر الجديدة'}</label>
                             <input 
                               type={showPasswords ? "text" : "password"}
                               value={newPassword} 
                               onChange={(e) => setNewPassword(e.target.value)}
                               className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-5 py-3 outline-none focus:border-[#E50914] transition-all"
                             />
                          </div>
                          <div className="space-y-2 relative">
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{language === 'en' ? 'Confirm New Password' : 'تأكيد كلمة السر'}</label>
                             <input 
                               type={showPasswords ? "text" : "password"}
                               value={confirmPassword} 
                               onChange={(e) => setConfirmPassword(e.target.value)}
                               className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-5 py-3 outline-none focus:border-[#E50914] transition-all"
                             />
                             <button
                               type="button"
                               onClick={() => setShowPasswords(!showPasswords)}
                               className="absolute right-4 bottom-3.5 text-gray-400 hover:text-[#E50914]"
                             >
                               {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                             </button>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={saving || !newPassword}
                          className="rounded-2xl bg-[#E50914] px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          {language === 'en' ? 'Update Password' : 'تحديث كلمة السر'}
                        </button>
                      </form>
                    </section>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4 text-red-500">
                      <Trash2 className="h-6 w-6" />
                      <h2 className="text-2xl font-black">{language === 'en' ? 'Danger Zone' : 'منطقة الخطر'}</h2>
                    </div>

                    <div className="rounded-2xl bg-red-500/5 border border-red-500/10 p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="text-red-500 h-6 w-6" />
                        <h3 className="font-bold text-lg">{language === 'en' ? 'Delete Account' : 'حذف الحساب'}</h3>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">
                        {language === 'en' 
                          ? 'Once you delete your account, there is no going back. All your favorites, watch progress, and settings will be permanently erased. Please be certain.' 
                          : 'بمجرد حذف حسابك، لن تتمكن من العودة. سيتم مسح جميع مفضلاتك وتقدم المشاهدة والإعدادات نهائياً. يرجى التأكد.'}
                      </p>
                      
                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="mt-4 rounded-xl bg-red-500/10 px-6 py-3 font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                        >
                          {language === 'en' ? 'Initiate Deletion' : 'بدء عملية الحذف'}
                        </button>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-5 rounded-2xl bg-red-500 text-white space-y-4 shadow-xl shadow-red-500/30"
                        >
                           <p className="font-bold flex items-center gap-2">
                             <Trash2 size={20} />
                             {language === 'en' ? 'Confirm Permanent Deletion?' : 'تأكيد الحذف النهائي؟'}
                           </p>
                           <div className="flex gap-3">
                             <button
                               onClick={handleDeleteAccount}
                               className="flex-1 rounded-xl bg-white text-red-500 py-3 font-black text-sm uppercase tracking-tighter hover:bg-gray-100 transition-colors"
                             >
                               {language === 'en' ? 'Yes, Delete My Data' : 'نعم، احذف بياناتي والاشتراك'}
                             </button>
                             <button
                               onClick={() => setShowDeleteConfirm(false)}
                               className="flex-1 rounded-xl bg-black/20 text-white py-3 font-black text-sm uppercase tracking-tighter hover:bg-black/30 transition-colors"
                             >
                               {language === 'en' ? 'No, Keep It' : 'لا، احتفظ به'}
                             </button>
                           </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
