import { useState } from 'react';
import { exportData, importData, importLegacyLogs, clearAll, getLogs, applyPlanVersion } from '../store/storage';
import { validateExportJSON } from '../utils/validators';
import { DEFAULT_PLAN, getSeedLogs } from '../data/defaultPlan';
import { savePlanTemplate } from '../store/storage';
import { tokens } from '../theme/tokens';
import { useTheme } from '../theme/ThemeContext';
import ErrorList from '../components/ErrorList';

const t = tokens.color;

export default function SettingsScreen() {
  const [importText, setImportText] = useState('');
  const [legacyText, setLegacyText] = useState('');
  const [errors, setErrors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('');
  const { focusMode, setFocusMode } = useTheme();

  const flash = (msg) => { setStatus(msg); setTimeout(() => setStatus(''), 3000); };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash('Exported!');
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(JSON.stringify(exportData(), null, 2));
    flash('Copied to clipboard!');
  };

  const handleImport = () => {
    setErrors([]); setSummary(null);
    let parsed;
    try { parsed = JSON.parse(importText); }
    catch (e) { setErrors([{ path: '', message: `Invalid JSON: ${e.message}` }]); return; }
    const errs = validateExportJSON(parsed);
    if (errs.length > 0) { setErrors(errs); return; }
    const result = importData(parsed);
    setSummary(result);
    setImportText('');
    flash('Import complete!');
  };

  const handleLegacyImport = () => {
    setErrors([]); setSummary(null);
    let parsed;
    try { parsed = JSON.parse(legacyText); }
    catch (e) { setErrors([{ path: '', message: `Invalid JSON: ${e.message}` }]); return; }
    const result = importLegacyLogs(parsed);
    if (result.errors.length > 0) setErrors(result.errors);
    setSummary({ addedLogs: result.imported, addedVersions: 0, conflicts: [] });
    setLegacyText('');
    flash(`Imported ${result.imported} legacy logs.`);
  };

  const handleSeedData = () => {
    if (!window.confirm('Load default plan and seed example logs?')) return;
    savePlanTemplate(DEFAULT_PLAN);
    const pv = applyPlanVersion(DEFAULT_PLAN);
    const seedLogs = getSeedLogs(pv);
    const existing = getLogs();
    for (const log of seedLogs) {
      if (!existing.find(l => l.log_id === log.log_id)) existing.push(log);
    }
    localStorage.setItem('ct_logs', JSON.stringify(existing));
    flash('Default plan applied and seed logs added!');
  };

  const handleClearAll = () => {
    if (!window.confirm('DELETE ALL DATA? This cannot be undone!')) return;
    if (!window.confirm('Are you really sure?')) return;
    clearAll();
    flash('All data cleared.');
  };

  return (
    <div style={{ padding: 16, paddingBottom: 100 }}>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color: t.text_primary }}>Settings</div>

      {status && (
        <div style={{
          background: t.primary_soft, color: t.primary, padding: '10px 16px',
          borderRadius: 10, marginBottom: 12, fontSize: 14, fontWeight: 700, textAlign: 'center',
          border: `1px solid ${t.primary}30`,
        }}>{status}</div>
      )}

      {/* Focus Mode */}
      <Section title="Focus Mode">
        <div style={{ fontSize: 13, color: t.text_secondary, marginBottom: 10 }}>
          Strip away visual noise. Only essential workout data remains visible.
        </div>
        <button
          onClick={() => setFocusMode(!focusMode)}
          style={{
            width: '100%', padding: 14,
            background: focusMode ? t.primary : t.surface,
            color: focusMode ? '#fff' : t.text_primary,
            border: focusMode ? 'none' : `1px solid ${t.border}`,
            borderRadius: 12, fontSize: 14, fontWeight: 700,
          }}
        >
          {focusMode ? '✓ Focus Mode ON' : 'Enable Focus Mode'}
        </button>
      </Section>

      {/* Export */}
      <Section title="Export Data">
        <div style={{ fontSize: 13, color: t.text_secondary, marginBottom: 10 }}>
          Export all plans, versions, and logs as JSON for backup or device sync.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleExport} style={btnPrimary}>Download JSON</button>
          <button onClick={handleCopyExport} style={btnSecondary}>Copy to Clipboard</button>
        </div>
      </Section>

      {/* Import */}
      <Section title="Import Data">
        <div style={{ fontSize: 13, color: t.text_secondary, marginBottom: 10 }}>
          Paste exported JSON to merge. Duplicates skipped, conflicts preserved.
        </div>
        <textarea
          value={importText}
          onChange={e => setImportText(e.target.value)}
          placeholder='Paste export JSON here...'
          rows={8}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 12, resize: 'vertical', marginBottom: 8 }}
        />
        <button onClick={handleImport} disabled={!importText}
          style={importText ? btnPrimary : { ...btnPrimary, opacity: 0.4 }}>
          Import & Merge
        </button>
      </Section>

      {/* Legacy */}
      <Section title="Legacy Log Migration">
        <div style={{ fontSize: 13, color: t.text_secondary, marginBottom: 10 }}>
          Import old-format logs. Missing planned fields filled with defaults.
        </div>
        <textarea
          value={legacyText}
          onChange={e => setLegacyText(e.target.value)}
          placeholder='Paste legacy logs JSON...'
          rows={6}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 12, resize: 'vertical', marginBottom: 8 }}
        />
        <button onClick={handleLegacyImport} disabled={!legacyText}
          style={legacyText ? btnPrimary : { ...btnPrimary, opacity: 0.4 }}>
          Import Legacy Logs
        </button>
      </Section>

      <ErrorList errors={errors} />

      {summary && (
        <div style={{
          background: t.card, border: `1px solid ${t.border}`,
          borderLeft: `4px solid ${t.info}`,
          borderRadius: 12, padding: 14, marginBottom: 16,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: t.info, marginBottom: 4 }}>Import Summary</div>
          <div style={{ fontSize: 13, color: t.text_secondary }}>
            Plan versions added: {summary.addedVersions}<br />
            Logs added: {summary.addedLogs}<br />
            Conflicts: {summary.conflicts.length}
          </div>
          {summary.conflicts.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: t.warning }}>
              {summary.conflicts.map((c, i) => <div key={i}>{c.message}</div>)}
            </div>
          )}
        </div>
      )}

      {/* Seed */}
      <Section title="Sample Data">
        <div style={{ fontSize: 13, color: t.text_secondary, marginBottom: 10 }}>
          Load default 7-day plan and seed example pull-day logs for testing.
        </div>
        <button onClick={handleSeedData} style={btnSecondary}>Load Default Plan + Seed Logs</button>
      </Section>

      {/* Danger */}
      <Section title="Danger Zone">
        <button onClick={handleClearAll} style={{
          ...btnPrimary, background: t.danger,
        }}>Clear All Data</button>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: 14, marginBottom: 12,
    }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: t.text_primary }}>{title}</div>
      {children}
    </div>
  );
}

const btnPrimary = {
  padding: '12px 20px', background: t.primary, color: '#fff',
  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
};

const btnSecondary = {
  padding: '12px 20px', background: t.surface, color: t.text_primary,
  border: `1px solid ${t.border}`, borderRadius: 10, fontSize: 14, fontWeight: 700,
};
