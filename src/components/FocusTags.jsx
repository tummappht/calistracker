const TAG_COLORS = {
  push: '#e74c3c',
  pull: '#3498db',
  legs: '#2ecc71',
  core: '#f39c12',
  handstand: '#9b59b6',
};

export default function FocusTags({ tags }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {tags.map((tag, i) => (
        <span key={i} style={{
          background: TAG_COLORS[tag] || '#888',
          color: '#fff',
          padding: '2px 10px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>{tag}</span>
      ))}
    </div>
  );
}
