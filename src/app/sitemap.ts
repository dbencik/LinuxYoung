import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lessons = Array.from({ length: 20 }, (_, i) => ({
    url: `https://linux4teens.vercel.app/lesson/${i + 1}`,
    lastModified: new Date(),
  }));

  return [
    { url: "https://linux4teens.vercel.app", lastModified: new Date() },
    ...lessons,
  ];
}
