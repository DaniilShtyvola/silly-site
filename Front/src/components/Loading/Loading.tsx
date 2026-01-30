import React, { useState, useEffect, useRef } from "react";

import './Loading.css';

import { ProgressBar, Spinner, Button } from "react-bootstrap";

import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faGlobe,
    faServer,
    faPercent,
    faHistory,
    faXmark,
    faCircleInfo,
    faArrowUpRightFromSquare
} from "@fortawesome/free-solid-svg-icons";

import EaseOutWrapper from "../EaseOutWrapper/EaseOutWrapper";
import LoadingDots from "../LoadingDots/LoadingsDots";
import RandomText from "../RandomText/RandomText";
import ExplosionWrapper from "../ExplosionWrapper/ExplosionWrapper";
import { formatTimeAgo } from "../../utils/FormatTime";

interface StageProps {
    icon?: FontAwesomeIconProps['icon'];
    text: string;
    status?: boolean;
    show: boolean;
    size: string;
    fail?: boolean;
}

const Stage: React.FC<StageProps> = ({ icon, text, show, status = true, size, fail }) => {
    const ref = useRef<HTMLDivElement>(null);

    const endsWithDots = text.endsWith("...");

    const iconColor = fail
        ? "rgb(220, 53, 69)"
        : icon && size === "small"
            ? "rgb(100, 105, 111)"
            : status
                ? "rgb(100, 105, 111)"
                : "rgb(25, 135, 84)";

    const iconToShow = icon ? icon : fail ? faXmark : faCheck;

    return (
        <EaseOutWrapper
            show={show}
        >
            <div
                ref={ref}
                style={{
                    display: "flex",
                    overflow: "hidden",
                    fontSize: size === "big" ? "1rem" : "0.7rem",
                    fontWeight: 500,
                    color: size === "big" ? "rgb(137, 143, 150)" : "rgb(100, 105, 111)",
                    alignItems: "center",
                    marginTop: size === "big" ? "6px" : "4px",
                    marginLeft: size === "big" ? "6px" : "30px",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                }}
            >
                {status && !icon && !fail ? (
                    <Spinner
                        style={{
                            width: size === "big" ? "16px" : "10px",
                            height: size === "big" ? "16px" : "10px",
                            borderWidth: size === "big" ? "3px" : "2px"
                        }}
                    />
                ) : (
                    <FontAwesomeIcon
                        style={{
                            color: iconColor,
                            width: size === "big" ? "16px" : "10px"
                        }}
                        icon={iconToShow}
                    />
                )}
                <p style={{ marginLeft: size === "big" ? "6px" : "4px" }}>
                    <RandomText text={endsWithDots ? text.slice(0, -3) : text} speed={10} />
                    {endsWithDots && <LoadingDots />}
                </p>
            </div>
        </EaseOutWrapper>
    );
};

interface LoadingProps {
    onAnimationComplete?: () => void;
}

export const Loading: React.FC<LoadingProps> = ({ onAnimationComplete }) => {
    const [progress, setProgress] = useState(0);
    const [progressBarText, setProgressBarText] = useState<string>("Please Stand By");
    const [waiting, setWaiting] = useState(false);

    const [lastSeenPrevious, setLastSeenPrevious] = useState<string | null>(null);
    const [serverOffline, setServerOffline] = useState<boolean>(false);

    useEffect(() => {
        const checkLocalStorage = () => {
            const lastSeenValue = localStorage.getItem("lastSeenPrevious");
            if (lastSeenValue) {
                setLastSeenPrevious(lastSeenValue);
                setWaiting(false);
            }

            const serverOfflineValue = localStorage.getItem("isServerOffline");
            setServerOffline(serverOfflineValue === "true");
        };

        checkLocalStorage();

        const interval = setInterval(checkLocalStorage, 300);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prevProgress) => {
                let delta = 1;

                if (waiting) {
                    delta = 0.3;
                }

                if (serverOffline) {
                    delta = 5;
                }

                const next = prevProgress + delta;

                if (next >= 150) {
                    clearInterval(interval);
                    return 150;
                }

                if (next > 110) {
                    setProgressBarText("Successfully launched the website!");
                }

                if (waiting && !serverOffline && next >= 100) {
                    return 100;
                }

                return next;
            });
        }, 70);

        return () => clearInterval(interval);
    }, [waiting, serverOffline]);

    useEffect(() => {
        if (progress >= 100 && !lastSeenPrevious) {
            setWaiting(true);
        }
        if (lastSeenPrevious && waiting) {
            setWaiting(false);
        }
    }, [progress, lastSeenPrevious]);

    return (
        <div style={{ paddingTop: "20%" }}>
            <ExplosionWrapper explode={progress > 150} onAnimationComplete={onAnimationComplete}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                    <p
                        style={{
                            color: "white",
                            fontSize: "1.2rem",
                            margin: "4px 4px",
                            fontWeight: "600",
                            textAlign: "center",
                        }}
                    >
                        <RandomText text={progressBarText} speed={20} />
                    </p>

                    <ProgressBar
                        now={progress}
                        label={
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {`${progress < 100 ? progress : 100}`}
                                <FontAwesomeIcon
                                    icon={faPercent}
                                    style={{
                                        marginLeft: "2px",
                                        fontSize: "1rem",
                                        paddingTop: "1px",
                                    }}
                                />
                            </div>
                        }
                        variant="success"
                        style={{
                            backgroundColor: "rgb(33, 37, 41)",
                            width: "480px",
                            height: "18px",
                        }}
                    />

                    <Stage
                        icon={faGlobe}
                        text={progress < 45 ? "Checking your connection..." : "Personal information stolen"}
                        show={progress > 5}
                        status={progress < 35}
                        size="big"
                    />
                    <Stage text="Uploading your entire browser history" show={progress > 12} status={progress < 32} size="small" />
                    <Stage text="Stealing your IP address" show={progress > 28} status={progress < 38} size="small" />
                    <Stage text="Eating your cookies" show={progress > 32} status={progress < 45} size="small" />

                    <Stage
                        icon={faServer}
                        text={serverOffline ? "Failed to connect to backend" : progress < 100 ? "Connecting to the backend..." : "Connected to the mothership"}
                        show={progress > 42}
                        status={progress < 100}
                        size="big"
                        fail={serverOffline}
                    />
                    <Stage text={serverOffline ? "Most features will not work" : "Dusting off the servers"} show={progress > 44} status={progress < 58} size="small" fail={serverOffline} />
                    <Stage icon={serverOffline ? faCircleInfo : undefined} text={serverOffline ? "Please contact site creator" : "Decrypting the ancient scrolls"} show={progress > 56} status={progress < 76} size="small" fail={serverOffline} />
                    {!serverOffline && (
                        <>
                            <Stage text="Activating secret government protocols" show={progress > 72} status={progress < 95} size="small" />

                            <Stage
                                icon={faHistory}
                                text={
                                    lastSeenPrevious
                                        ? `${formatTimeAgo(lastSeenPrevious)} since the last soul dared enter`
                                        : "Gazing into the void..."
                                }
                                show={progress > 90}
                                size="big"
                            />
                        </>
                    )}

                    <EaseOutWrapper
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "1rem",
                        }}
                        show={
                            progress >= 150
                        }
                    >
                        <Button
                            style={{
                                paddingInline: "2rem"
                            }}
                            variant='dark'
                            type='submit'
                            onClick={() => {
                                setProgress(151);
                            }}
                        >
                            <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ marginRight: "4px" }} />Enter
                        </Button>
                    </EaseOutWrapper>
                </div>
            </ExplosionWrapper >
        </div >
    );
};

export default Loading;
