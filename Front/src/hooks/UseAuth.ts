import { useEffect, useState, useCallback } from "react";

const useAuth = () => {
    const [username, setUsername] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const processLogin = useCallback(async (token: string) => {
        try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));

            if (tokenPayload.userName) setUsername(tokenPayload.userName);
            if (tokenPayload.isAdmin !== undefined) {
                setIsAdmin(tokenPayload.isAdmin === 'true');
            } else {
                setIsAdmin(false);
            }
            setIsAuthenticated(true);
        } catch (err) {
            console.error("Failed to parse token", err);
            setUsername(null);
            setIsAdmin(null);
            setIsAuthenticated(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            processLogin(token);
        }

        const handleLoggedIn = async () => {
            const newToken = localStorage.getItem("token");
            if (newToken) await processLogin(newToken);
        };

        const handleLoggedOut = () => {
            setUsername(null);
            setIsAdmin(null);
            setIsAuthenticated(false);
        };

        window.addEventListener("loggedIn", handleLoggedIn);
        window.addEventListener("loggedOut", handleLoggedOut);

        return () => {
            window.removeEventListener("loggedIn", handleLoggedIn);
            window.removeEventListener("loggedOut", handleLoggedOut);
        };
    }, [processLogin]);

    return { username, isAdmin, isAuthenticated };
};

export default useAuth;
