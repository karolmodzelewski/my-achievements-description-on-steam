import type { LogLevel } from '@nestjs/common';

import { PRODUCTION_STAGE } from '../constants/stage.constants';

export const isProductionStage = (stage: string | undefined): boolean => stage === PRODUCTION_STAGE;

// Debug and verbose logs, including request bodies, are visible only outside production
export const getLogLevels = (stage: string | undefined): LogLevel[] => (isProductionStage(stage) ? ['fatal', 'error', 'warn', 'log'] : ['fatal', 'error', 'warn', 'log', 'debug', 'verbose']);
