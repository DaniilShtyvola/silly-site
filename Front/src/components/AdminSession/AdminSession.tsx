import { useState } from "react";

import { OverlayTrigger, Tooltip } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGlobe,
    faLanguage,
    faDesktop,
    faClock,
    faLocationDot,
    faHourglassHalf,
    faUser,
    faUserSlash,
    faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

import ExpandToggle from "../ExpandToggle/ExpandToggle";

import { formatTime, formatTimeDiff } from "../../utils/FormatTime";
import { SessionInfo } from "../../models/AdminResponse";
import { LogTypeIcons } from "../../utils/Icons";

interface AdminSessionProps {
    session: SessionInfo;
}

const AdminSession: React.FC<AdminSessionProps> = ({
    session,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCopyUserId = async (userId: string) => {
        await navigator.clipboard.writeText(userId);
    };

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem",
                    backgroundColor: "rgb(33, 37, 41)",
                    marginTop: "1.4rem",
                    color: "white",
                    gap: "2rem",
                }}
            >
                {session.logCount > 0 && (
                    <ExpandToggle
                        isExpanded={isExpanded}
                        onToggle={() => setIsExpanded(!isExpanded)}
                        left="-0.25rem"
                        top="2rem"
                    />
                )}

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                    width: "110px",
                }}>
                    <FontAwesomeIcon
                        icon={faGlobe}
                        style={{
                            marginRight: "4px",
                            color: "rgb(100, 105, 111)"
                        }}
                    />
                    {session.ipAddress}
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                    width: "65px",
                }}>
                    <FontAwesomeIcon
                        icon={faDesktop}
                        style={{
                            marginRight: "4px",
                            color: "rgb(100, 105, 111)"
                        }}
                    />
                    {session.platform}
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                    width: "65px",
                }}>
                    <FontAwesomeIcon
                        icon={faLanguage}
                        style={{
                            marginRight: "4px",
                            color: "rgb(100, 105, 111)"
                        }}
                    />
                    {session.language}
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                    width: "145px",
                }}>
                    <FontAwesomeIcon
                        icon={faLocationDot}
                        style={{
                            marginRight: "4px",
                            color: "rgb(100, 105, 111)"
                        }}
                    />
                    {session.timezone}
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                    width: "165px",
                }}>
                    <FontAwesomeIcon
                        icon={faClock}
                        style={{
                            marginRight: "4px",
                            color: "rgb(100, 105, 111)"
                        }}
                    />
                    {formatTime(session.firstSeen)}
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                    width: "80px",
                }}>
                    <FontAwesomeIcon
                        icon={faHourglassHalf}
                        style={{
                            marginRight: "4px",
                            color: "rgb(100, 105, 111)"
                        }}
                    />
                    {formatTimeDiff(session.firstSeen, session.lastSeen)}
                </div>

                <div>
                    {session.userId ? (
                        <OverlayTrigger
                            placement="bottom"
                            delay={{ show: 700, hide: 0 }}
                            overlay={
                                <Tooltip id={`tooltip-user-${session.id}`}>
                                    {session.userId}
                                </Tooltip>
                            }
                        >
                            <FontAwesomeIcon
                                onClick={() => handleCopyUserId(session.userId!)}
                                icon={faUser}
                                style={{
                                    marginLeft: "4px",
                                    color: "rgb(100, 105, 111)",
                                    cursor: "pointer"
                                }}
                            />
                        </OverlayTrigger>
                    ) : (
                        <FontAwesomeIcon
                            icon={faUserSlash}
                            style={{
                                marginLeft: "4px",
                                color: "rgb(100, 105, 111)"
                            }}
                        />
                    )}
                </div>
            </div>

            {isExpanded && (
                <div style={{
                    marginLeft: "0.6rem"
                }}>
                    {session.logs.map((log, index) => {
                        const isLast = index === session.logs.length - 1;

                        const logType =
                            log.logType in LogTypeIcons
                                ? (log.logType as keyof typeof LogTypeIcons)
                                : null;

                        const icon = logType ? LogTypeIcons[logType].icon : faQuestionCircle;
                        const color = logType ? LogTypeIcons[logType].color : "rgb(100, 105, 111)";

                        return (
                            <div
                                key={log.id}
                                style={{
                                    display: "flex"
                                }}
                            >
                                {/* Thread tree lines */}
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        marginLeft: "1rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            borderLeft: "rgb(49, 53, 58) 2px solid",
                                            borderBottom: "rgb(49, 53, 58) 2px solid",
                                            borderBottomLeftRadius: isLast ? "1rem" : "0",
                                            width: "1rem",
                                            height: "38.5px",
                                        }}
                                    />
                                    <div
                                        style={{
                                            flex: 1,
                                            borderLeft: isLast ? "none" : "rgb(49, 53, 58) 2px solid",
                                        }}
                                    />
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "1rem",
                                        backgroundColor: "rgb(33, 37, 41)",
                                        marginTop: "1rem",
                                        color: "white",
                                        gap: "2rem",
                                    }}
                                >
                                    {/* Log type and message*/}
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "left",
                                    }}>
                                        <FontAwesomeIcon
                                            icon={icon}
                                            style={{
                                                marginRight: "4px",
                                                color: color
                                            }}
                                        />
                                        {log.message}
                                    </div>

                                    {/* Log time */}
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "right",
                                    }}>
                                        <FontAwesomeIcon
                                            icon={faClock}
                                            style={{
                                                marginRight: "4px",
                                                color: "rgb(100, 105, 111)"
                                            }}
                                        />
                                        {formatTime(log.createdAt)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminSession;