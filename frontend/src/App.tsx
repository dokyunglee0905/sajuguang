import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import FortunePage from './pages/FortunePage';
import CompatPage from './pages/CompatPage';
import YearlyPage from './pages/YearlyPage';
import BottomTabBar from './components/BottomTabBar';
import AdGate from './components/AdGate';
import { PassProvider } from './store/PassContext';
import './App.css';

const TAB_PATHS = ['/home', '/fortune', '/compat', '/yearly'];

function Layout() {
  const { pathname } = useLocation();
  const showTabBar = TAB_PATHS.includes(pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/home" element={<AdGate><HomePage /></AdGate>} />
        <Route path="/analysis" element={<AdGate><AnalysisPage /></AdGate>} />
        <Route path="/fortune" element={<AdGate><FortunePage /></AdGate>} />
        <Route path="/compat" element={<AdGate><CompatPage /></AdGate>} />
        <Route path="/yearly" element={<AdGate><YearlyPage /></AdGate>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showTabBar && <BottomTabBar />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PassProvider>
        <Layout />
      </PassProvider>
    </BrowserRouter>
  );
}
