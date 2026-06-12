import { MetadataRoute } from 'next';
import { watanareVolumes, watanareSideStories } from '@/data/watanare';

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://watanare-reader.pages.dev';

    // Base routes
    const routes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/watanare`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/watanare/select`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        }
    ];

    // Map all volumes
    const allVolumes = [
        ...watanareVolumes,
        ...watanareSideStories,
    ];

    const volumeRoutes = allVolumes.map((vol) => ({
        url: `${baseUrl}/watanare/read/${vol.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));


    return [...routes, ...volumeRoutes];
}
