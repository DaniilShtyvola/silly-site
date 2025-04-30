import React, { useState, useEffect } from 'react';

const RandomTextEffect: React.FC<{ text: string; speed: number }> = ({
    text,
    speed
}) => {
    const [displayedText, setDisplayedText] = useState<string>(text);
    const [replaceOrder, setReplaceOrder] = useState<number[]>([]);
    const [phase, setPhase] = useState<'randomize' | 'finalize' | 'remove'>('randomize');
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [oldText, setOldText] = useState<string>('');

    const getRandomChar = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>/\\|{}[]:;,.~?·•˙°º×÷∆Ω∑ᚠᚢᚦᚨᚱᚷᚹᚺᚾᛁᛇᛈᛉᛋᛏᛒᛖᛗᛚᛜᛞᛟ';
        return chars.charAt(Math.floor(Math.random() * chars.length));
    };

    useEffect(() => {
        if (text === oldText) return;

        const maxLength = Math.max(oldText.length, text.length);
        const paddedOld = oldText.padEnd(maxLength);

        const order = Array.from({ length: maxLength }, (_, index) => index);
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }

        setDisplayedText(paddedOld);
        setReplaceOrder(order);
        setPhase('randomize');
        setCurrentIndex(0);
        setOldText(text);
    }, [text, oldText]);

    useEffect(() => {
        if (replaceOrder.length === 0) return;

        const intervalId = setInterval(() => {
            if (currentIndex >= replaceOrder.length) {
                if (phase === 'randomize') {
                    setPhase('finalize');
                    setCurrentIndex(0);
                } else if (phase === 'finalize' && displayedText.length > text.length) {
                    setPhase('remove');
                    setCurrentIndex(0);
                }
                clearInterval(intervalId);
                return;
            }

            const idx = replaceOrder[currentIndex];
            setDisplayedText((prev) => {
                const arr = prev.split('');
                if (phase === 'randomize') {
                    arr[idx] = getRandomChar();
                } else if (phase === 'finalize') {
                    arr[idx] = text[idx] ?? '';
                } else if (phase === 'remove' && displayedText.length != text.length) {
                    arr.pop();
                }
                return arr.join('');
            });

            setCurrentIndex((prev) => prev + 1);
        }, speed);

        return () => clearInterval(intervalId);
    }, [phase, currentIndex, replaceOrder, speed, text, displayedText]);

    return <>{displayedText}</>;
};

export default RandomTextEffect;
