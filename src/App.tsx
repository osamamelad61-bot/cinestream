import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

import Home from './pages/Home';
import Watch from './pages/Watch';
import Category from './pages/Category';
import Favorites from './pages/Favorites';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Premium from './pages/Premium';
import PremiumGuard from './components/PremiumGuard';
import Footer from './components/Footer';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

function AnimatedRoutes() {
  const { language } = useLanguage();
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex-col flex">
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
            <Route path="/premium" element={<PageTransition><Premium /></PageTransition>} />
            
            <Route path="/watch/:type/:id" element={<PageTransition><PremiumGuard><Watch /></PremiumGuard></PageTransition>} />
            
            <Route path="/category/:categoryName" element={<PageTransition><Category /></PageTransition>} />
            
            <Route
              path="/cartoon-dubbed"
              element={
                <PageTransition>
                  <Category categoryNameOverride="cartoon-dubbed" />
                </PageTransition>
              }
            />

            <Route path="/favorites" element={<PageTransition><Favorites /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}
