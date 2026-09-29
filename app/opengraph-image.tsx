import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt =
  'BladeHaul Auto Transport. The Sharpest Way to Ship Your Car.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), 'public/logo.svg'));
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#F4F4F0',
        color: '#0B0D11',
        padding: '52px 64px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* The existing vector lockup is embedded at build time. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/svg+xml;base64,${logo.toString('base64')}`}
          width={165}
          height={97}
          alt="BladeHaul"
        />
        <div style={{ fontSize: 22, letterSpacing: '3px', color: '#0B0D11' }}>
          AUTO TRANSPORT
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.06,
          letterSpacing: '-3px',
        }}
      >
        <div style={{ display: 'flex' }}>The Sharpest Way</div>
        <div style={{ display: 'flex' }}>to Ship Your Car</div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '2px solid #EA6A11',
          paddingTop: 25,
          fontSize: 25,
        }}
      >
        <span>Sharp on every detail.</span>
        <span>bladehaul.com</span>
      </div>
    </div>,
    size,
  );
}
