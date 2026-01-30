import axios from "axios";

interface ClientInfoRequest {
    userAgent: string;
    language: string;
    platform: string;
    timezone: string;
}

interface CreateSessionResponse {
    sessionId: string;
    lastSeenPrevious?: string | null;
}

interface CreateLogRequest {
    sessionId: string;
    message: string;
    logType: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export async function createSession(): Promise<string | null> {
    const token = localStorage.getItem("token");

    const payload: ClientInfoRequest = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    };

    try {
        const response = await axios.post<CreateSessionResponse>(
            `${API_URL}/tracking/session`,
            payload,
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
        );

        const { sessionId, lastSeenPrevious } = response.data;

        localStorage.setItem("sessionId", sessionId);

        if (lastSeenPrevious) {
            localStorage.setItem("lastSeenPrevious", lastSeenPrevious);
        } else {
            localStorage.removeItem("lastSeenPrevious");
        }

        localStorage.setItem("isServerOffline", "false");

        return sessionId;
    } catch (error) {
        localStorage.setItem("isServerOffline", "true");
        return null;
    }
}

export async function sendLog(message: string, logType: string) {
    if (localStorage.getItem("isServerOffline") === "true") {
        return;
    }

    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
        sessionId = await createSession();
    }

    if (!sessionId) {
        return;
    }

    const token = localStorage.getItem("token");
    const payload: CreateLogRequest = {
        sessionId,
        message,
        logType,
    };

    await axios.post(`${API_URL}/tracking/log`, payload, {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
}
