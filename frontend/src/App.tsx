import React, { useState, useEffect } from 'react';
import { TopUtilityBar } from './components/TopUtilityBar';
import { MainHeader } from './components/MainHeader';
import { SubRibbon } from './components/SubRibbon';
import { AdvisoryOverview } from './components/AdvisoryOverview';
import { MarketFeasibilityAnalyzer } from './components/MarketFeasibilityAnalyzer';
import { FinancialCalculator } from './components/FinancialCalculator';
import { SchemeMatcher } from './components/SchemeMatcher';
import { InputWizard } from './components/InputWizard';
import { AIAssistantChat } from './components/AIAssistantChat';
import { Footer } from './components/Footer';

import { EntrepreneurProfile, AdvisoryReport, FinancialBreakdown, CompetitorBusiness } from './types';
import { DEFAULT_PROFILE, INITIAL_COMPETITORS } from './services/mockData';
import { fetchAdvisoryEvaluation, searchNearbyCompetitors } from './services/api';
import { CommunityReportModal } from './components/CommunityReportModal';
import { Globe } from 'lucide-react';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<EntrepreneurProfile>(DEFAULT_PROFILE);
  const [report, setReport] = useState<AdvisoryReport | null>(null);
  const [financials, setFinancials] = useState<FinancialBreakdown | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorBusiness[]>(INITIAL_COMPETITORS);
  const [mapDisclaimer, setMapDisclaimer] = useState<string>('');

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [currentLang, setCurrentLang] = useState<string>('en');

  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Load advisory evaluation and nearby competitors whenever profile changes
  useEffect(() => {
    fetchAdvisoryEvaluation(profile, competitors).then((data) => {
      setReport(data.report);
      setFinancials(data.financials);
      if (data.competitors) {
        setCompetitors(data.competitors);
      }
    });

    if (profile.lat !== undefined && profile.lng !== undefined) {
      searchNearbyCompetitors(profile.lat, profile.lng, profile.category, profile.radiusKm || 3.0).then((res) => {
        if (res.businesses) {
          setCompetitors(res.businesses);
        }
        setMapDisclaimer(res.disclaimer);
      });
    } else {
      setCompetitors([]);
      setMapDisclaimer('');
    }
  }, [profile]);

  const handleRadiusChange = async (newRadius: number) => {
    const updated = { ...profile, radiusKm: newRadius };
    setProfile(updated);
    if (profile.lat !== undefined && profile.lng !== undefined) {
      const res = await searchNearbyCompetitors(profile.lat, profile.lng, profile.category, newRadius);
      if (res.businesses) {
        setCompetitors(res.businesses);
      }
      setMapDisclaimer(res.disclaimer);
    }
  };

  const refreshCompetitors = async () => {
    if (profile.lat !== undefined && profile.lng !== undefined) {
      const res = await searchNearbyCompetitors(profile.lat, profile.lng, profile.category, profile.radiusKm || 3.0);
      if (res.businesses) {
        setCompetitors(res.businesses);
      }
      setMapDisclaimer(res.disclaimer);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-sbi-bg text-slate-800 font-sans">
      {/* 1. Top Indigo Utility Bar */}
      <TopUtilityBar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />

      {/* 2. Main White Branding Header */}
      <MainHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenWizard={() => setIsWizardOpen(true)}
      />

      {/* 3. Cyan Sub-Navigation Ribbon */}
      <SubRibbon
        activeModule={activeTab}
        onSelectModule={setActiveTab}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* 4. Main Page Container */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <AdvisoryOverview
            profile={profile}
            report={report}
            financials={financials}
            competitors={competitors}
            onNavigateTab={setActiveTab}
            onOpenWizard={() => setIsWizardOpen(true)}
            onOpenChat={() => setIsChatOpen(true)}
          />
        )}

        {activeTab === 'market' && (
          <MarketFeasibilityAnalyzer
            profile={profile}
            financials={financials}
            competitors={competitors}
            disclaimer={mapDisclaimer}
            onRadiusChange={handleRadiusChange}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onNavigateTab={setActiveTab}
            onOpenWizard={() => setIsWizardOpen(true)}
          />
        )}

        {activeTab === 'calculator' && (
          <FinancialCalculator
            initialFinancials={financials}
          />
        )}

        {activeTab === 'schemes' && (
          <SchemeMatcher />
        )}
      </main>

      {/* Floating Bottom-Right Language Selector Badge (Matching SBI screenshot) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => {
            const nextLang = currentLang === 'en' ? 'hi' : currentLang === 'hi' ? 'te' : 'en';
            setCurrentLang(nextLang);
          }}
          className="bg-sbi-indigo hover:bg-purple-950 text-white px-4 py-2 rounded-lg shadow-xl border border-purple-400/30 flex items-center gap-2 text-xs font-bold transition active:scale-95"
          title="Click to toggle language"
        >
          <Globe className="w-4 h-4 text-sbi-blue-light" />
          <span>{currentLang === 'en' ? 'English' : currentLang === 'hi' ? 'हिंदी' : 'తెలుగు'}</span>
          <span className="text-[10px] text-slate-300 font-normal">▼</span>
        </button>
      </div>

      {/* Modals */}
      <InputWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        currentProfile={profile}
        onSaveProfile={setProfile}
      />

      <CommunityReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultLat={profile.lat}
        defaultLng={profile.lng}
        defaultCategory={profile.category}
        onSuccess={refreshCompetitors}
      />

      <AIAssistantChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        profile={profile}
        report={report}
        financials={financials}
      />

      {/* 5. Indian Banking Portal Footer */}
      <Footer />
    </div>
  );
};
export default App;
