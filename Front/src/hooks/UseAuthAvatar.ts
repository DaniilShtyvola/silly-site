import { useEffect, useState, useCallback } from "react";

import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { AvatarIcons } from "../utils/AvatarIcons";

interface AvatarData {
    icon: IconDefinition;
    color: string;
}

const useAuthAvatar = () => {
    const [avatar, setAvatar] = useState<AvatarData | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const processLogin = useCallback(async (token: string) => {
        try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));

            if (tokenPayload.userName) setUsername(tokenPayload.userName);
            if (tokenPayload.isAdmin !== undefined) setIsAdmin(tokenPayload.isAdmin);
        } catch (err) {
            console.error("Failed to parse token", err);
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/me/avatar`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    token: token,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch avatar");

            const data: { avatarIcon: string; avatarColor: string } = await response.json();

            const iconKey = data.avatarIcon?.toLowerCase() || "user";
            const icon = AvatarIcons[iconKey] || AvatarIcons["user"];

            setAvatar({ icon, color: data.avatarColor });
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Something happened while trying to fetch an avatar.", error);
            setIsAuthenticated(false);
            setAvatar(null);
            setUsername(null);
            setIsAdmin(null);
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

    return { avatar, username, isAdmin, isAuthenticated };
};

export default useAuthAvatar;
