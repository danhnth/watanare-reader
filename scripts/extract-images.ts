
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import sharp from 'sharp';
import { allWatanareVolumes as allVolumes } from '../src/lib/watanare-volumes';

const PUBLIC_DIR = path.join(process.cwd(), 'public', 'images', 'books');

/**
 * Recursively remove a directory and all its contents.
 */
function removeDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            removeDir(fullPath);
        } else {
            fs.unlinkSync(fullPath);
        }
    }
    fs.rmdirSync(dir);
}

async function getEpubBuffer(source: string, volumeId: string): Promise<ArrayBuffer | null> {
    const BOOKS_DIR = path.join(process.cwd(), 'public', 'books');

    // Collect all subdirectories under public/books/
    const allDirs: string[] = [];
    if (fs.existsSync(BOOKS_DIR)) {
        const entries = fs.readdirSync(BOOKS_DIR, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                allDirs.push(path.join(BOOKS_DIR, entry.name));
            }
        }
    }

    let searchNames = [path.basename(source)];
    const vol = allVolumes.find(v => v.id === volumeId);

    if (vol) {
        // Also search by volume number patterns
        const vNum = vol.volumeNumber;
        const padded = vNum.length === 1 ? `0${vNum}` : vNum;
        searchNames.push(`Volume ${padded}.epub`);
        searchNames.push(`Volume ${vNum}.epub`);
        searchNames.push(`volume ${vNum}.epub`);
        searchNames.push(`${vNum}.epub`);
    }

    // Search in all book directories
    for (const dir of allDirs) {
        for (const name of searchNames) {
            const p = path.join(dir, name);
            if (fs.existsSync(p)) {
                return fs.readFileSync(p).buffer as ArrayBuffer;
            }
        }
    }

    // Fallback: try direct path from epubSource (strip leading slash)
    if (source) {
        const cleanSource = source.replace(/^\/+/, '');
        const directPath = path.join(process.cwd(), 'public', cleanSource);
        if (fs.existsSync(directPath)) {
            return fs.readFileSync(directPath).buffer as ArrayBuffer;
        }
    }

    return null;
}

async function extractImages() {
    console.log('Starting image extraction...');

    for (const volume of allVolumes) {
        if (!volume.epubSource) continue;
        console.log(`Processing ${volume.id}...`);

        const epubBuffer = await getEpubBuffer(volume.epubSource, volume.id);
        if (!epubBuffer) {
            console.warn(`Could not find EPUB for ${volume.id}`);
            continue;
        }

        const zip = await JSZip.loadAsync(epubBuffer);
        const volumeDir = path.join(PUBLIC_DIR, volume.id);

        // Clean up existing extracted images for this volume to avoid stale files
        if (fs.existsSync(volumeDir)) {
            console.log(`  Cleaning existing images for ${volume.id}...`);
            removeDir(volumeDir);
        }
        fs.mkdirSync(volumeDir, { recursive: true });

        const imageFiles = Object.keys(zip.files).filter(filename =>
            filename.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)
        );

        console.log(`Found ${imageFiles.length} images in ${volume.id}`);

        for (const filename of imageFiles) {
            // Flatten the EPUB internal path (e.g., "item/image/cover.jpg" → "cover.jpg")
            const flatName = path.basename(filename);
            const destPath = path.join(volumeDir, flatName);

            const fileData = await zip.file(filename)?.async('nodebuffer');
            if (fileData) {
                // Non-convertible formats: write as-is
                if (!filename.match(/\.(jpg|jpeg|png|webp|tiff)$/i)) {
                    fs.writeFileSync(destPath, fileData);
                    continue;
                }

                // Convert to WebP
                const webpPath = destPath.replace(/\.(jpg|jpeg|png|tiff)$/i, '.webp');

                try {
                    await sharp(fileData)
                        .webp({ quality: 80 })
                        .toFile(webpPath);
                } catch (err) {
                    console.error(`Failed to convert ${filename} to webp, falling back to original:`, err);
                    fs.writeFileSync(destPath, fileData);
                }
            }
        }
    }

    console.log('Extraction complete!');
}

extractImages();
