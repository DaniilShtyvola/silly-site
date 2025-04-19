import React, { useState, useEffect, useRef } from "react";
import './Loading.css';

import { ProgressBar, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { faCheck, faSatellite, faGlobe, faMagnifyingGlass, faServer, faHourglassStart, faPercent } from "@fortawesome/free-solid-svg-icons";

import LoadingDots from "../LoadingDots/LoadingsDots";
import RandomText from "../RandomText/RandomText";
import ExplosionWrapper from "../ExplosionWrapper/ExplosionWrapper";

interface StageProps {
    icon?: FontAwesomeIconProps['icon'];
    text: string;
    status: boolean;
    show: boolean;
    size: string;
    hide?: boolean;
}

const Stage: React.FC<StageProps> = ({ icon, text, show, status, size, hide }) => {
    const [oldText, setOldText] = useState(text);
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);
    const [height, setHeight] = useState<string | number>("auto");

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (text !== oldText) {
            setOldText(oldText);
        }
    }, [text]);

    const endsWithDots = text.endsWith("...");

    useEffect(() => {
        if (hide) {
            if (ref.current) {
                const el = ref.current;
                setHeight(el.scrollHeight);
                requestAnimationFrame(() => {
                    setIsVisible(false);
                    setHeight(0);
                });

                const timeout = setTimeout(() => {
                    setShouldRender(false);
                }, 300);

                return () => clearTimeout(timeout);
            }
        } else {
            setShouldRender(true);
            setIsVisible(true);
            if (ref.current) {
                const el = ref.current;
                const fullHeight = el.scrollHeight;
                setHeight(0);
                requestAnimationFrame(() => {
                    setHeight(fullHeight);
                });

                const timeout = setTimeout(() => {
                    setHeight("15px");
                }, 300);

                return () => clearTimeout(timeout);
            }
        }
    }, [hide]);

    if (!shouldRender) return null;

    return (
        <div
            ref={ref}
            style={{
                display: "flex",
                overflow: "hidden",
                fontSize: size === "big" ? "14px" : "10px",
                fontWeight: 500,
                color: size === "big" ? "rgb(137, 143, 150)" : "rgb(100, 105, 111)",
                alignItems: "center",
                marginTop: size === "big" ? "6px" : "4px",
                marginLeft: size === "big" ? "6px" : "30px",
                opacity: isVisible && show ? 1 : 0,
                transform: isVisible && show ? "translateY(0)" : "translateY(-10px)",
                transition: "opacity 0.3s ease, transform 0.3s ease, height 0.3s ease",
                height: height
            }}
        >
            {status && !icon ? (
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
                        color: icon && size === "small"
                            ? "rgb(100, 105, 111)"
                            : status
                                ? "rgb(100, 105, 111)"
                                : "rgb(25, 135, 84)",
                        width: size === "big" ? "16px" : "10px"
                    }}
                    icon={icon || faCheck}
                />
            )}
            <p style={{ marginLeft: size === "big" ? "6px" : "4px" }}>
                {endsWithDots ? (
                    <>
                        {text.slice(0, -3)}<LoadingDots />
                    </>
                ) : text === oldText ? (
                    <>{text}</>
                ) : (
                    <RandomText oldText={oldText} newText={text} speed={10} />
                )}
            </p>
        </div>
    );
};

const Loading = () => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prevProgress) => {
                const next = prevProgress + 1;
                if (prevProgress === 150) {
                    clearInterval(interval);
                    return prevProgress;
                }

                return next;
            });
        }, 150);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            paddingTop: "20%"
        }}>
            <ExplosionWrapper explode={progress >= 125}>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                }}>
                    <p style={{
                        color: "rgb(197, 202, 209)",
                        fontSize: "120%",
                        margin: "4px 4px",
                        fontWeight: "600",
                        textAlign: "center"
                    }}>
                        {progress < 110 ? (
                            "Please Stand By"
                        ) : (
                            <RandomText oldText="Please Stand By" newText="Succesfully launched the website!" speed={10} />
                        )}
                    </p>
                    <ProgressBar
                        now={progress}
                        label={
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                {`${progress < 100 ? progress : 100}`}
                                <FontAwesomeIcon
                                    icon={faPercent}
                                    style={{
                                        marginLeft: '2px',
                                        fontSize: "14px",
                                        paddingTop: "1px"
                                    }}
                                />
                            </div>
                        }
                        variant="success"
                        style={{
                            backgroundColor: "rgb(33, 37, 41)",
                            width: "480px",
                            height: "18px"
                        }}
                    />

                    <Stage icon={faGlobe} text={progress < 35 ? "Checking your connection..." : "Personal information stolen"} show={progress > 5} status={progress < 35} size="big" />
                    <Stage text="Eating your cookies" show={progress > 6} status={progress < 10} hide={progress > 43} size="small" />
                    <Stage text="Installing spyware that you won't even notice" show={progress > 10} status={progress < 21} hide={progress > 43} size="small" />
                    <Stage text="Uploading your entire browser history" show={progress > 21} status={progress < 30} hide={progress > 43} size="small" />
                    <Stage text="Stealing your IP address" show={progress > 30} status={progress < 35} hide={progress > 43} size="small" />

                    <Stage icon={faSatellite} text={progress < 59 ? "Connecting to satellite..." : "Satellite configuration changed"} show={progress > 35} status={progress < 59} size="big" />
                    <Stage text="Sending signal to the satellite" show={progress > 37} status={progress < 40} hide={progress > 67} size="small" />
                    <Stage text="Aligning satellite to lock onto your location" show={progress > 40} status={progress < 54} hide={progress > 67} size="small" />
                    <Stage text="Adjusting the lens" show={progress > 54} status={progress < 59} hide={progress > 67} size="small" />

                    <Stage icon={faMagnifyingGlass} text={progress < 78 ? "Tracking your shady activities..." : "Interpol has been notified"} show={progress > 59} status={progress < 78} size="big" />
                    <Stage text="Accessing secret files" show={progress > 60} status={progress < 68} hide={progress > 86} size="small" />
                    <Stage text="Scanning international criminal databases" show={progress > 68} status={progress < 74} hide={progress > 86} size="small" />
                    <Stage text="Examining your international criminal connections" show={progress > 74} status={progress < 78} hide={progress > 86} size="small" />
                    <Stage icon={faHourglassStart} text="Stay exactly where you are" show={progress > 76} status={progress < 78} size="small" />

                    <Stage icon={faServer} text={progress < 100 ? "Connecting to the backend..." : "Connected to the mothership"} show={progress > 78} status={progress < 100} size="big" />
                    <Stage text="Calculating the chances of success" show={progress > 79} status={progress < 86} hide={progress > 108} size="small" />
                    <Stage text="Dusting off the servers" show={progress > 86} status={progress < 90} hide={progress > 108} size="small" />
                    <Stage text="Decrypting the ancient scrolls" show={progress > 90} status={progress < 95} hide={progress > 108} size="small" />
                    <Stage text="Hacking into the Matrix" show={progress > 95} status={progress < 97} hide={progress > 108} size="small" />
                    <Stage text="Activating secret government protocols" show={progress > 97} status={progress < 100} hide={progress > 108} size="small" />
                </div>
            </ExplosionWrapper>
        </div>
    );
};

export default Loading;
