import React, { useEffect, useState } from "react";

import axios from "axios";

import GradientAvatar from "../../components/GradientAvatar/GradientAvatar";
import GradientUsername from "../../components/GradientUsername/GradientUsername";

import { UserStyle, UserInfoDto } from "../../models/UserStyle";

import { AvatarIcons } from "../../utils/AvatarIcons";
import { formatTime } from "../../utils/FormatTime";
import { parseStyle } from "../../utils/ParseStyle";

const Profile: React.FC = () => {
    const [info, setInfo] = useState<UserInfoDto | null>(null);

    const [style, setStyle] = useState<UserStyle>({
        avatarColors: ["#898F96", "#898F96"],
        userNameColors: ["#898F96", "#898F96"],
        avatarDirection: "to right",
        avatarIcon: AvatarIcons["user"],
    });

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get<UserInfoDto>(`${API_URL}/me/info`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setInfo(response.data);

                setStyle(parseStyle(response.data.style));
            } catch (error) {
                console.error("Failed to fetch user info:", error);
            }
        };

        fetchInfo();
    }, []);

    return (
        <div>
            {info && (
                <div style={{
                    backgroundColor: "rgb(33, 37, 41)",
                    color: "white",
                    padding: "12px 20px",
                    display: "flex",
                    alignItems: "center"
                }}>
                    <GradientAvatar
                        icon={style.avatarIcon}
                        colors={style.avatarColors}
                        direction={style.avatarDirection}
                        size={40}
                        backgroundColor="rgb(33, 37, 41)"
                    />
                    <div style={{
                        marginLeft: "12px"
                    }}>
                        <div style={{
                            fontSize: "1.1rem",
                            display: "flex",
                            alignItems: "center"
                        }}>
                            <GradientUsername
                                text={info?.userName}
                                colors={style.userNameColors}
                            />
                            <p style={{
                                fontSize: "0.8rem",
                                color: "rgb(137, 143, 150)",
                                marginLeft: "8px"
                            }}>
                                {formatTime(new Date())}
                            </p>
                        </div>
                        <p>Kept you waiting, huh?</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
