import React, { useState, useEffect } from 'react';
import { TopUtilityBar } from './components/TopUtilityBar';
import { MainHeader } from './components/MainHeader';
import { SubRibbon } from './components/SubRibbon';
import { AdvisoryOverview } from './components/AdvisoryOverview';
import { CompetitorMap } from './components/CompetitorMap';
import { FinancialCalculator } from './components/FinancialCalculator';
import { SchemeMatcher } from './components/SchemeMatcher';
import { InputWizard } from './components/InputWizard';
import { CommunityReportModal } from './components/CommunityReportModal';
import { AIAssistantChat } from './components/AIAssistantChat';
import { Footer } from './components/Footer';

import { EntrepreneurProfile, AdvisoryReport, FinancialBreakdown, CompetitorBusiness } from './types';
import { DEFAULT_PROFILE, INITIAL_COMPETITORS } from './services/mockData';
import { fetchAdvisoryEvaluation } from './services/api';
import { Globe } from 'lucide-react';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<EntrepreneurProfile>(DEFAULT_PROFILE);
  const [report, setReport] = useState<AdvisoryReport | null>(null);
  const [financials, setFinancials] = useState<FinancialBreakdown | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorBusiness[]>(INITIAL_COMPETITORS);

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [currentLang, setCurrentLang] = useState<string>('en');

  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Load advisory evaluation whenever profile changes
  useEffect(() => {
    fetchAdvisoryEvaluation(profile).then((data) => {
      setReport(data.report);
      setFinancials(data.financials);
    });
  }, [profile]);

  const handleAddCommunityCompetitor = (newComp: CompetitorBusiness) => {
    const updated = [newComp, ...competitors];
    setCompetitors(updated);
    fetchAdvisoryEvaluation(profile, updated).then((data) => {
      setReport(data.report);
      setFinancials(data.financials);
    });
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
        onOpenCommunityModal={() => setIsCommunityModalOpen(true)}
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

        {activeTab === 'map' && (
          <CompetitorMap
            competitors={competitors}
            centerLat={16.3067}
            centerLng={80.4365}
            locationName={profile.pincode ? `${profile.villageTown || 'Target Location'}, PIN ${profile.pincode}` : 'Target Search Area'}
            onOpenAddModal={() => setIsCommunityModalOpen(true)}
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
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        onAddCompetitor={handleAddCommunityCompetitor}
        centerLat={16.3067}
        centerLng={80.4365}
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
