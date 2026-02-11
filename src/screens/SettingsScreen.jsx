import { useState } from 'react';
import { exportData, importData, importLegacyLogs, clearAll, getActivePlanVersion, getLogs, applyPlanVersion } from '../store/storage';
import { validateExportJSON } from '../utils/validators';
import { DEFAULT_PLAN, getSeedLogs } from '../data/defaultPlan';
import { savePlanTemplate } from '../store/storage';
import ErrorList from '../components/ErrorList';

export default function SettingsScreen() {
  const [importText, setImportText] = useState('');
  const [legacyText, setLegacyText] = useState('');
  const [errors, setErrors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('');

  const handleExport = () => {
    const data = exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Exported!');
    setTimeout(() => setStatus(''), 2000);
  };

  const handleCopyExport = () => {
    const data = exportData();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setStatus('Copied to clipboard!');
    setTimeout(() => setStatus(''), 2000);
  };

  const handleImport = () => {
    setErrors([]);
    setSummary(null);

    let parsed;
    try {
      parsed = JSON.parse(importText);
    } catch (e) {
      setErrors([{ path: '', message: `Invalid JSON: ${e.message}` }]);
      return;
    }

    const errs = validateExportJSON(parsed);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    const result = importData(parsed);
    setSummary(result);
    setImportText('');
    setStatus('Import complete!');
    setTimeout(() => setStatus(''), 3000);
  };

  const handleLegacyImport = () => {
    setErrors([]);
    setSummary(null);

    let parsed;
    try {
      parsed = JSON.parse(legacyText);
    } catch (e) {
      setErrors([{ path: '', message: `Invalid JSON: ${e.message}` }]);
      return;
    }

    const result = importLegacyLogs(parsed);
    if (result.errors.length > 0) {
      setErrors(result.errors);
    }
    setSummary({ addedLogs: result.imported, addedVersions: 0, conflicts: [] });
    setLegacyText('');
    setStatus(`Imported ${result.imported} legacy logs.`);
    setTimeout(() => setStatus(''), 3000);
  };

  const handleSeedData = () => {
    if (!window.confirm('This will load the default plan and seed example logs. Continue?')) return;

    savePlanTemplate(DEFAULT_PLAN);
    const pv = applyPlanVersion(DEFAULT_PLAN);
    const seedLogs = getSeedLogs(pv);

    const existingLogs = getLogs();
    const allLogs = [...existingLogs];

    for (const log of seedLogs) {
      if (!allLogs.find(l => l.log_id === log.log_id)) {
        allLogs.push(log);
      }
    }
    localStorage.setItem('ct_logs', JSON.stringify(allLogs));

    setStatus('Default plan applied and seed logs added!');
    setTimeout(() => setStatus(''), 3000);
  };

  const handleClearAll = () => {
    if (!window.confirm('DELETE ALL DATA? This cannot be undone!')) return;
    if (!window.confirm('Are you really sure? All plans, versions, and logs will be deleted.')) return;
    clearAll();
    setStatus('All data cleared.');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div style={{ padding: 16, paddingBottom: 100 }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Settings</div>

      {status && (
        <div style={{
          background: '#22c55e', color: '#fff', padding: '8px 16px',
          borderRadius: 8, marginBottom: 12, fontSize: 14, fontWeight: 600, textAlign: 'center',
        }}>{status}</div>
      )}

      {/* Export section */}
      <Section title="Export Data">
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
          Export all plans, versions, and logs as JSON for backup or device sync.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleExport} style={btnPrimary}>Download JSON</button>
          <button onClick={handleCopyExport} style={btnSecondary}>Copy to Clipboard</button>
        </div>
      </Section>

      {/* Import section */}
      <Section title="Import Data">
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
          Paste exported JSON to merge into current data. Duplicates are skipped, conflicts preserved.
        </div>
        <textarea
          value={importText}
          onChange={e => setImportText(e.target.value)}
          placeholder='Paste export JSON here...'
          rows={8}
          style={textareaStyle}
        />
        <button onClick={handleImport} disabled={!importText} style={importText ? btnPrimary : btnDisabled}>
          Import & Merge
        </button>
      </Section>

      {/* Legacy import */}
      <Section title="Legacy Log Migration">
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
          Import old-format logs. Missing planned fields will be filled with defaults.
        </div>
        <textarea
          value={legacyText}
          onChange={e => setLegacyText(e.target.value)}
          placeholder='Paste legacy logs JSON (array or {logs: [...]})'
          rows={6}
          style={textareaStyle}
        />
        <button onClick={handleLegacyImport} disabled={!legacyText} style={legacyText ? btnPrimary : btnDisabled}>
          Import Legacy Logs
        </button>
      </Section>

      <ErrorList errors={errors} />

      {/* Import summary */}
      {summary && (
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
          padding: 12, marginBottom: 16,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1e40af', marginBottom: 4 }}>Import Summary</div>
          <div style={{ fontSize: 13, color: '#1e3a8a' }}>
            Plan versions added: {summary.addedVersions}<br />
            Logs added: {summary.addedLogs}<br />
            Conflicts: {summary.conflicts.length}
          </div>
          {summary.conflicts.length > 0 && (
            <div style={{ marginTop: 6, fontSize: 12, color: '#991b1b' }}>
              {summary.conflicts.map((c, i) => (
                <div key={i}>{c.message}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Seed data */}
      <Section title="Sample Data">
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
          Load default 7-day plan and seed example pull-day logs for testing.
        </div>
        <button onClick={handleSeedData} style={btnSecondary}>Load Default Plan + Seed Logs</button>
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone">
        <button onClick={handleClearAll} style={{
          ...btnPrimary,
          background: '#ef4444',
        }}>Clear All Data</button>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{
      background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
      padding: 14, marginBottom: 12,
    }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

const btnPrimary = {
  padding: '10px 20px', background: '#3b82f6', color: '#fff',
  border: 'none', borderRadius: 10, fontSize: 14,
  fontWeight: 700, cursor: 'pointer',
};

const btnSecondary = {
  padding: '10px 20px', background: '#f1f5f9', color: '#334155',
  border: '1px solid #cbd5e1', borderRadius: 10, fontSize: 14,
  fontWeight: 700, cursor: 'pointer',
};

const btnDisabled = {
  ...btnPrimary,
  background: '#94a3b8',
  cursor: 'not-allowed',
};

const textareaStyle = {
  width: '100%', padding: 10, borderRadius: 8,
  border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'monospace',
  resize: 'vertical', boxSizing: 'border-box', marginBottom: 8,
};
