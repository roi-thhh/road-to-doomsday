import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Road to Doomsday - Avengers: Doomsday MCU Watch Order Tracker';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0c0c0c',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #1e1e1e 0%, #0c0c0c 100%)',
          padding: '48px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Badges */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              backgroundColor: '#FFE81F',
              color: '#000000',
              padding: '8px 24px',
              borderRadius: '9999px',
              fontWeight: 900,
              fontSize: 22,
              border: '4px solid #000000',
              boxShadow: '4px 4px 0px #FF2E4C',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ⚡ DOOMSDAY ROADMAP 2026
          </div>
          <div
            style={{
              backgroundColor: '#FF2E4C',
              color: '#FFFFFF',
              padding: '8px 24px',
              borderRadius: '9999px',
              fontWeight: 900,
              fontSize: 20,
              border: '4px solid #000000',
            }}
          >
            COUPLES WATCH SYNC
          </div>
        </div>

        {/* Center Title & Graphic */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '-2px',
              lineHeight: 1.05,
              textShadow: '6px 6px 0px #000000',
            }}
          >
            ROAD TO DOOMSDAY
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: '#FFE81F',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginTop: '12px',
            }}
          >
            THE DEFINITIVE MCU WATCH TIMELINE & SYNC TRACKER
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#A1A1AA',
              marginTop: '16px',
              maxWidth: '850px',
            }}
          >
            Track Chronological & Release Order • Filter Doomsday Essentials • Real-Time Partner Sync
          </div>
        </div>

        {/* Bottom Feature Tags */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div
            style={{
              backgroundColor: '#2E86FF',
              color: '#FFFFFF',
              padding: '10px 20px',
              borderRadius: '12px',
              border: '3px solid #000000',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            🎬 All Phases 1 - 6
          </div>
          <div
            style={{
              backgroundColor: '#00E599',
              color: '#000000',
              padding: '10px 20px',
              borderRadius: '12px',
              border: '3px solid #000000',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            🔥 Doomsday Essentials
          </div>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              color: '#000000',
              padding: '10px 20px',
              borderRadius: '12px',
              border: '3px solid #000000',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            🌐 doomsdayraodmap.me
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
