import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { FeedbackProvider } from './context/FeedbackContext';
import { NotificationProvider } from './context/NotificationContext';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './services/firebase';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <FeedbackProvider>
          <NotificationProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </NotificationProvider>
        </FeedbackProvider>
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>,
);
