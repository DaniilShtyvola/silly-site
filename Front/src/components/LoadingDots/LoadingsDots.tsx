import { useState, useEffect } from "react";

const LoadingDots = () => {
    const [dotCount, setDotCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setDotCount((prevCount) => (prevCount + 1) % 4);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const generateDots = () => {
        return ".".repeat(dotCount);
    };

    return (
        <span>{generateDots()}</span>
    );
};

export default LoadingDots;