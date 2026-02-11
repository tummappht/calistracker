import { v4 as uuidv4 } from 'uuid';

const KEYS = {
  PLAN_TEMPLATE: 'ct_plan_template',
  PLAN_VERSIONS: 'ct_plan_versions',
  LOGS: 'ct_logs',
};

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Plan Template ──
export function getPlanTemplate() {
  return load(KEYS.PLAN_TEMPLATE);
}

export function savePlanTemplate(template) {
  save(KEYS.PLAN_TEMPLATE, template);
}

// ── Plan Versions ──
export function getPlanVersions() {
  return load(KEYS.PLAN_VERSIONS) || [];
}

export function getActivePlanVersion() {
  const versions = getPlanVersions();
  return versions.find(v => v.active) || null;
}

export function applyPlanVersion(template) {
  const versions = getPlanVersions();

  const existingForPlan = versions.filter(v => v.plan_id === template.plan_id);
  const nextVersion = existingForPlan.length > 0
    ? Math.max(...existingForPlan.map(v => v.version)) + 1
    : 1;

  // Deactivate all
  versions.forEach(v => { v.active = false; });

  const newVersion = {
    plan_id: template.plan_id,
    version: nextVersion,
    title: template.title,
    timezone: template.timezone,
    created_at: template.created_at,
    applied_at: new Date().toISOString(),
    days: JSON.parse(JSON.stringify(template.days)), // deep copy
    split: JSON.parse(JSON.stringify(template.split)), // deep copy
    active: true,
  };

  versions.push(newVersion);
  save(KEYS.PLAN_VERSIONS, versions);
  return newVersion;
}

// ── Training Logs ──
export function getLogs() {
  return load(KEYS.LOGS) || [];
}

export function getLogForDate(dateStr) {
  const logs = getLogs();
  return logs.find(l => l.date === dateStr) || null;
}

export function saveLog(log) {
  const logs = getLogs();
  const idx = logs.findIndex(l => l.log_id === log.log_id);
  log.updated_at = new Date().toISOString();
  if (idx >= 0) {
    logs[idx] = log;
  } else {
    logs.push(log);
  }
  save(KEYS.LOGS, logs);
  return log;
}

