import { useState, useCallback } from 'react';
import TodayScreen from './screens/TodayScreen';
import CalendarScreen from './screens/CalendarScreen';
import PlanScreen from './screens/PlanScreen';
import SettingsScreen from './screens/SettingsScreen';

const TABS = [
  { id: 'today', label: 'Today', icon: '💪' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'plan', label: 'Plan', icon: '📋' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [refreshKey, setRefreshKey] = useState(0);

  const switchTab = useCallback((tab) => {
    setActiveTab(tab);
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      minHeight: '100vh',
      background: '#fff',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: '#1e293b',
        color: '#fff',
        padding: '12px 16px',
        fontSize: 16,
        fontWeight: 800,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <span>Calisthenics Tracker</span>
        <span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8' }}>
          {TABS.find(t => t.id === activeTab)?.label}
        </span>
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
        background: '#fff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        zIndex: 100,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            style={{
              flex: 1,
              padding: '8px 0 6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              color: activeTab === tab.id ? '#3b82f6' : '#94a3b8',
              borderTop: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700 }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
