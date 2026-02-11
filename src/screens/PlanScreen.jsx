import { useState, useEffect } from 'react';
import { getPlanTemplate, savePlanTemplate, getPlanVersions, getActivePlanVersion, applyPlanVersion } from '../store/storage';
import { validatePlanTemplate } from '../utils/validators';
import { DEFAULT_PLAN } from '../data/defaultPlan';
import ErrorList from '../components/ErrorList';
import FocusTags from '../components/FocusTags';

export default function PlanScreen() {
  const [jsonText, setJsonText] = useState('');
  const [errors, setErrors] = useState([]);
  const [template, setTemplate] = useState(null);
  const [versions, setVersions] = useState([]);
  const [activeVersion, setActiveVersion] = useState(null);
  const [status, setStatus] = useState('');
  const [validatedPlan, setValidatedPlan] = useState(null);
  const [showVersionDays, setShowVersionDays] = useState(null);

  const refresh = () => {
    setTemplate(getPlanTemplate());
    setVersions(getPlanVersions());
    setActiveVersion(getActivePlanVersion());
  };

  useEffect(() => { refresh(); }, []);

  const loadDefault = () => {
    setJsonText(JSON.stringify(DEFAULT_PLAN, null, 2));
    setErrors([]);
    setValidatedPlan(null);
    setStatus('Default plan loaded into editor.');
    setTimeout(() => setStatus(''), 2000);
  };

  const validateJson = () => {
    setErrors([]);
    setValidatedPlan(null);

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      setErrors([{ path: '', message: `Invalid JSON: ${e.message}` }]);
      return;
    }

    const errs = validatePlanTemplate(parsed);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setValidatedPlan(parsed);
    setStatus('Plan is valid! You can now apply it.');
    setTimeout(() => setStatus(''), 3000);
  };

  const applyPlan = () => {
    if (!validatedPlan) {
      setErrors([{ path: '', message: 'Validate the plan first before applying.' }]);
      return;
    }

    savePlanTemplate(validatedPlan);
    const newVersion = applyPlanVersion(validatedPlan);
    refresh();
    setStatus(`Plan applied! Version ${newVersion.version} is now active.`);
    setValidatedPlan(null);
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div style={{ padding: 16, paddingBottom: 100 }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Plan Management</div>

      {/* Active plan info */}
      {activeVersion && (
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
          padding: 12, marginBottom: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>
            Active: {activeVersion.title} (v{activeVersion.version})
          </div>
          <div style={{ fontSize: 12, color: '#3b82f6' }}>
            Applied: {new Date(activeVersion.applied_at).toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: '#3b82f6' }}>
            {activeVersion.days.length} days · {activeVersion.split.type}
          </div>
        </div>
      )}

      {/* Status */}
      {status && (
        <div style={{
          background: '#22c55e', color: '#fff', padding: '8px 16px',
          borderRadius: 8, marginBottom: 12, fontSize: 14, fontWeight: 600, textAlign: 'center',
        }}>{status}</div>
      )}

      {/* JSON Editor */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ fontSize: 14, fontWeight: 700 }}>Plan JSON</label>
          <button onClick={loadDefault} style={{
            background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '4px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#475569',
          }}>Load Default</button>
        </div>
        <textarea
          value={jsonText}
          onChange={e => { setJsonText(e.target.value); setErrors([]); setValidatedPlan(null); }}
          placeholder='Paste plan JSON here...'
          rows={12}
          style={{
            width: '100%', padding: 10, borderRadius: 8,
            border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'monospace',
            resize: 'vertical', boxSizing: 'border-box',
          }}
        />
      </div>

      <ErrorList errors={errors} />

      {/* Validated preview */}
      {validatedPlan && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
          padding: 12, marginBottom: 12,
        }}>
          <div style={{ fontWeight: 700, color: '#166534', fontSize: 14, marginBottom: 4 }}>
            Valid: {validatedPlan.title}
          </div>
          <div style={{ fontSize: 12, color: '#15803d' }}>
            {validatedPlan.days.length} days · Cycle: {validatedPlan.split.weekly_pattern.join(' → ')}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={validateJson} style={{
          flex: 1, padding: 12, background: '#f1f5f9', color: '#334155',
          border: '1px solid #cbd5e1', borderRadius: 10, fontSize: 14,
          fontWeight: 700, cursor: 'pointer',
        }}>Validate</button>
        <button onClick={applyPlan} disabled={!validatedPlan} style={{
          flex: 1, padding: 12, background: validatedPlan ? '#3b82f6' : '#94a3b8', color: '#fff',
          border: 'none', borderRadius: 10, fontSize: 14,
          fontWeight: 700, cursor: validatedPlan ? 'pointer' : 'not-allowed',
        }}>Apply Plan</button>
      </div>

      {/* Plan version history */}
      {versions.length > 0 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, borderTop: '2px solid #e2e8f0', paddingTop: 16 }}>
            Plan History
          </div>
          {[...versions].reverse().map((v, i) => (
            <div key={i} style={{
              background: v.active ? '#eff6ff' : '#f8fafc',
              border: `1px solid ${v.active ? '#bfdbfe' : '#e2e8f0'}`,
              borderRadius: 10, padding: 12, marginBottom: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {v.title} <span style={{ color: '#94a3b8', fontWeight: 500 }}>v{v.version}</span>
                    {v.active && <span style={{ background: '#22c55e', color: '#fff', padding: '1px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, marginLeft: 6 }}>ACTIVE</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Applied: {new Date(v.applied_at).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {v.days.length} days · {v.split.weekly_pattern.join(', ')}
                  </div>
                </div>
                <button onClick={() => setShowVersionDays(showVersionDays === `${v.plan_id}-${v.version}` ? null : `${v.plan_id}-${v.version}`)} style={{
                  background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8,
                  padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#475569',
                }}>
                  {showVersionDays === `${v.plan_id}-${v.version}` ? 'Hide' : 'View'}
                </button>
              </div>

              {showVersionDays === `${v.plan_id}-${v.version}` && (
                <div style={{ marginTop: 10, borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
                  {v.days.map((day, di) => (
                    <div key={di} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{day.day}: {day.title}</span>
                        <FocusTags tags={day.focus} />
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', paddingLeft: 8 }}>
                        {day.workout.map((ex, ei) => (
                          <div key={ei}>{ex.name} — {ex.sets}×{ex.reps} {ex.unit}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
