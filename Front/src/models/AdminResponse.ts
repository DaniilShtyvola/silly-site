export type LogInfo = {
    id: string;
    message: string;
    logType: string;
    createdAt: string;
};

export type SessionInfo = {
    id: string;
    userAgent: string;
    language: string;
    platform: string;
    timezone: string;
    ipAddress: string;
    firstSeen: string;
    lastSeen: string;
    logCount: number;
    userId?: string | null;
    logs: LogInfo[];
};

export type SessionsResponse = {
    sessions: SessionInfo[];
    totalSessions: number;
};
