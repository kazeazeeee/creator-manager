import React, { useState } from 'react';
import { Sparkles, AlertTriangle, MessageSquare, Video, FileSearch, Briefcase, FileText } from 'lucide-react';

// Import the original page components
import BriefAnalyzer from './BriefAnalyzer';
import ContractFinder from './ContractFinder';
import Communicator from './Communicator';
import ScriptGenerator from './ScriptGenerator';
import ScriptAnalyzer from './ScriptAnalyzer';

const TABS = [
  { id: 'brief', label: 'Analisis Brief', icon: Sparkles, description: 'Uraikan brief brand menjadi poin-poin kunci' },
  { id: 'contract', label: 'Pemeriksa Kontrak', icon: FileSearch, description: 'Deteksi risiko & klausul berbahaya' },
  { id: 'communicator', label: 'Draf Komunikasi', icon: MessageSquare, description: 'Buat draf balasan klien profesional' },
  { id: 'script', label: 'Skrip & Hook', icon: Video, description: 'Tulis naskah & hook video pendek' },
  { id: 'script-analyzer', label: 'Analisis Skrip', icon: FileText, description: 'Perbaiki typo & optimalkan naskah video' },
];

const CreatorToolkit = ({ apiKey, addPipelineTask, addCalendarEvent, creatorProfile }) => {
  const [activeSubTab, setActiveSubTab] = useState('brief');

  const renderContent = () => {
    switch (activeSubTab) {
      case 'brief':
        return (
          <BriefAnalyzer
            apiKey={apiKey}
            addPipelineTask={addPipelineTask}
            addCalendarEvent={addCalendarEvent}
            creatorProfile={creatorProfile}
          />
        );
      case 'contract':
        return <ContractFinder apiKey={apiKey} />;
      case 'communicator':
        return <Communicator apiKey={apiKey} creatorProfile={creatorProfile} />;
      case 'script':
        return (
          <ScriptGenerator
            apiKey={apiKey}
            addPipelineTask={addPipelineTask}
            creatorProfile={creatorProfile}
          />
        );
      case 'script-analyzer':
        return (
          <ScriptAnalyzer
            apiKey={apiKey}
            addPipelineTask={addPipelineTask}
            creatorProfile={creatorProfile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
      {/* Toolkit Header */}
      <div className="content-header">
        <div className="content-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase size={22} style={{ color: 'var(--accent-color)' }} />
            Perangkat Kreator
          </h1>
          <p>Semua alat bantu kreator dalam satu tempat — analisis brief, periksa kontrak, buat draf pesan, dan tulis naskah video.</p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--border-radius-md)',
                border: isActive ? '1.5px solid var(--accent-color)' : '1px solid var(--border-color)',
                background: isActive
                  ? 'linear-gradient(135deg, var(--accent-light) 0%, rgba(var(--accent-rgb, 224,108,117), 0.08) 100%)'
                  : 'var(--bg-secondary)',
                color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: isActive ? '600' : '500',
                fontSize: '13px',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                minWidth: '160px'
              }}
            >
              <Icon size={16} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ lineHeight: '1.2' }}>{tab.label}</div>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '400',
                  color: isActive ? 'var(--accent-color)' : 'var(--text-muted)',
                  opacity: 0.8,
                  marginTop: '2px'
                }}>
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Sub-Tab Content */}
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default CreatorToolkit;
