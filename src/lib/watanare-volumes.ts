import { watanareVolumes, watanareSideStories } from "@/data/watanare";

export const allWatanareVolumes = [
    ...watanareVolumes,
    ...watanareSideStories
];

export function findWatanareVolumeById(id: string | null) {
    if (!id) return null;
    return allWatanareVolumes.find(vol => vol.id === id);
}

// Aliases for lib/volumes.ts compatibility
export const allVolumes = allWatanareVolumes;

export function findVolumeByUrl(url: string | null) {
    if (!url) return null;
    let decodedUrl = url;
    try {
        decodedUrl = decodeURIComponent(url);
    } catch (e) { }

    let found = allVolumes.find(vol => vol.epubSource === decodedUrl);

    if (!found) found = allVolumes.find(vol => vol.epubSource === url);

    if (!found) {
        const cleanUrl = decodedUrl.split('?')[0];
        found = allVolumes.find(vol => vol.epubSource?.split('?')[0] === cleanUrl);
    }

    if (!found) {
        const targetFilename = decodedUrl.split('?')[0].split('/').pop();
        if (targetFilename) {
            found = allVolumes.find(vol => {
                const volFilename = vol.epubSource?.split('?')[0].split('/').pop();
                return volFilename === targetFilename;
            });
            if (found) { }
        }
    }

    if (!found) {

    } else {

    }

    return found;
}

export function findVolumeById(id: string | null) {
    if (!id) return null;
    return allVolumes.find(vol => vol.id === id);
}

// Aliases for lib/all-volumes.ts compatibility
export interface VolumeData {
    id: string;
    title: string;
    coverImage: string;
    volumeNumber: string;
    releaseDateJP?: string;
    releaseDateEN?: string;
}

export function getVolumeById(id: string): VolumeData | undefined {
    return allVolumes.find(v => v.id === id);
}
