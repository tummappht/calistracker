import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, parseISO } from 'date-fns';
import { getLogs, getActivePlanVersion, createLogFromPlanDay, saveLog } from '../store/storage';
import { getPlannedDayForDate } from '../utils/scheduling';
import { tokens } from '../theme/tokens';
import FocusTags from '../components/FocusTags';
import ExerciseLogger from '../components/ExerciseLogger';
import MetaInputs from '../components/MetaInputs';

const t = tokens.color;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedPlanned, setSelectedPlanned] = useState(null);
  const [status, setStatus] = useState('');

  const refresh = () => setLogs(getLogs());
  useEffect(() => { refresh(); }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const logDates = new Set(logs.map(l => l.date));
  const completedDates = new Set(logs.filter(l => l.completed).map(l => l.date));

  const selectDay = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedLog(logs.find(l => l.date === dateStr) || null);
    const pv = getActivePlanVersion();
    setSelectedPlanned(pv ? getPlannedDayForDate(dateStr, pv, getLogs()) : null);
  };

  const createLogForDate = () => {
    if (!selectedDate || !selectedPlanned?.dayData) return;
    const pv = getActivePlanVersion();
    if (!pv) return;
    const newLog = createLogFromPlanDay(selectedDate, pv, selectedPlanned.dayData);
    setSelectedLog(newLog);
    refresh();
    setStatus('Log created');
    setTimeout(() => setStatus(''), 2000);
  };

  const handleExerciseChange = (idx, updated) => {
    if (!selectedLog) return;
    const ex = [...selectedLog.exercises];
    ex[idx] = updated;
    setSelectedLog({ ...selectedLog, exercises: ex });
  };

  const saveCurrentLog = () => {
    if (!selectedLog) return;
    saveLog(selectedLog);
    refresh();
    setStatus('Saved');
    setTimeout(() => setStatus(''), 2000);
  };

  return (
    <div style={{ padding: 16, paddingBottom: 100 }}>
      {/* Month nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={navBtn}>&lt;</button>
        <div style={{ fontSize: 18, fontWeight: 800, color: t.text_primary }}>
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={navBtn}>&gt;</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 6 }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ fontSize: 11, color: t.text_muted, fontWeight: 600, padding: 4 }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {Array(startPad).fill(null).map((_, i) => <div key={`p-${i}`} />)}
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
                background: isSelected ? t.primary : t.card,
                color: isSelected ? '#fff' : t.text_primary,
                border: isToday && !isSelected ? `2px solid ${t.primary}` : `1px solid ${t.border}`,
                borderRadius: 10,
                padding: '10px 2px 6px',
                textAlign: 'center',
                minHeight: 44,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: isToday ? 800 : 500 }}>{format(day, 'd')}</div>
              {hasLog && (
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: isSelected ? '#fff' : isComplete ? t.success : t.warning,
                  margin: '3px auto 0',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Status */}
      {status && (
        <div style={{
          background: t.primary_soft, color: t.primary, padding: '10px 16px',
          borderRadius: 10, marginTop: 12, fontSize: 14, fontWeight: 700, textAlign: 'center',
          border: `1px solid ${t.primary}30`,
        }}>{status}</div>
      )}

      {/* Day detail */}
      {selectedDate && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${t.border}`, paddingTop: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: t.text_primary }}>
            {format(parseISO(selectedDate), 'EEEE, MMM d, yyyy')}
          </div>

          {selectedLog ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: t.text_primary }}>{selectedLog.plan_day}</span>
                <FocusTags tags={selectedLog.focus} />
                {selectedLog.completed && (
                  <span style={{
                    background: `${t.success}18`, color: t.success, padding: '3px 10px',
                    borderRadius: 6, fontSize: 11, fontWeight: 700, border: `1px solid ${t.success}30`,
                  }}>COMPLETE</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: t.text_muted, marginBottom: 14 }}>
                Plan v{selectedLog.plan_version} · Logged {new Date(selectedLog.created_at).toLocaleDateString()}
              </div>

              {selectedLog.exercises.map((ex, i) => (
                <ExerciseLogger key={i} exercise={ex} index={i} onChange={handleExerciseChange} readOnly={false} />
              ))}

              <MetaInputs meta={selectedLog.meta} onChange={(meta) => setSelectedLog({ ...selectedLog, meta })} readOnly={false} />

              {selectedLog.notes && (
                <div style={{
                  background: t.card, borderRadius: 10, padding: 12, marginBottom: 10,
                  fontSize: 13, color: t.text_secondary, border: `1px solid ${t.border}`,
                }}>
                  <span style={{ fontWeight: 700, color: t.text_muted }}>Notes:</span> {selectedLog.notes}
                </div>
              )}

              <button onClick={saveCurrentLog} style={{
                width: '100%', padding: 14, background: t.primary, color: '#fff',
                border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700,
              }}>Save Changes</button>
            </>
          ) : selectedPlanned?.dayData ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: t.text_primary }}>{selectedPlanned.dayName}</span>
                <FocusTags tags={selectedPlanned.dayData.focus} />
              </div>
              <div style={{ fontSize: 13, color: t.text_muted, marginBottom: 10 }}>Planned (no log yet)</div>

              {selectedPlanned.dayData.workout.map((ex, i) => (
                <div key={i} style={{
                  background: t.card, border: `1px solid ${t.border}`,
                  borderLeft: `4px solid ${t.primary}`,
                  borderRadius: 12, padding: 12, marginBottom: 8,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: t.text_primary }}>{ex.name}</div>
                  <div style={{ fontSize: 13, color: t.text_secondary }}>{ex.sets} × {ex.reps} {ex.unit}</div>
                </div>
              ))}

              <button onClick={createLogForDate} style={{
                width: '100%', padding: 14, background: t.primary, color: '#fff',
                border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, marginTop: 8,
              }}>Create Log for This Day</button>
            </>
          ) : (
            <div style={{ fontSize: 14, color: t.text_muted, textAlign: 'center', padding: 20 }}>
              No log and no active plan for this date.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const navBtn = {
  background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
  padding: '8px 16px', fontSize: 18, fontWeight: 700, color: t.text_primary, minHeight: 44,
};
