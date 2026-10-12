import type { Metadata } from 'next';

export default function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    twitter: { card: 'summary_large_image', title, description },
  };
}
