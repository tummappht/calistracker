import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, parseISO } from 'date-fns';
import { getLogs, getActivePlanVersion, getLogForDate, createLogFromPlanDay, saveLog } from '../store/storage';
import { getPlannedDayForDate } from '../utils/scheduling';
import FocusTags from '../components/FocusTags';
import ExerciseLogger from '../components/ExerciseLogger';
import MetaInputs from '../components/MetaInputs';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedPlanned, setSelectedPlanned] = useState(null);
  const [status, setStatus] = useState('');

  const refresh = () => {
    setLogs(getLogs());
  };

  useEffect(() => { refresh(); }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const logDates = new Set(logs.map(l => l.date));
  const completedDates = new Set(logs.filter(l => l.completed).map(l => l.date));

  const selectDay = (dateStr) => {
    setSelectedDate(dateStr);
    const log = logs.find(l => l.date === dateStr) || null;
    setSelectedLog(log);

    const pv = getActivePlanVersion();
    if (pv) {
      const allLogs = getLogs();
      const planned = getPlannedDayForDate(dateStr, pv, allLogs);
      setSelectedPlanned(planned);
    } else {
      setSelectedPlanned(null);
    }
  };

  const createLogForDate = () => {
    if (!selectedDate || !selectedPlanned?.dayData) return;
    const pv = getActivePlanVersion();
    if (!pv) return;
    const newLog = createLogFromPlanDay(selectedDate, pv, selectedPlanned.dayData);
    setSelectedLog(newLog);
    refresh();
    setStatus('Log created!');
    setTimeout(() => setStatus(''), 2000);
  };

  const handleExerciseChange = (idx, updated) => {
    if (!selectedLog) return;
    const newExercises = [...selectedLog.exercises];
    newExercises[idx] = updated;
    setSelectedLog({ ...selectedLog, exercises: newExercises });
  };

  const saveCurrentLog = () => {
    if (!selectedLog) return;
    saveLog(selectedLog);
    refresh();
    setStatus('Saved!');
    setTimeout(() => setStatus(''), 2000);
  };

  return (
    <div style={{ padding: 16, paddingBottom: 100 }}>
      {/* Month nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={navBtn}>&lt;</button>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{format(currentMonth, 'MMMM yyyy')}</div>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={navBtn}>&gt;</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 4 }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, padding: 4 }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {Array(startPad).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
        {daysInMonth.map(day => {
          const ds = format(day, 'yyyy-MM-dd');
          const hasLog = logDates.has(ds);
          const isComplete = completedDates.has(ds);
          const isSelected = selectedDate === ds;
          const isToday = ds === format(new Date(), 'yyyy-MM-dd');

          return (
            <button
              key={ds}
              onClick={() => selectDay(ds)}
              style={{
                background: isSelected ? '#3b82f6' : isToday ? '#eff6ff' : '#fff',
                color: isSelected ? '#fff' : '#1e293b',
                border: isToday && !isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '8px 2px 4px',
                cursor: 'pointer',
                textAlign: 'center',
                position: 'relative',
                minHeight: 40,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: isToday ? 700 : 500 }}>{format(day, 'd')}</div>
              {hasLog && (
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: isComplete ? '#22c55e' : '#f59e0b',
                  margin: '2px auto 0',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Status */}
      {status && (
        <div style={{
          background: '#22c55e', color: '#fff', padding: '8px 16px',
          borderRadius: 8, marginTop: 12, fontSize: 14, fontWeight: 600, textAlign: 'center',
        }}>{status}</div>
      )}

      {/* Day detail */}
      {selectedDate && (
        <div style={{ marginTop: 16, borderTop: '2px solid #e2e8f0', paddingTop: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            {format(parseISO(selectedDate), 'EEEE, MMM d, yyyy')}
          </div>

          {selectedLog ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedLog.plan_day}</span>
                <FocusTags tags={selectedLog.focus} />
                {selectedLog.completed && (
                  <span style={{
                    background: '#22c55e', color: '#fff', padding: '2px 8px',
                    borderRadius: 8, fontSize: 11, fontWeight: 700,
                  }}>COMPLETE</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                Plan v{selectedLog.plan_version} · Logged {new Date(selectedLog.created_at).toLocaleDateString()}
              </div>

              {selectedLog.exercises.map((ex, i) => (
                <ExerciseLogger
                  key={i}
                  exercise={ex}
                  index={i}
                  onChange={handleExerciseChange}
                  readOnly={false}
                />
              ))}

              <MetaInputs meta={selectedLog.meta} onChange={(meta) => setSelectedLog({ ...selectedLog, meta })} readOnly={false} />

              {selectedLog.notes && (
                <div style={{
                  background: '#f8fafc', borderRadius: 8, padding: 10, marginBottom: 8,
                  fontSize: 13, color: '#475569',
                }}>
                  <strong>Notes:</strong> {selectedLog.notes}
                </div>
              )}

              <button onClick={saveCurrentLog} style={{
                width: '100%', padding: 12, background: '#3b82f6', color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 14,
                fontWeight: 700, cursor: 'pointer',
              }}>Save Changes</button>
            </>
          ) : selectedPlanned?.dayData ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedPlanned.dayName}</span>
                <FocusTags tags={selectedPlanned.dayData.focus} />
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Planned (no log yet)</div>

              {selectedPlanned.dayData.workout.map((ex, i) => (
                <div key={i} style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: 10, padding: 12, marginBottom: 8,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{ex.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    {ex.sets} × {ex.reps} {ex.unit}
                  </div>
                </div>
              ))}

              <button onClick={createLogForDate} style={{
                width: '100%', padding: 12, background: '#3b82f6', color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 14,
                fontWeight: 700, cursor: 'pointer', marginTop: 8,
              }}>Create Log for This Day</button>
            </>
          ) : (
            <div style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>
              No log and no active plan for this date.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const navBtn = {
  background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8,
  padding: '6px 14px', cursor: 'pointer', fontSize: 18, fontWeight: 700, color: '#334155',
};
