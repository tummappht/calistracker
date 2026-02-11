import { useState } from 'react';

export default function ExerciseLogger({ exercise, index, onChange, readOnly }) {
  const [inputVal, setInputVal] = useState('');

  const addSet = () => {
    const val = parseFloat(inputVal);
    if (isNaN(val) || val < 0) return;
    const updated = { ...exercise, actual_sets: [...exercise.actual_sets, val] };
    onChange(index, updated);
    setInputVal('');
  };

  const removeSet = (setIdx) => {
    const updated = {
      ...exercise,
      actual_sets: exercise.actual_sets.filter((_, i) => i !== setIdx),
    };
    onChange(index, updated);
  };

  const toggleCompleted = () => {
    onChange(index, { ...exercise, completed: !exercise.completed });
  };

  const updateNotes = (val) => {
    onChange(index, { ...exercise, notes: val });
  };

  const unitLabel = exercise.unit === 'sec' ? 's' : '';

  return (
    <div style={{
      background: exercise.completed ? '#f0fdf4' : '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{exercise.name}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            {exercise.planned_sets} sets × {exercise.planned_reps} {exercise.unit}
            {exercise.planned_restSet !== '—' && ` · Rest: ${exercise.planned_restSet}`}
            {exercise.planned_useTimer && ' ⏱'}
          </div>
          {exercise.planned_notes && (
            <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', marginTop: 2 }}>
              {exercise.planned_notes}
            </div>
          )}
        </div>
        {!readOnly && (
          <button
            onClick={toggleCompleted}
            style={{
              background: exercise.completed ? '#22c55e' : '#e2e8f0',
              color: exercise.completed ? '#fff' : '#64748b',
              border: 'none',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {exercise.completed ? '✓ Done' : 'Mark'}
          </button>
        )}
      </div>

      {/* Actual sets display */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {exercise.actual_sets.map((val, si) => (
          <span key={si} style={{
            background: '#e0f2fe',
            padding: '3px 10px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}>
            {val}{unitLabel}
            {!readOnly && (
              <button onClick={() => removeSet(si)} style={{
                background: 'none', border: 'none', color: '#ef4444',
                cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1,
              }}>×</button>
            )}
          </span>
        ))}
        {exercise.actual_sets.length === 0 && (
          <span style={{ fontSize: 12, color: '#94a3b8' }}>No sets logged</span>
        )}
      </div>

      {/* Input row */}
      {!readOnly && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
          <input
            type="number"
            placeholder={exercise.unit === 'sec' ? 'seconds' : 'reps'}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSet()}
            style={{
              flex: 1, padding: '6px 10px', borderRadius: 8,
              border: '1px solid #d1d5db', fontSize: 14,
            }}
          />
          <button onClick={addSet} style={{
            background: '#3b82f6', color: '#fff', border: 'none',
            borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
            fontWeight: 600, fontSize: 13,
          }}>+ Set</button>
          {/* Quick fill chips */}
          {[5, 10, 15].map(v => (
            <button key={v} onClick={() => {
              const updated = { ...exercise, actual_sets: [...exercise.actual_sets, v] };
              onChange(index, updated);
            }} style={{
              background: '#f1f5f9', border: '1px solid #e2e8f0',
              borderRadius: 8, padding: '4px 8px', cursor: 'pointer',
              fontSize: 12, color: '#475569',
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
          style={{
            width: '100%', padding: '5px 10px', borderRadius: 8,
            border: '1px solid #e5e7eb', fontSize: 13, boxSizing: 'border-box',
          }}
        />
      ) : exercise.notes ? (
        <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>{exercise.notes}</div>
      ) : null}
    </div>
  );
}
