import { getFocusColor } from '../theme/tokens';

export default function FocusTags({ tags }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {tags.map((tag, i) => {
        const color = getFocusColor(tag);
        return (
          <span key={i} style={{
            background: `${color}18`,
            color: color,
            padding: '3px 10px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            border: `1px solid ${color}30`,
          }}>{tag}</span>
        );
      })}
    </div>
  );
}
