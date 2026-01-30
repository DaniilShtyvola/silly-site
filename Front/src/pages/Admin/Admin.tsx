import React, { useState, useEffect } from "react";

import { Button, Spinner } from "react-bootstrap";

import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFaceSadTear,
    faDownload,
} from "@fortawesome/free-solid-svg-icons";

import ToastMessage from "../../components/ToastMessage/ToastMessage";

import { SessionsResponse, SessionInfo } from "../../models/AdminResponse";
import GlitchText from "../../components/GlitchText/GlitchText";
import AdminSession from "../../components/AdminSession/AdminSession";

const API_URL = import.meta.env.VITE_API_URL;

const Admin: React.FC = () => {
    const [sessions, setSessions] = useState<SessionInfo[]>([]);

    const [totalSessions, setTotalSessions] = useState(0);
    const [skip, setSkip] = useState(0);
    const [take, setTake] = useState(10);

    const [loading, setLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [serverOffline, setServerOffline] = useState<boolean>(false);

    const [message, setMessage] = useState<{
        text: string;
        variant: string;
        icon: any;
    } | null>(null);

    const fetchSessions = async (newSkip: number, newTake: number, append = false) => {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        try {
            if (!append) setLoading(true);

            const response = await axios.get<SessionsResponse>(
                `${API_URL}/tracking/sessions?skip=${newSkip}&take=${newTake}`,
                { headers }
            );

            if (append) {
                setSessions(prev => [...prev, ...response.data.sessions]);
            } else {
                setSessions(response.data.sessions);
            }

            setTotalSessions(response.data.totalSessions);
        } catch (err) {
            console.error("Failed to fetch sessions:", err);
            setMessage({
                text: "Failed to fetch sessions.",
                variant: "danger",
                icon: faFaceSadTear,
            });
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    const loadMore = () => {
        const remaining = totalSessions - sessions.length;
        if (remaining <= 0) return;

        setIsLoadingMore(true);

        const newSkip = skip + take;
        const newTake = Math.min(10, remaining);

        fetchSessions(newSkip, newTake, true);
        setSkip(newSkip);
        setTake(newTake);
    };

    useEffect(() => {
        const serverOfflineValue = localStorage.getItem("isServerOffline") === "true";
        setServerOffline(serverOfflineValue);

        if (serverOfflineValue) {
            setLoading(false);
            return;
        }

        fetchSessions(0, 10, false);
    }, []);

    return (
        <div>
            {loading ? (
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "2rem"
                }}>
                    <Spinner
                        style={{
                            width: "21px",
                            height: "21px",
                            borderWidth: "3px",
                            color: "rgb(137, 143, 150)"
                        }}
                    />
                </div>
            ) : sessions ? (
                <>
                    <div>
                        {sessions.map(session => (
                            <AdminSession session={session} key={session.id} />
                        ))}
                    </div>

                    {/* Load more section */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "1.5rem",
                            marginBottom: "2rem",
                        }}
                    >
                        {sessions.length < totalSessions ? (
                            <Button
                                style={{ 
                                    display: "flex", 
                                    alignItems: "center" 
                                }}
                                variant="dark"
                                onClick={loadMore}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? (
                                    <Spinner
                                        style={{
                                            width: "21px",
                                            height: "21px",
                                            borderWidth: "3px",
                                        }}
                                    />
                                ) : (
                                    <>
                                        <FontAwesomeIcon
                                            icon={faDownload}
                                            style={{ marginRight: "4px" }}
                                        />
                                        Load more
                                    </>
                                )}
                            </Button>
                        ) : (
                            <p
                                style={{
                                    color: "rgb(137, 143, 150)",
                                    fontSize: "0.9rem",
                                }}
                            >
                                <FontAwesomeIcon icon={faFaceSadTear} /> No more sessions
                            </p>
                        )}
                    </div>
                </>
            ) : (
                <p
                    style={{
                        color: "rgb(137, 143, 150)",
                        fontSize: "0.9rem",
                        textAlign: "center",
                    }}
                >
                    <GlitchText text={serverOffline ? "Server is offline." : "No board data."} />
                </p>
            )}

            {message && (
                <ToastMessage
                    message={message}
                    onClose={() => setMessage(null)}
                />
            )}
        </div>
    );
};

export default Admin;
