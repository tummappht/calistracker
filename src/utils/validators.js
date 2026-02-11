const VALID_FOCUS_TAGS = ['push', 'pull', 'legs', 'core', 'handstand'];
const VALID_UNITS = ['reps', 'sec'];

export function validatePlanTemplate(json) {
  const errors = [];

  if (!json || typeof json !== 'object') {
    return [{ path: '', message: 'Plan must be a JSON object' }];
  }

  if (!json.plan_id) errors.push({ path: 'plan_id', message: 'plan_id is required' });
  if (!json.title) errors.push({ path: 'title', message: 'title is required' });
  if (!json.timezone) errors.push({ path: 'timezone', message: 'timezone is required' });
  if (!json.created_at) errors.push({ path: 'created_at', message: 'created_at is required' });

  if (!json.split || typeof json.split !== 'object') {
    errors.push({ path: 'split', message: 'split object is required' });
  } else {
    if (!json.split.type) errors.push({ path: 'split.type', message: 'split.type is required' });
    if (!Array.isArray(json.split.order)) {
      errors.push({ path: 'split.order', message: 'split.order must be an array' });
    }
    if (!Array.isArray(json.split.weekly_pattern)) {
      errors.push({ path: 'split.weekly_pattern', message: 'split.weekly_pattern must be an array' });
    } else {
      json.split.weekly_pattern.forEach((tag, i) => {
        if (tag === 'rest') {
          errors.push({
            path: `split.weekly_pattern[${i}]`,
            message: `Invalid tag 'rest'. There is no "rest" focus tag. Use focus ["core"] with a "Recovery Mobility Flow" workout item instead.`
          });
        } else if (!VALID_FOCUS_TAGS.includes(tag)) {
          errors.push({ path: `split.weekly_pattern[${i}]`, message: `Invalid focus tag '${tag}'. Allowed: ${VALID_FOCUS_TAGS.join(', ')}` });
        }
      });
    }
  }

  if (!Array.isArray(json.days)) {
    errors.push({ path: 'days', message: 'days must be an array' });
  } else {
    if (json.split && Array.isArray(json.split.order) && json.split.order.length !== json.days.length) {
      errors.push({ path: 'split.order', message: `split.order length (${json.split.order.length}) must match days count (${json.days.length})` });
    }

    json.days.forEach((day, i) => {
      const dp = `days[${i}]`;
      if (!day.day) errors.push({ path: `${dp}.day`, message: 'day identifier is required' });
      if (!day.title) errors.push({ path: `${dp}.title`, message: 'title is required' });

      if (!Array.isArray(day.focus) || day.focus.length === 0) {
        errors.push({ path: `${dp}.focus`, message: 'focus must be a non-empty array' });
      } else {
        day.focus.forEach((tag, j) => {
          if (tag === 'rest') {
            errors.push({
              path: `${dp}.focus[${j}]`,
              message: `Invalid tag 'rest'. Use focus ["core"] with a "Recovery Mobility Flow" workout item instead.`
            });
          } else if (!VALID_FOCUS_TAGS.includes(tag)) {
            errors.push({ path: `${dp}.focus[${j}]`, message: `Invalid focus tag '${tag}'. Allowed: ${VALID_FOCUS_TAGS.join(', ')}` });
          }
        });
      }

      if (!Array.isArray(day.workout) || day.workout.length === 0) {
        errors.push({ path: `${dp}.workout`, message: 'workout must be a non-empty array' });
      } else {
        day.workout.forEach((ex, j) => {
          const ep = `${dp}.workout[${j}]`;
          if (!ex.name) errors.push({ path: `${ep}.name`, message: 'name is required' });
          if (ex.sets === undefined || ex.sets === null) errors.push({ path: `${ep}.sets`, message: 'sets is required' });
          if (ex.reps === undefined || ex.reps === null) errors.push({ path: `${ep}.reps`, message: 'reps is required' });
          if (ex.restSet === undefined || ex.restSet === null) errors.push({ path: `${ep}.restSet`, message: 'restSet is required' });
          if (ex.restNext === undefined || ex.restNext === null) errors.push({ path: `${ep}.restNext`, message: 'restNext is required' });
          if (!VALID_UNITS.includes(ex.unit)) {
            errors.push({ path: `${ep}.unit`, message: `unit must be 'reps' or 'sec', got '${ex.unit}'` });
          }
          if (typeof ex.useTimer !== 'boolean') {
            errors.push({ path: `${ep}.useTimer`, message: 'useTimer must be a boolean' });
          }
        });
      }
    });
  }

  return errors;
}

export function validateExportJSON(json) {
  const errors = [];

  if (!json || typeof json !== 'object') {
    return [{ path: '', message: 'Export must be a JSON object' }];
  }

  if (json.type !== 'training_logs_export') {
    errors.push({ path: 'type', message: `type must be 'training_logs_export'` });
  }

  if (json.schema_version !== 1) {
    errors.push({ path: 'schema_version', message: 'Unsupported schema_version. Only version 1 is supported.' });
  }

  if (!json.exported_at) errors.push({ path: 'exported_at', message: 'exported_at is required' });

  if (json.plan_versions !== undefined && !Array.isArray(json.plan_versions)) {
    errors.push({ path: 'plan_versions', message: 'plan_versions must be an array if provided' });
  }

  if (!Array.isArray(json.logs)) {
    errors.push({ path: 'logs', message: 'logs must be an array' });
  } else {
    json.logs.forEach((log, i) => {
      const lp = `logs[${i}]`;
      if (!log.date) errors.push({ path: `${lp}.date`, message: 'date is required' });
      if (!log.plan_id) errors.push({ path: `${lp}.plan_id`, message: 'plan_id is required' });
    });
  }

  return errors;
}
