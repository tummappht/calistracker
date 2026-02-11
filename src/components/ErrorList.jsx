import { useState } from 'react';
import { tokens } from '../theme/tokens';

const t = tokens.color;

export default function ErrorList({ errors }) {
  const [expanded, setExpanded] = useState(false);

  if (!errors || errors.length === 0) return null;

  return (
    <div style={{
      background: t.danger_soft,
      border: `1px solid ${t.danger}40`,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    }}>
      <div style={{ fontWeight: 700, color: t.danger, fontSize: 14, marginBottom: 6 }}>
        Validation Error{errors.length > 1 ? 's' : ''} ({errors.length})
      </div>
      <div style={{
        fontSize: 13, color: t.text_primary, fontFamily: 'monospace',
        background: t.surface, borderRadius: 8, padding: 10,
        border: `1px solid ${t.border}`,
      }}>
        <div><span style={{ color: t.primary, fontWeight: 700 }}>{errors[0].path}</span>: {errors[0].message}</div>
      </div>
      {errors.length > 1 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none', border: 'none', color: t.danger,
              fontSize: 12, marginTop: 8, padding: 0,
              textDecoration: 'underline', minHeight: 'auto',
            }}
          >
            {expanded ? 'Hide' : 'Show'} all {errors.length} errors
          </button>
          {expanded && (
            <div style={{
              fontSize: 12, color: t.text_secondary, fontFamily: 'monospace',
              background: t.surface, borderRadius: 8, padding: 10, marginTop: 8,
              maxHeight: 200, overflow: 'auto',
              border: `1px solid ${t.border}`,
            }}>
              {errors.map((e, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <span style={{ color: t.primary, fontWeight: 700 }}>{e.path}</span>: {e.message}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
