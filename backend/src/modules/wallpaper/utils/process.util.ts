import { execFile } from 'node:child_process';

export const runProcess = (file: string, args: string[], environment: NodeJS.ProcessEnv, timeout = 0): Promise<void> =>
    new Promise((resolve, reject) => {
        execFile(file, args, { env: environment, timeout }, (error) => {
            if (error !== null) {
                reject(new Error(error.message, { cause: error }));

                return;
            }

            resolve();
        });
    });
