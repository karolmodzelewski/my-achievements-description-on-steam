import { beforeEach, describe, expect, it, vi } from 'vitest';

import { runProcess } from './process.util';

import { execFile } from 'node:child_process';
import type { ExecException } from 'node:child_process';

vi.mock('node:child_process', { spy: true });

describe('runProcess', () => {
    type ExecFileCallback = (error: ExecException | null) => void;

    const environment = { WALLPAPER_TEXT: '10' };

    const mockExecFile = (error: ExecException | null): void => {
        vi.mocked(execFile).mockImplementation(((...args: unknown[]) => {
            (args.at(-1) as ExecFileCallback)(error);
        }) as unknown as typeof execFile);
    };

    beforeEach(() => {
        mockExecFile(null);
    });

    it('should run the file with the arguments, the environment and the timeout', async () => {
        // Act
        await runProcess('gimp.exe', ['--quit'], environment, 1000);

        // Assert
        expect(execFile).toHaveBeenCalledWith('gimp.exe', ['--quit'], { env: environment, timeout: 1000 }, expect.any(Function));
    });

    it('should run the file without a timeout by default', async () => {
        // Act
        await runProcess('gimp.exe', [], environment);

        // Assert
        expect(execFile).toHaveBeenCalledWith('gimp.exe', [], { env: environment, timeout: 0 }, expect.any(Function));
    });

    it('should fail with the error of the process as its cause', async () => {
        // Arrange
        const processError: ExecException = Object.assign(new Error('Command failed: gimp.exe'), { code: 1, cmd: 'gimp.exe' });

        mockExecFile(processError);

        // Act
        const result = runProcess('gimp.exe', [], environment);

        // Assert
        await expect(result).rejects.toMatchObject({ message: 'Command failed: gimp.exe', cause: processError });
    });
});
