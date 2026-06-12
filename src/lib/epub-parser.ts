import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { allWatanareVolumes as volumes } from './watanare-volumes';

const CACHE_VERSION = 'v3';

export interface ChapterContent {
    title: string;
    content: string;
    prevChapter?: { volumeId: string, chapter: number, title?: string };
    nextChapter?: { volumeId: string, chapter: number, title?: string };
    toc?: { label: string, href: string, index: number }[];
    currentSpineIndex?: number;
}

export interface VolumeStructure {
    toc: { label: string, href: string, index: number }[];
    spineIndexToHref: string[];
    manifest: Record<string, string>;
    opfDir: string;
}


export function isStoryChapter(label: string): boolean {
    const lower = label.toLowerCase().trim();

    const skip = [
        'table of contents', 'contents', 'copyright', 'title page', 'gallery',
        'illustration', 'credit', 'colophon', 'nav', 'toc', 'newsletter',
        'author', 'illustrator',
        'synopsis', 'front matter', 'color', 'insert', 'images', 'flyleaf',
        'bonus', 'advertisement', 'preview', 'acknowledgments', 'dedication',
        'postscript', 'afterword'
    ];

    return !skip.some(s => new RegExp(`(?:^|[\\s,;:!?\\-"'(])${s}`, 'i').test(lower));
}


export async function getEpubBuffer(source: string, volumeId: string): Promise<ArrayBuffer | null> {
    const baseDir = process.env.VERCEL ? '/tmp' : process.cwd();
    const CACHE_DIR = path.join(baseDir, '.cache', 'watanare', 'downloads');

    if (source.startsWith('/books/')) {
        try {
            const cleanSource = source.replace(/^\/+/,'');
            const publicPath = path.join('public', cleanSource);
            if (fs.existsSync(publicPath)) {
                const buffer = fs.readFileSync(publicPath);
                return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
            }
        } catch (e) {
        }
    }


    if (!process.env.VERCEL) {
        if (!fs.existsSync(CACHE_DIR)) {
            try {
                fs.mkdirSync(CACHE_DIR, { recursive: true });
            } catch (e) { }
        }
        const cachedFile = path.join(CACHE_DIR, `${volumeId}.epub`);
        if (fs.existsSync(cachedFile)) {
            try {
                const buffer = fs.readFileSync(cachedFile);
                if (buffer.length > 0) {
                    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
                }
            } catch (e) { }
        }
    }

    let resultBuffer: ArrayBuffer | null = null;


    if (!resultBuffer && source.startsWith('http')) {
        try {
            const res = await fetch(source, { cache: 'force-cache' });
            if (!res.ok) throw new Error(`Fetch error: ${res.statusText}`);
            resultBuffer = await res.arrayBuffer();
        } catch (e) {
            return null;
        }
    }

    if (resultBuffer && !process.env.VERCEL) {
        try {
            if (!fs.existsSync(CACHE_DIR)) {
                fs.mkdirSync(CACHE_DIR, { recursive: true });
            }
            const cachedFile = path.join(CACHE_DIR, `${volumeId}.epub`);
            fs.writeFileSync(cachedFile, Buffer.from(resultBuffer));
        } catch (e) { }
    }

    return resultBuffer;
}


