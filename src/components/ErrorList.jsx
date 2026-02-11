import { useState } from 'react';

export default function ErrorList({ errors }) {
  const [expanded, setExpanded] = useState(false);

  if (!errors || errors.length === 0) return null;

  return (
    <div style={{
      background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10,
      padding: 12, marginBottom: 12,
    }}>
      <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 14, marginBottom: 4 }}>
        Validation Error{errors.length > 1 ? 's' : ''} ({errors.length})
      </div>
      <div style={{
        fontSize: 13, color: '#991b1b', fontFamily: 'monospace',
        background: '#fff', borderRadius: 6, padding: 8,
      }}>
        <div><strong>{errors[0].path}</strong>: {errors[0].message}</div>
      </div>
      {errors.length > 1 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none', border: 'none', color: '#dc2626',
              cursor: 'pointer', fontSize: 12, marginTop: 6, padding: 0,
              textDecoration: 'underline',
            }}
          >
            {expanded ? 'Hide' : 'Show'} all {errors.length} errors
          </button>
          {expanded && (
            <div style={{
              fontSize: 12, color: '#991b1b', fontFamily: 'monospace',
              background: '#fff', borderRadius: 6, padding: 8, marginTop: 6,
              maxHeight: 200, overflow: 'auto',
            }}>
              {errors.map((e, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <strong>{e.path}</strong>: {e.message}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
