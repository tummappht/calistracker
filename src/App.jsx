import { useState, useCallback } from 'react';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { tokens } from './theme/tokens';
import TodayScreen from './screens/TodayScreen';
import CalendarScreen from './screens/CalendarScreen';
import PlanScreen from './screens/PlanScreen';
import SettingsScreen from './screens/SettingsScreen';

const t = tokens.color;

const TABS = [
  { id: 'today', label: 'Today', icon: '💪' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'plan', label: 'Plan', icon: '📋' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState('today');
  const [refreshKey, setRefreshKey] = useState(0);
  const { focusMode } = useTheme();

  const switchTab = useCallback((tab) => {
    setActiveTab(tab);
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      minHeight: '100vh',
      background: t.background,
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        background: t.surface,
        borderBottom: `1px solid ${t.border}`,
        padding: '14px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: t.text_primary, letterSpacing: '-0.3px' }}>
          Calisthenics Tracker
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {focusMode && (
            <span style={{
              background: t.primary_soft, color: t.primary,
              padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
              border: `1px solid ${t.primary}30`,
            }}>FOCUS</span>
          )}
          <span style={{ fontSize: 12, color: t.text_muted }}>
            {TABS.find(t => t.id === activeTab)?.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div key={refreshKey} style={{ paddingBottom: 70 }}>
        {activeTab === 'today' && <TodayScreen />}
        {activeTab === 'calendar' && <CalendarScreen />}
        {activeTab === 'plan' && <PlanScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </div>

      {/* Tab bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        background: t.surface,
        borderTop: `1px solid ${t.border}`,
        display: 'flex',
        zIndex: 100,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            style={{
              flex: 1,
              padding: '10px 0 8px',
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              color: activeTab === tab.id ? t.primary : t.text_muted,
              borderTop: activeTab === tab.id ? `2px solid ${t.primary}` : '2px solid transparent',
              transition: 'color 150ms ease',
              minHeight: 44,
            }}
          >
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700 }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
