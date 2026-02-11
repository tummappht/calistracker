export default function MetaInputs({ meta, onChange, readOnly }) {
  const update = (path, val) => {
    const newMeta = JSON.parse(JSON.stringify(meta));
    const parts = path.split('.');
    let obj = newMeta;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts[parts.length - 1]] = val;
    onChange(newMeta);
  };

  const sliderStyle = {
    width: '100%', accentColor: '#3b82f6',
  };

  const painAreas = [
    { key: 'wrist', label: 'Wrist' },
    { key: 'elbow', label: 'Elbow' },
    { key: 'shoulder', label: 'Shoulder' },
    { key: 'lower_back', label: 'Lower Back' },
  ];

  return (
    <div style={{
      background: '#f8fafc', border: '1px solid #e2e8f0',
      borderRadius: 10, padding: 14, marginBottom: 12,
    }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Session Meta</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: '#64748b' }}>Bodyweight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={meta.bodyweight_kg ?? ''}
            onChange={e => update('bodyweight_kg', e.target.value ? parseFloat(e.target.value) : null)}
            disabled={readOnly}
            style={{
              width: '100%', padding: '6px 10px', borderRadius: 8,
              border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#64748b' }}>Sleep (hours)</label>
          <input
            type="number"
            step="0.5"
            value={meta.sleep_hours ?? ''}
            onChange={e => update('sleep_hours', e.target.value ? parseFloat(e.target.value) : null)}
            disabled={readOnly}
            style={{
              width: '100%', padding: '6px 10px', borderRadius: 8,
              border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Pain Check (0–10)</div>
      {painAreas.map(({ key, label }) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: '#64748b', width: 80 }}>{label}</span>
          <input
            type="range" min="0" max="10"
            value={meta.pain[key]}
            onChange={e => update(`pain.${key}`, parseInt(e.target.value))}
            disabled={readOnly}
            style={sliderStyle}
          />
          <span style={{ fontSize: 12, fontWeight: 700, width: 20, textAlign: 'right',
            color: meta.pain[key] > 5 ? '#ef4444' : meta.pain[key] > 2 ? '#f59e0b' : '#22c55e'
          }}>{meta.pain[key]}</span>
        </div>
      ))}
    </div>
  );
}
