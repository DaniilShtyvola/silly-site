interface ClientInfoRequest {
    userAgent: string;
    language: string;
    platform: string;
    timezone: string;
}

interface LogCreateRequest {
    clientInfo: ClientInfoRequest;
    message: string;
    logType: string;
}

export async function sendLog(message: string, logType: string) {
    const logRequest: LogCreateRequest = {
        clientInfo: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        },
        message,
        logType,
    };

    const token = localStorage.getItem("token");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/logs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(logRequest),
    });

    if (!response.ok) {
        throw new Error(`Failed to send log: ${response.statusText}`);
    }
}