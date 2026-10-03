import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

/** Square favicon: header wordmark on white (Google wants ~square ≥48px). */
export default async function Icon() {
  const logo = await readFile(join(process.cwd(), 'public/logo.svg'));
  const src = `data:image/svg+xml;base64,${logo.toString('base64')}`;
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={160} height={94} alt="" />
    </div>,
    { ...size },
  );
}