export function createLogFromPlanDay(dateStr, planVersion, dayData) {
  const existing = getLogForDate(dateStr);
  if (existing) return existing;

  const log = {
    log_id: uuidv4(),
    date: dateStr,
    plan_id: planVersion.plan_id,
    plan_version: planVersion.version,
    plan_day: dayData.day,
    focus: [...dayData.focus],
    completed: false,
    exercises: dayData.workout.map(ex => ({
      name: ex.name,
      unit: ex.unit,
      planned_sets: String(ex.sets),
      planned_reps: String(ex.reps),
      planned_restSet: String(ex.restSet),
      planned_restNext: String(ex.restNext),
      planned_useTimer: ex.useTimer,
      planned_notes: ex.notes || '',
      actual_sets: [],
      actual_unit: ex.unit,
      completed: false,
      notes: '',
    })),
    notes: '',
    meta: {
      bodyweight_kg: null,
      sleep_hours: null,
      pain: { wrist: 0, elbow: 0, shoulder: 0, lower_back: 0 },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return saveLog(log);
}

// ── Export ──
export function exportData() {
  const versions = getPlanVersions();
  const logs = getLogs();
  const activeVersion = getActivePlanVersion();

  return {
    type: 'training_logs_export',
    schema_version: 1,
    exported_at: new Date().toISOString(),
    timezone: activeVersion?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    plans: versions.map(v => ({
      plan_id: v.plan_id,
      version: v.version,
      title: v.title,
      created_at: v.created_at,
      applied_at: v.applied_at,
    })),
    plan_versions: versions,
    logs,
  };
}

// ── Normalize a log from old/mixed format to current schema ──
function normalizeLog(log) {
  return {
    log_id: log.log_id || uuidv4(),
    date: log.date,
    plan_id: log.plan_id || 'unknown',
    plan_version: log.plan_version || 0,
    plan_day: log.plan_day || '',
    focus: Array.isArray(log.focus) ? log.focus : [],
    completed: log.completed || false,
    exercises: Array.isArray(log.exercises) ? log.exercises.map(ex => {
      // Detect old format: ex.sets is an array of numbers (actual data)
      const hasOldSets = Array.isArray(ex.sets);
      const hasNewFormat = Array.isArray(ex.actual_sets);

      return {
        name: ex.name || '',
        unit: ex.unit || 'reps',
        planned_sets: ex.planned_sets || '',
        planned_reps: ex.planned_reps || '',
        planned_restSet: ex.planned_restSet || '',
        planned_restNext: ex.planned_restNext || '',
        planned_useTimer: ex.planned_useTimer || false,
        planned_notes: ex.planned_notes || '',
        actual_sets: hasNewFormat ? ex.actual_sets : (hasOldSets ? ex.sets : []),
        actual_unit: ex.actual_unit || ex.unit || 'reps',
        completed: ex.completed || false,
        notes: ex.notes || '',
      };
    }) : [],
    notes: log.notes || '',
    meta: log.meta || {
      bodyweight_kg: null,
      sleep_hours: null,
      pain: { wrist: 0, elbow: 0, shoulder: 0, lower_back: 0 },
    },
    created_at: log.created_at || log.updated_at || new Date().toISOString(),
    updated_at: log.updated_at || new Date().toISOString(),
  };
}

// ── Import ──
export function importData(data) {
  const summary = { addedVersions: 0, addedLogs: 0, conflicts: [] };
  const existingVersions = getPlanVersions();
  const existingLogs = getLogs();

  // Merge plan versions
  if (Array.isArray(data.plan_versions)) {
    for (const pv of data.plan_versions) {
      const existing = existingVersions.find(
        v => v.plan_id === pv.plan_id && v.version === pv.version
      );
      if (!existing) {
        pv.active = false; // don't override active
        existingVersions.push(pv);
        summary.addedVersions++;
      } else {
        const existStr = JSON.stringify({ ...existing, active: false });
        const importStr = JSON.stringify({ ...pv, active: false });
        if (existStr !== importStr) {
          summary.conflicts.push({
            type: 'plan_version',
            plan_id: pv.plan_id,
            version: pv.version,
            message: 'Plan version exists but differs. Keeping existing.',
          });
        }
      }
    }
  }

  // Merge logs (normalize each to current schema)
  if (Array.isArray(data.logs)) {
    for (const rawLog of data.logs) {
      const log = normalizeLog(rawLog);

      const byId = existingLogs.find(l => l.log_id === log.log_id);
      const byDate = existingLogs.find(l => l.date === log.date);

      if (byId) {
        const existStr = JSON.stringify(byId);
        const importStr = JSON.stringify(log);
        if (existStr !== importStr) {
          const conflictLog = { ...log, log_id: uuidv4(), notes: log.notes + (log.notes ? ' ' : '') + '[CONFLICT: imported copy]' };
          existingLogs.push(conflictLog);
          summary.conflicts.push({
            type: 'log',
            date: log.date,
            log_id: log.log_id,
            message: `Log conflict for ${log.date}. Both versions kept.`,
          });
        }
      } else if (byDate) {
        const existStr = JSON.stringify(byDate);
        const importStr = JSON.stringify(log);
        if (existStr !== importStr) {
          const conflictLog = { ...log, log_id: uuidv4(), notes: log.notes + (log.notes ? ' ' : '') + '[CONFLICT: imported copy]' };
          existingLogs.push(conflictLog);
          summary.conflicts.push({
            type: 'log',
            date: log.date,
            log_id: log.log_id,
            message: `Log conflict for ${log.date}. Both versions kept.`,
          });
        }
      } else {
        existingLogs.push(log);
        summary.addedLogs++;
      }
    }
  }

  save(KEYS.PLAN_VERSIONS, existingVersions);
  save(KEYS.LOGS, existingLogs);

  // Keep current active if exists
  const hasActive = existingVersions.some(v => v.active);
  if (!hasActive && existingVersions.length > 0) {
    const latest = [...existingVersions].sort((a, b) => b.applied_at.localeCompare(a.applied_at))[0];
    latest.active = true;
    save(KEYS.PLAN_VERSIONS, existingVersions);
  }

  return summary;
}

// ── Migration Import (legacy logs) ──
export function importLegacyLogs(data) {
  const summary = { imported: 0, errors: [] };
  const existingLogs = getLogs();

  if (!Array.isArray(data)) {
    if (data && Array.isArray(data.logs)) {
      data = data.logs;
    } else {
      return { imported: 0, errors: [{ path: '', message: 'Expected an array of logs or {logs: [...]}' }] };
    }
  }

  for (let i = 0; i < data.length; i++) {
    const log = data[i];
    if (!log.date) {
      summary.errors.push({ path: `[${i}]`, message: 'Missing date field' });
      continue;
    }

    const migrated = normalizeLog(log);

    const exists = existingLogs.find(l => l.log_id === migrated.log_id || l.date === migrated.date);
    if (!exists) {
      existingLogs.push(migrated);
      summary.imported++;
    }
  }

  save(KEYS.LOGS, existingLogs);
  return summary;
}

// ── Clear All ──
export function clearAll() {
  localStorage.removeItem(KEYS.PLAN_TEMPLATE);
  localStorage.removeItem(KEYS.PLAN_VERSIONS);
  localStorage.removeItem(KEYS.LOGS);
}
