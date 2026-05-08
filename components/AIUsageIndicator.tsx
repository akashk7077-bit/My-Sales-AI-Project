import React from 'react';
import { useTranscriptionUsage } from '../hooks/useTranscriptionUsage';

export const AIUsageIndicator = () => {
    const { remaining, totalLimit } = useTranscriptionUsage();

    return (
        <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
            AI Transcriptions remaining: {remaining} / {totalLimit}
        </div>
    );
};
