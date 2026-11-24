import { runProcess } from './process.util';
import { GIMP_CONSOLE_PATHS, GIMP_RESULT_FILE_NAME, GIMP_SCRIPT_PATH, GIMP_TIMEOUT } from '../constants/wallpaper.constants';
import type { GimpResult } from '../interfaces/gimp-result.interface';

import { existsSync } from 'node:fs';
import { readFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export const findGimpConsolePath = (): string | null => GIMP_CONSOLE_PATHS.find((path) => existsSync(path)) ?? null;

// Puts the text into the only text layer of the source XCF and saves the result as the given XCF and PNG
export const runGimpScript = async (gimpConsolePath: string, sourcePath: string, xcfPath: string, pngPath: string, text: string): Promise<GimpResult> => {
    const resultPath = join(dirname(xcfPath), GIMP_RESULT_FILE_NAME);
    const environment = { ...process.env, WALLPAPER_SOURCE: sourcePath, WALLPAPER_XCF: xcfPath, WALLPAPER_PNG: pngPath, WALLPAPER_TEXT: text, WALLPAPER_RESULT: resultPath };

    await rm(resultPath, { force: true });
    await runProcess(gimpConsolePath, ['-i', '--batch-interpreter=python-fu-eval', '-b', `exec(open(r'${GIMP_SCRIPT_PATH}', encoding='utf-8').read())`, '--quit'], environment, GIMP_TIMEOUT);

    const result = JSON.parse(await readFile(resultPath, 'utf8')) as GimpResult;

    await rm(resultPath, { force: true });

    return result;
};