export async function getVolumeStructure(volumeId: string, zip?: JSZip): Promise<VolumeStructure | null> {
    const baseDir = process.env.VERCEL ? '/tmp' : process.cwd();
    const CACHE_DIR = path.join(baseDir, '.cache', 'watanare', volumeId);
    const cacheFile = path.join(CACHE_DIR, 'structure.json');

    // Check cache validity against EPUB mtime
    let cacheValid = false;
    if (fs.existsSync(cacheFile)) {
        try {
            const volume = volumes.find(v => v.id === volumeId);
            if (volume?.epubSource) {
                const cleanSource = volume.epubSource.replace(/^\/+/,'');
                const epubPath = path.join('public', cleanSource);
                if (fs.existsSync(epubPath)) {
                    const cacheStat = fs.statSync(cacheFile);
                    const epubStat = fs.statSync(epubPath);
                    if (cacheStat.mtimeMs >= epubStat.mtimeMs) {
                        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
                        if (cached && Array.isArray(cached.toc)) {
                            cacheValid = true;
                            return cached;
                        }
                    }
                }
            } else {
                const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
                if (cached && Array.isArray(cached.toc)) {
                    return cached;
                }
            }
        } catch (e) {
            // Cache read failed, will re-parse
        }
    }

    if (!zip) return null;

    try {

        const containerXml = await zip.file("META-INF/container.xml")?.async("string");
        if (!containerXml) throw new Error("META-INF/container.xml not found");

        const opfPathMatch = containerXml.match(/full-path="([^"]+)"/);
        if (!opfPathMatch) throw new Error("OPF path not found in container.xml");
        const opfPath = opfPathMatch[1];
        const opfDir = path.dirname(opfPath);

        const opfContent = await zip.file(opfPath)?.async("string");
        if (!opfContent) throw new Error(`OPF file not found: ${opfPath}`);


        const manifest: Record<string, string> = {};
        const itemRegex = /<item\s+([^>]+)>/g;
        let match;
        while ((match = itemRegex.exec(opfContent)) !== null) {
            const attrs = match[1];
            const idMatch = attrs.match(/id="([^"]+)"/);
            const hrefMatch = attrs.match(/href="([^"]+)"/);
            if (idMatch && hrefMatch) {
                manifest[idMatch[1]] = hrefMatch[1];
            }
        }

        const spineRefs: string[] = [];
        const spineRegex = /<itemref\s+[^>]*idref="([^"]+)"/g;
        while ((match = spineRegex.exec(opfContent)) !== null) {
            spineRefs.push(match[1]);
        }


        let spineIndexToHref: string[] = spineRefs.map(id => {
            const rel = manifest[id];
            return rel ? (opfDir === '.' ? rel : path.join(opfDir, rel).replace(/\\/g, '/')) : '';
        });


        const spineTagMatch = opfContent.match(/<spine\s+[^>]*toc="([^"]+)"/);
        let ncxId = spineTagMatch ? spineTagMatch[1] : null;

        if (!ncxId) {
            const ncxItemMatch = opfContent.match(/<item\s+[^>]*id="([^"]+)"\s+[^>]*media-type="application\/x-dtbncx\+xml"/);
            if (ncxItemMatch) ncxId = ncxItemMatch[1];
        }

        let toc: { label: string, href: string, index: number }[] = [];


        if (ncxId && manifest[ncxId]) {
            const ncxHref = manifest[ncxId];
            const ncxPath = (opfDir === '.' ? ncxHref : path.join(opfDir, ncxHref)).replace(/\\/g, '/');
            const ncxContent = await zip.file(ncxPath)?.async("string");
            if (ncxContent) {
                const navPointRegex = /<navLabel>\s*<text>([^<]+)<\/text>\s*<\/navLabel>\s*<content\s+src="([^"]+)"/g;
                let navMatch;
                while ((navMatch = navPointRegex.exec(ncxContent)) !== null) {
                    const label = navMatch[1];
                    const src = navMatch[2];


                    const ncxDir = path.dirname(ncxPath);
                    const absPath = path.join(ncxDir, src.split('#')[0]).replace(/\\/g, '/');


                    const index = spineIndexToHref.indexOf(absPath);
                    if (index !== -1) {

                        toc.push({ label, href: src, index: index + 1 });
                    }
                }
            }
        }


        const candidates = spineIndexToHref.map((href, idx) => ({ href, idx })).slice(-5);

        for (const { href, idx } of candidates) {
            const inToc = toc.some(t => t.index === idx + 1);
            if (!inToc) {
                const itemPath = href;
                const content = await zip.file(itemPath)?.async("string");
                if (content) {
                    const lowerContent = content.toLowerCase().substring(0, 2000);
                    let label = "";

                    if (lowerContent.includes('about the author') || lowerContent.includes('author:')) {
                        label = 'About the Author';
                    } else if (lowerContent.includes('postscript')) {
                        label = 'Postscript';
                    } else if (lowerContent.includes('short story') || lowerContent.includes('ss')) {
                        label = 'Short Story';
                    }

                    if (label) {
                        toc.push({ label, href, index: idx + 1 });
                    }
                }
            }
        }


        const volume = volumes.find(v => v.id === volumeId);
        if (volume) {
            const storyChapters = toc.filter(t => isStoryChapter(t.label));

            if (storyChapters.length > 0) {

                const first = storyChapters[0];
                if (!first.label.toLowerCase().includes('prologue')) {
                    if (first.label.match(/^Chapter \d+/)) {
                        first.label = first.label.replace(/^Chapter (\d+)(:?)/, 'Chapter $1 - Prologue $2');
                    } else {
                        first.label = `Prologue: ${first.label}`;
                    }
                }


                if (storyChapters.length > 1) {
                    const last = storyChapters[storyChapters.length - 1];
                    if (!last.label.toLowerCase().includes('epilogue')) {
                        if (last.label.match(/^Chapter \d+/)) {
                            last.label = last.label.replace(/^Chapter (\d+)(:?)/, 'Chapter $1 - Epilogue $2');
                        } else {
                            last.label = `Epilogue: ${last.label}`;
                        }
                    }
                }
            }
        }


        toc = toc.filter(t => !t.label.toLowerCase().includes('newsletter') && !t.label.toLowerCase().includes('legacyemtls'));


        if (volumeId.startsWith('ss-')) {

            toc = toc.filter(t => {
                const filename = t.href.split('/').pop()?.toLowerCase() || '';
                return filename.startsWith('ss-');
            });


        } else {

            toc = toc.filter(t => {
                const filename = t.href.split('/').pop()?.toLowerCase() || '';
                const label = t.label.toLowerCase();

                if (filename.startsWith('ss-')) return false;
                if (label.includes('short story')) return false;


                if (filename.includes('nav.xhtml') || filename.includes('nav.html')) return false;

                return true;
            });
        }

        const hasKuchie = Object.values(manifest).some(href => href && href.includes('kuchie-'));
        if (hasKuchie && !toc.some(t => t.label.toLowerCase().includes('illustration'))) {
            const minIndex = toc.length > 0 ? Math.min(...toc.map(t => t.index)) : spineIndexToHref.length + 1;
            if (minIndex > 1 && !toc.some(t => t.index === 1)) {
                toc.unshift({ label: "Illustrations", href: "__kuchie__", index: 1 });
            }
        }

        const structure: VolumeStructure = {
            toc,
            spineIndexToHref,
            manifest,
            opfDir
        };


        try {
            if (!fs.existsSync(CACHE_DIR)) {
                fs.mkdirSync(CACHE_DIR, { recursive: true });
            }
            fs.writeFileSync(cacheFile, JSON.stringify(structure));
        } catch (e) {

        }

        return structure;

    } catch (e) {
        console.error('getVolumeStructure error:', e);
        return null;
    }
}

