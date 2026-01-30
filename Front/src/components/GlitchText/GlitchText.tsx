import React, { useEffect, useState } from "react";
import "./GlitchText.css";

interface GlitchTextProps {
    text: string;
    speed?: number; // інтервал між глітч-смужками
    glitchProbability?: number; // ймовірність символу бути глітчевим
    glitchDuration?: number; // скільки мс символ лишається глітчем
}

const GlitchText: React.FC<GlitchTextProps> = ({
    text,
    speed = 500,
    glitchProbability = 0.2,
    glitchDuration = 100,
}) => {
    const [displayedText, setDisplayedText] = useState<string>(text);

    const chars =
        "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>/\\|{}[]:;,.~?·•˙°º×÷∆Ω∑ᚠᚢᚦᚨᚱᚷᚹᚺᚾᛁᛇᛈᛉᛋᛏᛒᛖᛗᛚᛜᛞᛟ";

    useEffect(() => {
        setDisplayedText(text);
    }, [text]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setDisplayedText((prev) => {
                const arr = prev.split("");
                const originalArr = text.split("");

                const glitchIndexes: number[] = [];
                for (let i = 0; i < arr.length; i++) {
                    if (Math.random() < glitchProbability) {
                        arr[i] = chars[Math.floor(Math.random() * chars.length)];
                        glitchIndexes.push(i);
                    } else {
                        arr[i] = originalArr[i];
                    }
                }

                setTimeout(() => {
                    setDisplayedText((current) => {
                        const currArr = current.split("");
                        glitchIndexes.forEach((idx) => {
                            currArr[idx] = originalArr[idx];
                        });
                        return currArr.join("");
                    });
                }, glitchDuration);

                return arr.join("");
            });
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed, glitchProbability, glitchDuration]);

    return (
        <span className="glitch-text" data-text={text}>
            {displayedText}
        </span>
    );
};

export default GlitchText;
