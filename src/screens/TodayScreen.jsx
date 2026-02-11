import { useState, useEffect, useCallback } from 'react';
import { getActivePlanVersion, getLogs, getLogForDate, createLogFromPlanDay, saveLog } from '../store/storage';
import { getPlannedDayForDate, todayStr, formatDate } from '../utils/scheduling';
import FocusTags from '../components/FocusTags';
import ExerciseLogger from '../components/ExerciseLogger';
import MetaInputs from '../components/MetaInputs';

export default function TodayScreen() {
  const [date] = useState(todayStr());
  const [planVersion, setPlanVersion] = useState(null);
  const [planned, setPlanned] = useState(null);
  const [log, setLog] = useState(null);
  const [status, setStatus] = useState('');

  const refresh = useCallback(() => {
    const pv = getActivePlanVersion();
    setPlanVersion(pv);

    if (!pv) {
      setPlanned(null);
      setLog(null);
      return;
    }

    const logs = getLogs();
    const existingLog = getLogForDate(date);
    const planned = getPlannedDayForDate(date, pv, logs);
    setPlanned(planned);

    if (existingLog) {
      setLog(existingLog);
    } else {
      setLog(null);
    }
  }, [date]);

  useEffect(() => { refresh(); }, [refresh]);

  const startLog = () => {
    if (!planVersion || !planned?.dayData) return;
    const newLog = createLogFromPlanDay(date, planVersion, planned.dayData);
    setLog(newLog);
    setStatus('Log created!');
    setTimeout(() => setStatus(''), 2000);
  };

  const handleExerciseChange = (idx, updated) => {
    if (!log) return;
    const newExercises = [...log.exercises];
    newExercises[idx] = updated;
    const newLog = { ...log, exercises: newExercises };
    setLog(newLog);
  };

  const saveDraft = () => {
    if (!log) return;
    saveLog(log);
    setStatus('Draft saved!');
    setTimeout(() => setStatus(''), 2000);
  };

  const markComplete = () => {
    if (!log) return;
    const updated = { ...log, completed: true };
    saveLog(updated);
    setLog(updated);
    setStatus('Marked complete!');
    setTimeout(() => setStatus(''), 2000);
  };

  const resetSets = () => {
    if (!log) return;
    if (!window.confirm('Reset all actual sets for today? This cannot be undone.')) return;
    const newExercises = log.exercises.map(ex => ({ ...ex, actual_sets: [], completed: false }));
    const updated = { ...log, exercises: newExercises, completed: false };
    saveLog(updated);
    setLog(updated);
    setStatus('Sets reset!');
    setTimeout(() => setStatus(''), 2000);
  };

  const updateNotes = (val) => {
    setLog({ ...log, notes: val });
  };

  const updateMeta = (meta) => {
    setLog({ ...log, meta });
  };

  if (!planVersion) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>No Active Plan</div>
        <div style={{ fontSize: 14, marginTop: 4 }}>Go to the Plan tab to import and apply a plan.</div>
      </div>
    );
  }

  if (!planned || !planned.dayData) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: 16 }}>Could not determine today's workout.</div>
      </div>
    );
  }

  const dayData = planned.dayData;

  return (
    <div style={{ padding: 16, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#64748b' }}>{formatDate(date)}</div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{dayData.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{planned.dayName}</span>
          <FocusTags tags={dayData.focus} />
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
          {planVersion.title} · v{planVersion.version}
          {dayData.duration && ` · ${dayData.duration}`}
        </div>
      </div>

      {/* Status toast */}
      {status && (
        <div style={{
          background: '#22c55e', color: '#fff', padding: '8px 16px',
          borderRadius: 8, marginBottom: 12, fontSize: 14, fontWeight: 600, textAlign: 'center',
        }}>{status}</div>
      )}

      {/* If no log yet */}
      {!log && (
        <button onClick={startLog} style={{
          width: '100%', padding: 14, background: '#3b82f6', color: '#fff',
          border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700,
          cursor: 'pointer', marginBottom: 16,
        }}>Start Log</button>
      )}

      {/* Warmup */}
      <div style={{
        background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
        padding: 12, marginBottom: 12,
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🔥 Warmup</div>
        <div style={{ fontSize: 13, color: '#92400e' }}>{dayData.warmup.text}</div>
      </div>

      {/* Exercises */}
      {log ? (
        <>
          {log.exercises.map((ex, i) => (
            <ExerciseLogger
              key={i}
              exercise={ex}
              index={i}
              onChange={handleExerciseChange}
              readOnly={false}
            />
          ))}

          {/* Meta */}
          <MetaInputs meta={log.meta} onChange={updateMeta} readOnly={false} />

          {/* Session notes */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Session Notes</label>
            <textarea
              value={log.notes}
              onChange={e => updateNotes(e.target.value)}
              placeholder="How did the session feel?"
              rows={3}
              style={{
                width: '100%', padding: 10, borderRadius: 8,
                border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical',
                boxSizing: 'border-box', marginTop: 4,
              }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={saveDraft} style={{
              flex: 1, padding: 12, background: '#f1f5f9', color: '#334155',
              border: '1px solid #cbd5e1', borderRadius: 10, fontSize: 14,
              fontWeight: 700, cursor: 'pointer',
            }}>Save Draft</button>
            <button onClick={markComplete} style={{
              flex: 1, padding: 12, background: log.completed ? '#22c55e' : '#3b82f6', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 14,
              fontWeight: 700, cursor: 'pointer',
            }}>{log.completed ? '✓ Completed' : 'Mark Complete'}</button>
          </div>
          <button onClick={resetSets} style={{
            width: '100%', padding: 10, background: '#fff', color: '#ef4444',
            border: '1px solid #fca5a5', borderRadius: 10, fontSize: 13,
            fontWeight: 600, cursor: 'pointer', marginTop: 8,
          }}>Reset Today's Sets</button>
        </>
      ) : (
        /* Preview exercises without log */
        dayData.workout.map((ex, i) => (
          <div key={i} style={{
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 10, padding: 12, marginBottom: 8,
          }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{ex.name}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {ex.sets} sets × {ex.reps} {ex.unit}
              {ex.restSet !== '—' && ` · Rest: ${ex.restSet}`}
              {ex.useTimer && ' ⏱'}
            </div>
            {ex.notes && <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>{ex.notes}</div>}
          </div>
        ))
      )}

      {/* Cooldown */}
      <div style={{
        background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
        padding: 12, marginTop: 12,
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>❄️ Cooldown</div>
        <div style={{ fontSize: 13, color: '#166534' }}>{dayData.cooldown.text}</div>
      </div>
    </div>
  );
}
