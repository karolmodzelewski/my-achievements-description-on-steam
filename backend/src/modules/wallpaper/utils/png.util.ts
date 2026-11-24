import type { WallpaperPng } from '../interfaces/wallpaper-png.interface';

import { open } from 'node:fs/promises';

// The IHDR chunk always comes right after the 8 bytes of the signature, with the width and height after its length and type
const PNG_HEADER_LENGTH = 24;
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;

const isMissingFileError = (error: unknown): boolean => (error as NodeJS.ErrnoException).code === 'ENOENT';

// Reads only the header, so the size is known without loading the whole PNG
export const readPng = async (path: string): Promise<WallpaperPng | null> => {
    const file = await open(path).catch((error: unknown) => {
        if (isMissingFileError(error)) {
            return null;
        }

        throw error;
    });

    if (!file) {
        return null;
    }

    try {
        const { size, mtimeMs } = await file.stat();
        const { buffer } = await file.read(Buffer.alloc(PNG_HEADER_LENGTH), 0, PNG_HEADER_LENGTH, 0);

        return { width: buffer.readUInt32BE(PNG_WIDTH_OFFSET), height: buffer.readUInt32BE(PNG_HEIGHT_OFFSET), size, modifiedAt: Math.round(mtimeMs) };
    } finally {
        await file.close();
    }
};
