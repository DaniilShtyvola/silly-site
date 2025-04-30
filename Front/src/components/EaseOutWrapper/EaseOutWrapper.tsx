import React, { useState, useEffect } from 'react';
import './EaseOutWrapper.css';

interface EaseOutWrapperProps {
    children: React.ReactNode;
    show: boolean;
}

const EaseOutWrapper: React.FC<EaseOutWrapperProps> = ({ children, show }) => {
    const [isVisible, setIsVisible] = useState<boolean>(show);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [show]);

    return (
        isVisible && (
            <div
                className={show ? "slide-in-top" : "slide-out-top"}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                {children}
            </div>
        )
    );
};

export default EaseOutWrapper;