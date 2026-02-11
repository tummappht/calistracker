import { useState, useRef } from 'react';
import { tokens } from '../theme/tokens';
import { useTheme } from '../theme/ThemeContext';

const t = tokens.color;

export default function ExerciseLogger({ exercise, index, onChange, readOnly }) {
  const [inputVal, setInputVal] = useState('');
  const [animSet, setAnimSet] = useState(null);
  const { focusMode } = useTheme();
  const cardRef = useRef(null);

  const triggerSetAnim = (setIdx) => {
    setAnimSet(setIdx);
    setTimeout(() => setAnimSet(null), 250);
  };

  const addSet = () => {
    const val = parseFloat(inputVal);
    if (isNaN(val) || val < 0) return;
    const updated = { ...exercise, actual_sets: [...exercise.actual_sets, val] };
    onChange(index, updated);
    setInputVal('');
    triggerSetAnim(updated.actual_sets.length - 1);
  };

  const addQuick = (val) => {
    const updated = { ...exercise, actual_sets: [...exercise.actual_sets, val] };
    onChange(index, updated);
    triggerSetAnim(updated.actual_sets.length - 1);
  };

  const removeSet = (setIdx) => {
    const updated = {
      ...exercise,
      actual_sets: exercise.actual_sets.filter((_, i) => i !== setIdx),
    };
    onChange(index, updated);
  };

  const toggleCompleted = () => {
    const updated = { ...exercise, completed: !exercise.completed };
    onChange(index, updated);
    if (!exercise.completed && cardRef.current) {
      cardRef.current.classList.add('anim-complete');
      setTimeout(() => cardRef.current?.classList.remove('anim-complete'), 700);
    }
  };

  const updateNotes = (val) => {
    onChange(index, { ...exercise, notes: val });
  };

  const unitLabel = exercise.unit === 'sec' ? 's' : '';
  const plannedTotal = parseInt(exercise.planned_sets) || 0;
  const actualCount = exercise.actual_sets.length;
  const progress = plannedTotal > 0 ? Math.min(actualCount / plannedTotal, 1) : 0;

  return (
    <div
      ref={cardRef}
      style={{
        background: t.card,
        border: `1px solid ${exercise.completed ? t.success + '40' : t.border}`,
        borderLeft: `4px solid ${exercise.completed ? t.success : t.primary}`,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        transition: 'border-color 200ms ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: t.text_primary }}>{exercise.name}</div>
          <div style={{ fontSize: 13, color: t.text_secondary, marginTop: 2 }}>
            {exercise.planned_sets} sets × {exercise.planned_reps} {exercise.unit}
            {exercise.planned_restSet && exercise.planned_restSet !== '—' && (
              <span style={{ color: t.text_muted }}> · Rest {exercise.planned_restSet}</span>
            )}
            {exercise.planned_useTimer && <span style={{ marginLeft: 4 }}>⏱</span>}
          </div>
          {!focusMode && exercise.planned_notes && (
            <div style={{ fontSize: 12, color: t.text_muted, fontStyle: 'italic', marginTop: 2 }}>
              {exercise.planned_notes}
            </div>
          )}
        </div>
        {!readOnly && (
          <button
            onClick={toggleCompleted}
            style={{
              background: exercise.completed ? t.success : t.surface,
              color: exercise.completed ? '#fff' : t.text_muted,
              border: `1px solid ${exercise.completed ? t.success : t.border}`,
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              minHeight: 36,
              transition: 'all 150ms ease',
            }}
          >
            {exercise.completed ? '✓ Done' : 'Mark'}
          </button>
        )}
      </div>

      {/* Progress bar */}
      {plannedTotal > 0 && (
        <div className="progress-bar" style={{ marginBottom: 10 }}>
          <div className="progress-bar-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      )}

      {/* Actual sets */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, minHeight: 28 }}>
        {exercise.actual_sets.map((val, si) => (
          <span
            key={si}
            className={animSet === si ? 'anim-set-logged' : ''}
            style={{
              background: t.primary_soft,
              color: t.primary,
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              border: `1px solid ${t.primary}25`,
            }}
          >
            {val}{unitLabel}
            {!readOnly && (
              <button onClick={() => removeSet(si)} style={{
                background: 'none', border: 'none', color: t.danger,
                cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1,
                minHeight: 'auto',
              }}>×</button>
            )}
          </span>
        ))}
        {exercise.actual_sets.length === 0 && (
          <span style={{ fontSize: 12, color: t.text_muted }}>No sets logged</span>
        )}
      </div>

      {/* Input row */}
      {!readOnly && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
          <input
            type="number"
            placeholder={exercise.unit === 'sec' ? 'seconds' : 'reps'}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSet()}
            style={{ flex: 1, minHeight: 44 }}
          />
          <button onClick={addSet} style={{
            background: t.primary, color: '#fff', border: 'none',
            borderRadius: 8, padding: '0 16px', fontWeight: 700, fontSize: 14,
            minHeight: 44,
          }}>+ Set</button>
          {!focusMode && [5, 10, 15].map(v => (
            <button key={v} onClick={() => addQuick(v)} style={{
              background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 8, padding: '0 10px', fontSize: 12,
              color: t.text_secondary, minHeight: 44,
            }}>+{v}</button>
          ))}
        </div>
      )}

      {/* Notes */}
      {!readOnly ? (
        <input
          type="text"
          placeholder="Exercise notes..."
          value={exercise.notes}
          onChange={e => updateNotes(e.target.value)}
          className={focusMode ? 'fm-subtle' : ''}
          style={{ width: '100%' }}
        />
      ) : exercise.notes ? (
        <div style={{ fontSize: 13, color: t.text_muted, fontStyle: 'italic' }}>{exercise.notes}</div>
      ) : null}
    </div>
  );
}
