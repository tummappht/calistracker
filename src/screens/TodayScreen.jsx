import { useState, useEffect, useCallback, useRef } from 'react';
import { getActivePlanVersion, getLogs, getLogForDate, createLogFromPlanDay, saveLog } from '../store/storage';
import { getPlannedDayForDate, todayStr, formatDate } from '../utils/scheduling';
import { tokens } from '../theme/tokens';
import { useTheme } from '../theme/ThemeContext';
import FocusTags from '../components/FocusTags';
import ExerciseLogger from '../components/ExerciseLogger';
import MetaInputs from '../components/MetaInputs';

const t = tokens.color;

export default function TodayScreen() {
  const [date] = useState(todayStr());
  const [planVersion, setPlanVersion] = useState(null);
  const [planned, setPlanned] = useState(null);
  const [log, setLog] = useState(null);
  const [status, setStatus] = useState('');
  const { focusMode } = useTheme();

  const refresh = useCallback(() => {
    const pv = getActivePlanVersion();
    setPlanVersion(pv);
    if (!pv) { setPlanned(null); setLog(null); return; }
    const logs = getLogs();
    const p = getPlannedDayForDate(date, pv, logs);
    setPlanned(p);
    setLog(getLogForDate(date) || null);
  }, [date]);

  useEffect(() => { refresh(); }, [refresh]);

  const flash = (msg) => { setStatus(msg); setTimeout(() => setStatus(''), 2000); };

  const startLog = () => {
    if (!planVersion || !planned?.dayData) return;
    setLog(createLogFromPlanDay(date, planVersion, planned.dayData));
    flash('Log created');
  };

  const handleExerciseChange = (idx, updated) => {
    if (!log) return;
    const ex = [...log.exercises];
    ex[idx] = updated;
    setLog({ ...log, exercises: ex });
  };

  const saveDraft = () => { if (!log) return; saveLog(log); flash('Draft saved'); };

  const markComplete = () => {
    if (!log) return;
    const updated = { ...log, completed: true };
    saveLog(updated);
    setLog(updated);
    flash('Workout complete');
  };

  const resetSets = () => {
    if (!log || !window.confirm('Reset all actual sets for today?')) return;
    const ex = log.exercises.map(e => ({ ...e, actual_sets: [], completed: false }));
    const updated = { ...log, exercises: ex, completed: false };
    saveLog(updated);
    setLog(updated);
    flash('Sets reset');
  };

  if (!planVersion) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: t.text_muted }}>
        <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.5 }}>📋</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.text_primary }}>No Active Plan</div>
        <div style={{ fontSize: 14, marginTop: 6 }}>Go to the Plan tab to import and apply a plan.</div>
      </div>
    );
  }

  if (!planned || !planned.dayData) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: t.text_muted }}>
        Could not determine today's workout.
      </div>
    );
  }

  const dayData = planned.dayData;
  const completedCount = log ? log.exercises.filter(e => e.completed).length : 0;
  const totalCount = log ? log.exercises.length : 0;

  return (
    <div style={{ padding: 16, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: t.text_muted }}>{formatDate(date)}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: t.text_primary, marginTop: 2 }}>
          {dayData.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 13, color: t.text_secondary }}>{planned.dayName}</span>
          <FocusTags tags={dayData.focus} />
        </div>
        <div className="fm-hide" style={{ fontSize: 12, color: t.text_muted, marginTop: 4 }}>
          {planVersion.title} · v{planVersion.version}
          {dayData.duration && ` · ${dayData.duration}`}
        </div>
      </div>

      {/* Session progress */}
      {log && totalCount > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: t.text_muted }}>Session Progress</span>
            <span style={{ fontSize: 12, color: t.text_secondary, fontWeight: 600 }}>
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <div className="progress-bar-fill" style={{ width: `${(completedCount / totalCount) * 100}%`, height: 6 }} />
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

      {/* Start log button */}
      {!log && (
        <button onClick={startLog} style={{
          width: '100%', padding: 16, background: t.primary, color: '#fff',
          border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 800,
          marginBottom: 16,
        }}>Start Log</button>
      )}

      {/* Warmup */}
      {dayData.warmup?.text && (
        <div className="fm-hide" style={{
          background: t.card, border: `1px solid ${t.border}`,
          borderLeft: `4px solid ${t.warning}`,
          borderRadius: 12, padding: 14, marginBottom: 12,
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: t.warning }}>WARMUP</div>
          <div style={{ fontSize: 13, color: t.text_secondary }}>{dayData.warmup.text}</div>
        </div>
      )}

      {/* Exercises */}
      {log ? (
        <>
          {log.exercises.map((ex, i) => (
            <ExerciseLogger key={i} exercise={ex} index={i} onChange={handleExerciseChange} readOnly={false} />
          ))}

          {!focusMode && <MetaInputs meta={log.meta} onChange={(meta) => setLog({ ...log, meta })} readOnly={false} />}

          {/* Session notes */}
          <div className="fm-hide" style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: t.text_secondary, display: 'block', marginBottom: 4 }}>
              Session Notes
            </label>
            <textarea
              value={log.notes}
              onChange={e => setLog({ ...log, notes: e.target.value })}
              placeholder="How did the session feel?"
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveDraft} style={{
              flex: 1, padding: 14, background: t.surface, color: t.text_primary,
              border: `1px solid ${t.border}`, borderRadius: 12, fontSize: 14, fontWeight: 700,
            }}>Save Draft</button>
            <button onClick={markComplete} style={{
              flex: 1, padding: 14,
              background: log.completed ? t.success : t.primary,
              color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700,
            }}>{log.completed ? '✓ Completed' : 'Mark Complete'}</button>
          </div>
          <button onClick={resetSets} style={{
            width: '100%', padding: 12, background: 'transparent', color: t.danger,
            border: `1px solid ${t.danger}30`, borderRadius: 12, fontSize: 13,
            fontWeight: 600, marginTop: 8,
          }}>Reset Today's Sets</button>
        </>
      ) : (
        dayData.workout.map((ex, i) => (
          <div key={i} style={{
            background: t.card, border: `1px solid ${t.border}`,
            borderLeft: `4px solid ${t.primary}`,
            borderRadius: 12, padding: 14, marginBottom: 8,
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: t.text_primary }}>{ex.name}</div>
            <div style={{ fontSize: 13, color: t.text_secondary, marginTop: 2 }}>
              {ex.sets} × {ex.reps} {ex.unit}
              {ex.restSet !== '—' && ` · Rest ${ex.restSet}`}
              {ex.useTimer && ' ⏱'}
            </div>
            {ex.notes && <div style={{ fontSize: 12, color: t.text_muted, fontStyle: 'italic', marginTop: 2 }}>{ex.notes}</div>}
          </div>
        ))
      )}

      {/* Cooldown */}
      {dayData.cooldown?.text && (
        <div className="fm-hide" style={{
          background: t.card, border: `1px solid ${t.border}`,
          borderLeft: `4px solid ${t.info}`,
          borderRadius: 12, padding: 14, marginTop: 12,
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: t.info }}>COOLDOWN</div>
          <div style={{ fontSize: 13, color: t.text_secondary }}>{dayData.cooldown.text}</div>
        </div>
      )}
    </div>
  );
}
