import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#f4ede2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 36,
        }}
      >
        {/* Film reel circles */}
        <div style={{
          width: 110,
          height: 110,
          borderRadius: '50%',
          border: '7px solid #b8622e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          {/* Center hub */}
          <div style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: '#b8622e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f4ede2' }} />
          </div>
        </div>
        {/* CS text below */}
        <div style={{
          position: 'absolute',
          bottom: 22,
          fontFamily: 'serif',
          fontSize: 18,
          fontWeight: 700,
          color: '#b8622e',
          letterSpacing: 3,
        }}>
          CS
        </div>
      </div>
    ),
    { ...size }
  )
}
