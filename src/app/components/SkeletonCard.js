function bar({ w = '100%', h = 14, mt = 0, r = 6 }) {
  return {
    width: w,
    height: h,
    marginTop: mt,
    borderRadius: r,
    background: 'linear-gradient(90deg, var(--bg3) 25%, var(--border) 50%, var(--bg3) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
  };
}

export default function SkeletonCard({ variant = 'result' }) {
  if (variant === 'detail') {
    return (
      <div style={{ display: 'grid', gap: 24, padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={bar({ w: 90, h: 22, r: 100 })} />
          <div style={bar({ w: 110, h: 22, r: 100 })} />
        </div>
        <div style={bar({ w: '70%', h: 44 })} />
        <div style={bar({ w: '45%', h: 18 })} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginTop: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg2)',
                border: '1.5px solid var(--border2)',
                borderRadius: 'var(--radius)',
                padding: 20,
              }}
            >
              <div style={bar({ w: '50%', h: 12 })} />
              <div style={bar({ w: '70%', h: 24, mt: 10 })} />
            </div>
          ))}
        </div>

        <div
          style={{
            background: 'var(--bg2)',
            border: '1.5px solid var(--border2)',
            borderRadius: 'var(--radius)',
            padding: 28,
            marginTop: 8,
          }}
        >
          <div style={bar({ w: '30%', h: 18 })} />
          <div style={bar({ w: '100%', h: 12, mt: 16 })} />
          <div style={bar({ w: '95%', h: 12, mt: 8 })} />
          <div style={bar({ w: '88%', h: 12, mt: 8 })} />
          <div style={bar({ w: '70%', h: 12, mt: 8 })} />
        </div>
      </div>
    );
  }

  // default: result-card skeleton
  return (
    <div
      style={{
        background: 'var(--bg2)',
        border: '1.5px solid var(--border2)',
        borderRadius: 'var(--radius)',
        padding: 28,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={bar({ w: 90, h: 22, r: 100 })} />
        <div style={bar({ w: 32, h: 32, r: 10 })} />
      </div>
      <div style={bar({ w: 52, h: 52, mt: 18, r: 12 })} />
      <div style={bar({ w: '72%', h: 24, mt: 16 })} />
      <div style={bar({ w: '95%', h: 12, mt: 12 })} />
      <div style={bar({ w: '78%', h: 12, mt: 6 })} />
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid var(--border2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={bar({ w: 70, h: 14 })} />
          <div style={bar({ w: 70, h: 14 })} />
        </div>
        <div style={bar({ w: 70, h: 22, r: 100 })} />
      </div>
    </div>
  );
}
