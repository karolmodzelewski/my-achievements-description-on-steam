import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { readPng } from './png.util';

import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('readPng', () => {
    let directory: string;
    let pngPath: string;

    const buildPngHeader = (width: number, height: number): Buffer => {
        const header = Buffer.alloc(33);

        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(header, 0);
        header.writeUInt32BE(13, 8);
        header.write('IHDR', 12, 'latin1');
        header.writeUInt32BE(width, 16);
        header.writeUInt32BE(height, 20);

        return header;
    };

    beforeEach(async () => {
        directory = await mkdtemp(join(tmpdir(), 'mados-png-'));
        pngPath = join(directory, 'wallpaper.png');
    });

    afterEach(async () => {
        await rm(directory, { recursive: true, force: true });
    });

    it('should read the size of the image from the header with the size and modification time of the file', async () => {
        // Arrange
        await writeFile(pngPath, buildPngHeader(1920, 1080));

        const { mtimeMs } = await stat(pngPath);

        // Act
        const png = await readPng(pngPath);

        // Assert
        expect(png).toEqual({ width: 1920, height: 1080, size: 33, modifiedAt: Math.round(mtimeMs) });
    });

    it('should find nothing when the wallpaper has not been generated yet', async () => {
        // Act
        const png = await readPng(pngPath);

        // Assert
        expect(png).toBeNull();
    });
});
