// app/sitemap.ts
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://resgo.cc',
      lastModified: new Date(),
      priority: 1.0,
    },
  ];
}
