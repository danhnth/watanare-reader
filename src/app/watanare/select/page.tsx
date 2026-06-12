import { watanareVolumes } from "@/data/watanare";
import { getVolumeStructure } from "@/lib/epub-parser";
import WatanareSelectClient from "./WatanareSelectClient";

export const dynamic = 'force-static';

export default async function WatanareSelectPage() {
    const volumesWithToc = await Promise.all(
        watanareVolumes.map(async (vol) => {
            if (!vol.epubSource) return { ...vol, toc: null as { label: string; href: string; index: number }[] | null };
            try {
                const structure = await getVolumeStructure(vol.id);
                return { ...vol, toc: structure?.toc || null };
            } catch (e) {
                console.error(`Failed to get structure for ${vol.id}:`, e);
                return { ...vol, toc: null };
            }
        })
    );
    return <WatanareSelectClient volumes={volumesWithToc} />;
}
