import { Logger } from '@nestjs/common';

// Applied to every spec by the setupFiles option of Vitest, so logs of the tested code don't clutter the output.
// Logger methods can still be spied on to check what's logged
Logger.overrideLogger(false);
