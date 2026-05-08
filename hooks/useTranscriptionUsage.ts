import { useState, useEffect } from 'react';

const DAILY_LIMIT = 5;

export const useTranscriptionUsage = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const saved = localStorage.getItem(`transcriptions_${today}`);
        setCount(saved ? parseInt(saved, 10) : 0);
    }, []);

    const increment = () => {
        const today = new Date().toISOString().split('T')[0];
        const newCount = count + 1;
        localStorage.setItem(`transcriptions_${today}`, newCount.toString());
        setCount(newCount);
    };

    const remaining = Math.max(0, DAILY_LIMIT - count);

    return { count, remaining, increment, totalLimit: DAILY_LIMIT };
};
