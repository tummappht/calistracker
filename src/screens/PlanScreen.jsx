import { useState, useEffect } from 'react';
import { getPlanTemplate, savePlanTemplate, getPlanVersions, getActivePlanVersion, applyPlanVersion } from '../store/storage';
import { validatePlanTemplate } from '../utils/validators';
import { DEFAULT_PLAN } from '../data/defaultPlan';
import { tokens } from '../theme/tokens';
import ErrorList from '../components/ErrorList';
import FocusTags from '../components/FocusTags';

const t = tokens.color;

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
    setErrors([]); setValidatedPlan(null);
    setStatus('Default plan loaded into editor.');
    setTimeout(() => setStatus(''), 2000);
  };

  const validateJson = () => {
    setErrors([]); setValidatedPlan(null);

    let parsed;
    try { parsed = JSON.parse(jsonText); }
    catch (e) { setErrors([{ path: '', message: `Invalid JSON: ${e.message}` }]); return; }

    // Auto-unwrap export format
    if (parsed.plan_versions && Array.isArray(parsed.plan_versions) && parsed.plan_versions.length > 0 && !parsed.days) {
      parsed = parsed.plan_versions[0];
    }

    // Normalize days: merge skill/core, fix recovery
    if (Array.isArray(parsed.days)) {
      const warnings = [];
      parsed.days = parsed.days.map((day, i) => {
        const merged = { ...day };
        if (Array.isArray(day.skill) && day.skill.length > 0) {
          merged.workout = [...day.skill, ...(day.workout || [])];
          delete merged.skill;
          warnings.push(`days[${i}]: merged ${day.skill.length} skill exercise(s) into workout`);
        }
        if (Array.isArray(day.core) && day.core.length > 0) {
          merged.workout = [...(merged.workout || []), ...day.core];
          delete merged.core;
          warnings.push(`days[${i}]: merged ${day.core.length} core exercise(s) into workout`);
        }
        if (Array.isArray(day.focus)) {
          merged.focus = day.focus.map(tag => {
            if (tag === 'recovery') { warnings.push(`days[${i}].focus: auto-fixed "recovery" → "core"`); return 'core'; }
            return tag;
          });
        }
        return merged;
      });
      if (parsed.split && Array.isArray(parsed.split.weekly_pattern)) {
        parsed.split.weekly_pattern = parsed.split.weekly_pattern.map((tag, i) => {
          if (tag === 'recovery') { return 'core'; }
          return tag;
        });
      }
      if (warnings.length > 0) {
        setStatus(`Auto-fixed: ${warnings.length} issue(s). Review and apply.`);
        setJsonText(JSON.stringify(parsed, null, 2));
      }
    }

    const errs = validatePlanTemplate(parsed);
    if (errs.length > 0) { setErrors(errs); return; }

    setValidatedPlan(parsed);
    if (!status) { setStatus('Plan is valid! You can now apply it.'); }
    setTimeout(() => setStatus(''), 4000);
  };

  const applyPlan = () => {
    if (!validatedPlan) { setErrors([{ path: '', message: 'Validate the plan first.' }]); return; }
    savePlanTemplate(validatedPlan);
    const nv = applyPlanVersion(validatedPlan);
    refresh();
    setStatus(`Plan applied! Version ${nv.version} is now active.`);
    setValidatedPlan(null);
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div style={{ padding: 16, paddingBottom: 100 }}>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color: t.text_primary }}>Plan Management</div>

      {/* Active plan */}
      {activeVersion && (
        <div style={{
          background: t.card, border: `1px solid ${t.border}`,
          borderLeft: `4px solid ${t.primary}`,
          borderRadius: 12, padding: 14, marginBottom: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.primary }}>
            Active: {activeVersion.title} (v{activeVersion.version})
          </div>
          <div style={{ fontSize: 12, color: t.text_muted, marginTop: 2 }}>
            Applied: {new Date(activeVersion.applied_at).toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: t.text_muted }}>
            {activeVersion.days.length} days · {activeVersion.split.type}
          </div>
        </div>
      )}

      {/* Status */}
      {status && (
        <div style={{
          background: t.primary_soft, color: t.primary, padding: '10px 16px',
          borderRadius: 10, marginBottom: 12, fontSize: 14, fontWeight: 700, textAlign: 'center',
          border: `1px solid ${t.primary}30`,
        }}>{status}</div>
      )}

      {/* JSON editor */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 700, color: t.text_primary }}>Plan JSON</label>
          <button onClick={loadDefault} style={{
            background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
            padding: '6px 14px', fontSize: 12, fontWeight: 600, color: t.text_secondary,
          }}>Load Default</button>
        </div>
        <textarea
          value={jsonText}
          onChange={e => { setJsonText(e.target.value); setErrors([]); setValidatedPlan(null); }}
          placeholder='Paste plan JSON here...'
          rows={12}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
        />
      </div>

      <ErrorList errors={errors} />

      {validatedPlan && (
        <div style={{
          background: `${t.success}12`, border: `1px solid ${t.success}30`,
          borderRadius: 12, padding: 12, marginBottom: 12,
        }}>
          <div style={{ fontWeight: 700, color: t.success, fontSize: 14 }}>
            Valid: {validatedPlan.title}
          </div>
          <div style={{ fontSize: 12, color: t.text_secondary, marginTop: 2 }}>
            {validatedPlan.days.length} days · {validatedPlan.split.weekly_pattern.join(' → ')}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={validateJson} style={{
          flex: 1, padding: 14, background: t.surface, color: t.text_primary,
          border: `1px solid ${t.border}`, borderRadius: 12, fontSize: 14, fontWeight: 700,
        }}>Validate</button>
        <button onClick={applyPlan} disabled={!validatedPlan} style={{
          flex: 1, padding: 14, background: validatedPlan ? t.primary : t.surface,
          color: validatedPlan ? '#fff' : t.text_muted,
          border: validatedPlan ? 'none' : `1px solid ${t.border}`,
          borderRadius: 12, fontSize: 14, fontWeight: 700,
          opacity: validatedPlan ? 1 : 0.5,
        }}>Apply Plan</button>
      </div>

      {/* Plan history */}
      {versions.length > 0 && (
        <div>
          <div style={{
            fontSize: 16, fontWeight: 700, marginBottom: 10,
            borderTop: `1px solid ${t.border}`, paddingTop: 16, color: t.text_primary,
          }}>Plan History</div>
          {[...versions].reverse().map((v, i) => (
            <div key={i} style={{
              background: t.card, border: `1px solid ${v.active ? t.primary + '40' : t.border}`,
              borderLeft: v.active ? `4px solid ${t.primary}` : `4px solid ${t.border}`,
              borderRadius: 12, padding: 14, marginBottom: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: t.text_primary }}>
                    {v.title} <span style={{ color: t.text_muted, fontWeight: 500 }}>v{v.version}</span>
                    {v.active && (
                      <span style={{
                        background: t.primary_soft, color: t.primary, padding: '2px 8px',
                        borderRadius: 6, fontSize: 10, fontWeight: 700, marginLeft: 8,
                        border: `1px solid ${t.primary}30`,
                      }}>ACTIVE</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: t.text_muted, marginTop: 2 }}>
                    Applied: {new Date(v.applied_at).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: t.text_muted }}>
                    {v.days.length} days · {v.split.weekly_pattern.join(', ')}
                  </div>
                </div>
                <button onClick={() => setShowVersionDays(showVersionDays === `${v.plan_id}-${v.version}` ? null : `${v.plan_id}-${v.version}`)} style={{
                  background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
                  padding: '6px 12px', fontSize: 12, color: t.text_secondary,
                }}>
                  {showVersionDays === `${v.plan_id}-${v.version}` ? 'Hide' : 'View'}
                </button>
              </div>

              {showVersionDays === `${v.plan_id}-${v.version}` && (
                <div style={{ marginTop: 12, borderTop: `1px solid ${t.border}`, paddingTop: 10 }}>
                  {v.days.map((day, di) => (
                    <div key={di} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: t.text_primary }}>
                          {day.day}: {day.title}
                        </span>
                        <FocusTags tags={day.focus} />
                      </div>
                      <div style={{ fontSize: 12, color: t.text_muted, paddingLeft: 10 }}>
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
