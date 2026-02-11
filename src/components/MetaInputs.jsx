import { tokens } from '../theme/tokens';

const t = tokens.color;

export default function MetaInputs({ meta, onChange, readOnly }) {
  const update = (path, val) => {
    const newMeta = JSON.parse(JSON.stringify(meta));
    const parts = path.split('.');
    let obj = newMeta;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts[parts.length - 1]] = val;
    onChange(newMeta);
  };

  const painAreas = [
    { key: 'wrist', label: 'Wrist' },
    { key: 'elbow', label: 'Elbow' },
    { key: 'shoulder', label: 'Shoulder' },
    { key: 'lower_back', label: 'Lower Back' },
  ];

  const painColor = (v) =>
    v > 5 ? t.danger : v > 2 ? t.warning : t.success;

  return (
    <div style={{
      background: t.card,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: t.text_primary }}>
        Session Meta
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: t.text_muted, display: 'block', marginBottom: 4 }}>
            Bodyweight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={meta.bodyweight_kg ?? ''}
            onChange={e => update('bodyweight_kg', e.target.value ? parseFloat(e.target.value) : null)}
            disabled={readOnly}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: t.text_muted, display: 'block', marginBottom: 4 }}>
            Sleep (hours)
          </label>
          <input
            type="number"
            step="0.5"
            value={meta.sleep_hours ?? ''}
            onChange={e => update('sleep_hours', e.target.value ? parseFloat(e.target.value) : null)}
            disabled={readOnly}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: t.text_secondary }}>
        Pain Check (0–10)
      </div>
      {painAreas.map(({ key, label }) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: t.text_muted, width: 80, flexShrink: 0 }}>{label}</span>
          <input
            type="range" min="0" max="10"
            value={meta.pain[key]}
            onChange={e => update(`pain.${key}`, parseInt(e.target.value))}
            disabled={readOnly}
            style={{ flex: 1 }}
          />
          <span style={{
            fontSize: 14, fontWeight: 700, width: 24, textAlign: 'right',
            color: painColor(meta.pain[key]),
          }}>{meta.pain[key]}</span>
        </div>
      ))}
    </div>
  );
}