export async function getChapterContent(volumeId: string, chapterIndex: number, isLogical: boolean = false): Promise<ChapterContent | null> {
    const volume = volumes.find(v => v.id === volumeId);
    if (!volume || !volume.epubSource) {

        return null;
    }


    let structure = await getVolumeStructure(volumeId);
    let zip: JSZip | null = null;


    if (!structure) {
        const epubBuffer = await getEpubBuffer(volume.epubSource, volumeId);
        if (!epubBuffer) return null;
        zip = await JSZip.loadAsync(epubBuffer);
        structure = await getVolumeStructure(volumeId, zip);
    }

    if (!structure) return null;

    const { toc, spineIndexToHref, manifest, opfDir } = structure;


    let rawIndex = chapterIndex - 1;

    if (isLogical) {
        const storyChapters = toc.filter(t => isStoryChapter(t.label));
        const mappingCandidates = storyChapters.filter(t => !t.label.match(/^Part \d+/i));

        const targetTocItem = mappingCandidates[chapterIndex - 1];

        if (targetTocItem) {
            rawIndex = targetTocItem.index - 1;
            chapterIndex = targetTocItem.index;
        } else {
            if (rawIndex < 0 || rawIndex >= spineIndexToHref.length) return null;
        }
    }








    const baseDir = process.env.VERCEL ? '/tmp' : process.cwd();
    const CACHE_DIR = path.join(baseDir, '.cache', 'watanare', volumeId);
    const cacheFile = path.join(CACHE_DIR, `${chapterIndex}.json`);

    if (fs.existsSync(cacheFile)) {
        try {
            const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
            if (cached && cached.cacheVersion === CACHE_VERSION) {
                return cached;
            }
        } catch (e) {

        }
    }


    if (rawIndex < 0 || rawIndex >= spineIndexToHref.length) {
        return null;
    }


    const currentTocItem = toc.slice().reverse().find(t => t.index <= chapterIndex);
    const bestTitle = currentTocItem ? currentTocItem.label : `Chapter ${chapterIndex}`;

    if (currentTocItem?.href === '__kuchie__') {
        const kuchieImages = Object.values(manifest)
            .filter(href => href && href.includes('kuchie-'))
            .map(href => {
                const basename = path.basename(href);
                const webpPath = basename.replace(/\.(jpg|jpeg|png|tiff)$/i, '.webp');
                const publicUrl = `/images/books/${volumeId}/${webpPath}`;
                return publicUrl.split('/').map(part => encodeURIComponent(part)).join('/').replace('//', '/');
            })
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        let customHtml = '<div class="reader-content">';
        customHtml += '<p class="P__STAR__STAR__STAR__page_break"><span><span>Illustrations</span></span></p>';
        for (const imgUrl of kuchieImages) {
            customHtml += `<p class="P_TEXTBODY_CENTERALIGN"><span><img src="${imgUrl}" loading="lazy" decoding="async" /></span></p>`;
        }
        customHtml += '</div>';

        const sortedToc = toc.slice().sort((a, b) => a.index - b.index);
        const currentStoryIndex = sortedToc.findIndex(t => t.href === '__kuchie__');

        let prevChapterVal = undefined;
        let nextChapterVal = undefined;

        if (currentStoryIndex > 0) {
            const prevStory = sortedToc[currentStoryIndex - 1];
            prevChapterVal = {
                volumeId,
                chapter: prevStory.index,
                title: prevStory.label
            };
        }
        if (currentStoryIndex < sortedToc.length - 1) {
            const nextStory = sortedToc[currentStoryIndex + 1];
            nextChapterVal = {
                volumeId,
                chapter: nextStory.index,
                title: nextStory.label
            };
        }

        const kuchieResult: ChapterContent & { cacheVersion: string } = {
            title: 'Illustrations',
            content: customHtml,
            prevChapter: prevChapterVal,
            nextChapter: nextChapterVal,
            toc,
            currentSpineIndex: chapterIndex,
            cacheVersion: CACHE_VERSION
        };

        try {
            if (!fs.existsSync(CACHE_DIR)) {
                fs.mkdirSync(CACHE_DIR, { recursive: true });
            }
            fs.writeFileSync(cacheFile, JSON.stringify(kuchieResult));
        } catch (e) { }

        return kuchieResult;
    }

    const startIndex = rawIndex;


    const sortedToc = toc.slice().sort((a, b) => a.index - b.index);
    const nextTocItem = sortedToc.find(t => t.index > chapterIndex);


    const endIndex = nextTocItem ? (nextTocItem.index - 1) : spineIndexToHref.length;

    if (!zip) {
        const epubBuffer = await getEpubBuffer(volume.epubSource, volumeId);
        if (!epubBuffer) return null;
        zip = await JSZip.loadAsync(epubBuffer);
    }

    let mergedHtml = '';

    for (let i = startIndex; i < endIndex; i++) {
        const absPath = spineIndexToHref[i];
        const cleanPath = absPath.split('#')[0];
        const chunkRaw = await zip.file(cleanPath)?.async("string");
        if (!chunkRaw) continue;

        const bodyMatch = chunkRaw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        let chunkHtml = bodyMatch ? bodyMatch[1] : chunkRaw;


        const imgRegex = /src="([^"]+)"/g;
        let imgMatch;
        const imagesToLoad: { original: string, fullPath: string }[] = [];

        while ((imgMatch = imgRegex.exec(chunkHtml)) !== null) {
            const imgSrc = imgMatch[1];
            if (!imgSrc.startsWith('http') && !imgSrc.startsWith('data:')) {
                const imgDir = path.dirname(absPath);
                const fullImgPath = path.join(imgDir, imgSrc);
                const normalizedImgPath = fullImgPath.replace(/\\/g, '/');
                imagesToLoad.push({ original: imgSrc, fullPath: normalizedImgPath });
            }
        }


        for (const img of imagesToLoad) {
            const basename = path.basename(img.fullPath);
            const webpPath = basename.replace(/\.(jpg|jpeg|png|tiff)$/i, '.webp');
            const publicUrl = `/images/books/${volumeId}/${webpPath}`;
            const encodedUrl = publicUrl.split('/').map(part => encodeURIComponent(part)).join('/').replace('//', '/');
            chunkHtml = chunkHtml.split(`src="${img.original}"`).join(`src="${encodedUrl}" loading="lazy" decoding="async"`);
        }


        const linkRegex = /href="([^"]+)"/g;
        let linkMatch;
        const linksToReplace: { original: string, newHref: string }[] = [];

        while ((linkMatch = linkRegex.exec(chunkHtml)) !== null) {
            const href = linkMatch[1];
            if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) continue;

            const cleanHref = href.split('#')[0];
            const linkDir = path.dirname(absPath);
            const absLinkPath = (linkDir === '.' ? cleanHref : path.join(linkDir, cleanHref)).replace(/\\/g, '/');


            const linkIndex = spineIndexToHref.indexOf(absLinkPath);
            if (linkIndex !== -1) {
                linksToReplace.push({
                    original: href,
                    newHref: `/read/${volumeId}/${linkIndex + 1}`
                });
            }
        }

        linksToReplace.forEach(link => {
            chunkHtml = chunkHtml.split(`href="${link.original}"`).join(`href="${link.newHref}"`);
        });

        mergedHtml += chunkHtml;
    }

    let cleanHtml = mergedHtml;

    cleanHtml = cleanHtml.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, '');


    if (cleanHtml.includes('Or visit us online') || cleanHtml.includes('gomanga.com/newsletter') || cleanHtml.includes('Seas books and brand-new licenses')) {
        const markers = [
            'Get the latest news about your favorite Seven Seas books',
            'Sign up for our newsletter!',
            'Or visit us online:',
            'gomanga.com/newsletter',
            'sevenseaslogo',
            'Thank you for reading!'
        ];

        let cutIndex = -1;
        for (const marker of markers) {
            const idx = cleanHtml.indexOf(marker);
            if (idx !== -1) {

                const pStart = cleanHtml.lastIndexOf('<p', idx);
                if (pStart !== -1) {
                    if (cutIndex === -1 || pStart < cutIndex) {
                        cutIndex = pStart;
                    }
                }
            }
        }

        if (cutIndex !== -1) {
            cleanHtml = cleanHtml.substring(0, cutIndex);
        }
    }


    const imageBlockRegex = /^\s*<p[^>]*class="P_TEXTBODY_CENTERALIGN"[^>]*>\s*<span>\s*<img[^>]+>\s*<\/span>\s*<\/p>/i;

    if (imageBlockRegex.test(cleanHtml)) {
        cleanHtml = cleanHtml.replace(imageBlockRegex, '');
    }


    if (endIndex < spineIndexToHref.length) {
            const nextAbsPath = spineIndexToHref[endIndex];
            const cleanNextPath = nextAbsPath.split('#')[0];
            const nextHtmlRaw = await zip!.file(cleanNextPath)?.async("string");
            if (nextHtmlRaw) {
                const nextBody = nextHtmlRaw.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || nextHtmlRaw;


                const nextMatch = nextBody.match(imageBlockRegex);
                if (nextMatch) {
                    let imgChunk = nextMatch[0];
                    const imgRegex = /src="([^"]+)"/g;
                    const imgMatch = imgRegex.exec(imgChunk);
                    if (imgMatch) {
                        const imgSrc = imgMatch[1];
                        if (!imgSrc.startsWith('http') && !imgSrc.startsWith('data:')) {
                            const imgDir = path.dirname(nextAbsPath);
                            const fullImgPath = path.join(imgDir, imgSrc);
                            const normalizedImgPath = fullImgPath.replace(/\\/g, '/');
                            const basename = path.basename(normalizedImgPath);
                            const webpPath = basename.replace(/\.(jpg|jpeg|png|tiff)$/i, '.webp');
                            const publicUrl = `/images/books/${volumeId}/${webpPath}`;
                            const encodedUrl = publicUrl.split('/').map(part => encodeURIComponent(part)).join('/').replace('//', '/');
                            imgChunk = imgChunk.replace(`src="${imgSrc}"`, `src="${encodedUrl}" loading="lazy" decoding="async"`);
                        }
                    }
                    cleanHtml += imgChunk;
                }
            }
        }

    if (bestTitle.toLowerCase().includes('epilogue') || bestTitle.toLowerCase().includes('prologue')) {
        const type = bestTitle.toLowerCase().includes('epilogue') ? 'Epilogue' : 'Prologue';

        const chapterTitleRegex = /(>|\s)(Chapter\s+\d+)(:|)(\s*<)/i;
        if (chapterTitleRegex.test(cleanHtml)) {
            cleanHtml = cleanHtml.replace(chapterTitleRegex, `$1$2 - ${type}$3$4`);
        }
    }

    let prevChapterVal = undefined;
    let nextChapterVal = undefined;

    if (isLogical) {
        const storyChapters = toc.filter(t => isStoryChapter(t.label) || (t.href && t.href.startsWith('__') && t.href.endsWith('__')));
        const currentStoryIndex = storyChapters.findIndex(t => t.index === chapterIndex);

        if (currentStoryIndex !== -1) {
            if (currentStoryIndex > 0) {
                const prevStory = storyChapters[currentStoryIndex - 1];
                prevChapterVal = {
                    volumeId,
                    chapter: prevStory.index,
                    title: prevStory.label
                };
            }
            if (currentStoryIndex < storyChapters.length - 1) {
                const nextStory = storyChapters[currentStoryIndex + 1];
                nextChapterVal = {
                    volumeId,
                    chapter: nextStory.index,
                    title: nextStory.label
                };
            }
        }

    } else {


        let pIndex = chapterIndex - 1;
        let prevChapterCandidate = undefined;
        while (pIndex > 0) {
            const tItem = toc.find(t => t.index === pIndex);
            if (tItem && (isStoryChapter(tItem.label) || (tItem.href && tItem.href.startsWith('__') && tItem.href.endsWith('__')))) {
                prevChapterCandidate = {
                    volumeId,
                    chapter: pIndex,
                    title: tItem.label
                };
                break;
            }
            pIndex--;
        }
        prevChapterVal = prevChapterCandidate;


        let nIndex = chapterIndex + 1;
        let nextChapterCandidate = undefined;
        while (nIndex <= spineIndexToHref.length) {
            const tItem = toc.find(t => t.index === nIndex);
            if (tItem && isStoryChapter(tItem.label)) {
                nextChapterCandidate = {
                    volumeId,
                    chapter: nIndex,
                    title: tItem.label
                };
                break;
            }


            if (tItem) {
                nextChapterCandidate = {
                    volumeId,
                    chapter: nIndex,
                    title: tItem.label
                };
                break;
            }

            nIndex++;
        }
        nextChapterVal = nextChapterCandidate;
    }

    const result: ChapterContent & { cacheVersion: string } = {
        title: bestTitle,
        content: cleanHtml,
        prevChapter: prevChapterVal,
        nextChapter: nextChapterVal,
        toc,
        currentSpineIndex: chapterIndex,
        cacheVersion: CACHE_VERSION
    };


    try {
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
        }
        fs.writeFileSync(cacheFile, JSON.stringify(result));
    } catch (e) {

    }


    return result;
}
