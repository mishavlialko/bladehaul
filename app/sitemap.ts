import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bladehaul.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const contentUpdated = new Date('2026-10-12T00:00:00Z');
  return [
    {
      url: SITE_URL,
      lastModified: contentUpdated,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date('2026-10-16T00:00:00Z'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date('2026-10-16T00:00:00Z'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...[
      '/contact',
      '/car-shipping-cost',
      '/open-vs-enclosed-car-shipping',
      '/booking-and-payment',
    ].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: contentUpdated,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
