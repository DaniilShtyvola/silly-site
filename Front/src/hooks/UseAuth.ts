import { useEffect, useState, useCallback } from "react";

const useAuth = () => {
    const [username, setUsername] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const processLogin = useCallback(async (token: string) => {
        try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));

            if (tokenPayload.userName) setUsername(tokenPayload.userName);
            if (tokenPayload.isAdmin !== undefined) setIsAdmin(tokenPayload.isAdmin);
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

        window.addEventListener("loggedIn", handleLoggedIn);
        return () => {
            window.removeEventListener("loggedIn", handleLoggedIn);
        };
    }, [processLogin]);

    return { username, isAdmin, isAuthenticated };
};

export default useAuth;
