import { getChapterContent, getEpubBuffer, getVolumeStructure } from "@/lib/epub-parser";
import { HtmlReader } from "@/components/reader/HtmlReader";
import { notFound } from "next/navigation";
import { allWatanareVolumes } from "@/lib/watanare-volumes";
import JSZip from "jszip";

export async function generateStaticParams() {
    const params: { volumeId: string; chapterIndex: string }[] = [];

    for (const volume of allWatanareVolumes) {
        if (volume.epubSource) {
            try {
                let structure = await getVolumeStructure(volume.id);
                if (!structure) {
                    const epubBuffer = await getEpubBuffer(volume.epubSource, volume.id);
                    if (epubBuffer) {
                        const zip = await JSZip.loadAsync(epubBuffer);
                        structure = await getVolumeStructure(volume.id, zip);
                    }
                }
                if (structure && structure.spineIndexToHref) {
                    for (let i = 1; i <= structure.spineIndexToHref.length; i++) {
                        params.push({ volumeId: volume.id, chapterIndex: i.toString() });
                    }
                }
            } catch (e) {
                console.error(`Error generating params for ${volume.id}:`, e);
            }
        }
    }

    return params;
}

export default async function WatanareReadPage({ params }: { params: Promise<{ volumeId: string, chapterIndex: string }> }) {
    const { volumeId, chapterIndex } = await params;
    const index = parseInt(chapterIndex);

    if (isNaN(index)) notFound();

    const volume = allWatanareVolumes.find(v => v.id === volumeId);

    if (!volume) {
        notFound();
    }

    const data = await getChapterContent(volumeId, index, false);

    if (!data) {
        notFound();
    }

    return (
        <HtmlReader
            content={data.content}
            title={data.title}
            volumeId={volumeId}
            chapterIndex={index}
            prevChapter={data.prevChapter}
            nextChapter={data.nextChapter}
            toc={data.toc}
            volumeTitle={volume?.title || volumeId}
            epubSource={volume?.epubSource}
            detailsLink="/watanare/select"
            returnLink="/watanare"
            currentSpineIndex={data.currentSpineIndex}
        />
    );
}
