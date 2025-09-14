import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Profile.css"

import { Button } from "react-bootstrap";

import { SliderPicker } from "react-color";
import axios from "axios";

import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCaretRight,
    faXmark,
    faSliders,
    faFloppyDisk,
    faRightFromBracket,
    faRotateLeft,
    faFaceLaugh,
    faFaceSadTear,
} from "@fortawesome/free-solid-svg-icons";

import GradientAvatar from "../../components/GradientAvatar/GradientAvatar";
import GradientText from "../../components/GradientText/GradientText";
import ToastMessage from "../../components/ToastMessage/ToastMessage";

import GradientDirectionPicker from "../../components/GradientDirectionPicker/GradientDirectionPicker";
import AvatarIconPicker from "../../components/AvatarIconPicker/AvatarIconPicker";

import { UserStyle, UserInfoDto } from "../../models/UserStyle";

import { AvatarIcons } from "../../utils/Icons";
import { formatTime } from "../../utils/FormatTime";
import {
    parseStyle,
    serializeStyle
} from "../../utils/ParseStyle";

type ColorKey = "avatarColor0" | "avatarColor1" | "userNameColor0" | "userNameColor1";

const Profile: React.FC = () => {
    const navigate = useNavigate();

    const [info, setInfo] = useState<UserInfoDto | null>(null);

    const [style, setStyle] = useState<UserStyle>({
        avatarColors: ["#898F96", "#898F96"],
        userNameColors: ["#898F96", "#898F96"],
        avatarDirection: "to right",
        avatarIcon: AvatarIcons["user"],
    });
    const [oldStyle, setOldStyle] = useState<UserStyle | null>(null);
    const [isStyleChanged, setIsStyleChanged] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    const [message, setMessage] = useState<{
        text: string;
        variant: string;
        icon: IconDefinition;
    } | null>(null);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchInfo = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            setIsLoading(true);

            try {
                const response = await axios.get<UserInfoDto>(
                    `${API_URL}/me/info`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setInfo(response.data);

                const parsed = parseStyle(response.data.style);

                setStyle(parsed);
                setOldStyle(parsed);
            } catch (error) {
                console.error("Failed to fetch user info:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInfo();
    }, []);

    useEffect(() => {
        if (!oldStyle) return;
        setIsStyleChanged(JSON.stringify(style) !== JSON.stringify(oldStyle));
    }, [style]);

    const resetStyle = () => {
        if (oldStyle) {
            setStyle(oldStyle);
        }
    };

    const [editingColorKey, setEditingColorKey] = useState<ColorKey | null>("avatarColor0");
    const [color, setColor] = useState("#ffffff");

    const [userNameSingleColor, setUserNameSingleColor] = useState(false);
    const [avatarSingleColor, setAvatarSingleColor] = useState(false);

    useEffect(() => {
        if (editingColorKey === null) return;

        switch (editingColorKey) {
            case "avatarColor0":
                setColor(style.avatarColors[0]);
                break;
            case "avatarColor1":
                if (avatarSingleColor) {
                    setColor(style.avatarColors[0]);
                } else {
                    setColor(style.avatarColors[1]);
                }
                break;
            case "userNameColor0":
                setColor(style.userNameColors[0]);
                break;
            case "userNameColor1":
                if (userNameSingleColor) {
                    setColor(style.userNameColors[0]);
                } else {
                    setColor(style.userNameColors[1]);
                }
                break;
        }
    }, [editingColorKey, style, avatarSingleColor, userNameSingleColor]);

    const handleColorChange = (newColor: { hex: string }) => {
        setColor(newColor.hex);

        setStyle((prev) => {
            const newStyle = { ...prev };

            switch (editingColorKey) {
                case "avatarColor0":
                    if (avatarSingleColor) {
                        newStyle.avatarColors = [newColor.hex, newColor.hex];
                    } else {
                        newStyle.avatarColors = [newColor.hex, prev.avatarColors[1]];
                    }
                    break;
                case "avatarColor1":
                    if (!avatarSingleColor) {
                        newStyle.avatarColors = [prev.avatarColors[0], newColor.hex];
                    }
                    break;
                case "userNameColor0":
                    if (userNameSingleColor) {
                        newStyle.userNameColors = [newColor.hex, newColor.hex];
                    } else {
                        newStyle.userNameColors = [newColor.hex, prev.userNameColors[1]];
                    }
                    break;
                case "userNameColor1":
                    if (!userNameSingleColor) {
                        newStyle.userNameColors = [prev.userNameColors[0], newColor.hex];
                    }
                    break;
            }

            return newStyle;
        });
    };

    useEffect(() => {
        if (!editingColorKey) return;

        if (editingColorKey === "avatarColor1" && avatarSingleColor) {
            setEditingColorKey("avatarColor0");
        }

        if (editingColorKey === "userNameColor1" && userNameSingleColor) {
            setEditingColorKey("userNameColor0");
        }
    }, [avatarSingleColor, userNameSingleColor, editingColorKey]);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userStyle");

        window.dispatchEvent(new Event("loggedOut"));

        navigate("/login");
    };

    const handleSaveStyle = async () => {
        if (!isStyleChanged || isLoading) return;

        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const styleDto = serializeStyle(style);

            const response = await axios.post(
                `${API_URL}/me/style`,
                styleDto,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setOldStyle(style);
            setIsStyleChanged(false);

            localStorage.setItem("userStyle", JSON.stringify(style));

            window.dispatchEvent(new Event("userStyleChanged"));

            setMessage({
                text: response.data?.message,
                variant: "success",
                icon: faFaceLaugh,
            });

        } catch (error) {
            console.error("Failed to save style:", error);

            setMessage({
                text: "Error occured.",
                variant: "danger",
                icon: faFaceSadTear,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {info && (
                <div>
                    <div style={{
                        display: "flex",
                        gap: "1rem"
                    }}>
                        <div>
                            <div style={{
                                backgroundColor: "rgb(33, 37, 41)",
                                padding: "1rem 20px",
                            }}>
                                <p style={{
                                    color: "white",
                                    marginBottom: "1rem",
                                    fontSize: "1.1rem",
                                }}>
                                    Preview
                                </p>

                                <div style={{
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                }}>
                                    <GradientAvatar
                                        icon={style.avatarIcon}
                                        colors={style.avatarColors}
                                        direction={style.avatarDirection}
                                        size={40}
                                        backgroundColor="rgb(33, 37, 41)"
                                    />
                                    <div style={{
                                        marginLeft: "1rem"
                                    }}>
                                        <div style={{
                                            fontSize: "1.1rem",
                                            display: "flex",
                                            alignItems: "center"
                                        }}>
                                            <GradientText
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
                            </div>

                            <div
                                style={{
                                    backgroundColor: "rgb(33, 37, 41)",
                                    padding: "1rem 20px",
                                    position: "relative",
                                    marginTop: "1rem",
                                }}
                            >
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    color: "white",
                                    marginBottom: "1rem",
                                    fontSize: "1.1rem",
                                    alignItems: "center"
                                }}>
                                    <p>Customizer</p>
                                    <FontAwesomeIcon icon={faSliders} />
                                </div>

                                <div style={{
                                    display: "flex",
                                    color: `rgb(100, 105, 111)`,
                                    justifyContent: "space-between",
                                }}>
                                    {/* Avatar */}
                                    <div>
                                        <div style={{
                                            display: "flex",
                                            alignItems: 'center',
                                            justifyContent: "space-between"
                                        }}>
                                            <p style={{
                                                color: 'rgb(137, 143, 150)'
                                            }}>
                                                Avatar
                                            </p>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <input
                                                type="color"
                                                value={style.avatarColors[0]}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setEditingColorKey('avatarColor0');
                                                }}
                                                onChange={(e) => {
                                                    handleColorChange({ hex: e.target.value });
                                                }}
                                                className={`form-control form-control-color ${editingColorKey === 'avatarColor0' ? 'focused-color-input' : ''}`}
                                                style={{
                                                    padding: '4px',
                                                    width: '36px',
                                                    height: '28px',
                                                    borderRadius: "6px"
                                                }}
                                            />

                                            <FontAwesomeIcon
                                                icon={avatarSingleColor ? faXmark : faCaretRight}
                                                style={{
                                                    cursor: 'pointer',
                                                    width: '10px',
                                                    transition: 'color 0.2s ease',
                                                    padding: "6px 8px"
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgb(137, 143, 150)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgb(100, 105, 111)')}
                                                onClick={() => {
                                                    setAvatarSingleColor((prev) => {
                                                        const newVal = !prev;
                                                        if (newVal) {
                                                            setStyle((prevStyle) => ({
                                                                ...prevStyle,
                                                                avatarColors: [prevStyle.avatarColors[0], prevStyle.avatarColors[0]],
                                                            }));
                                                        }
                                                        return newVal;
                                                    });
                                                }}
                                            />

                                            <input
                                                type="color"
                                                value={style.avatarColors[1]}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (avatarSingleColor) return;
                                                    setEditingColorKey('avatarColor1');
                                                }}
                                                onChange={(e) => {
                                                    if (!avatarSingleColor) {
                                                        handleColorChange({ hex: e.target.value });
                                                    }
                                                }}
                                                disabled={avatarSingleColor}
                                                className={`form-control form-control-color ${editingColorKey === 'avatarColor1' ? 'focused-color-input' : ''}`}
                                                style={{
                                                    padding: '4px',
                                                    width: '36px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    opacity: avatarSingleColor ? 0.4 : 1,
                                                    cursor: avatarSingleColor ? 'not-allowed' : 'pointer',
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Nickname */}
                                    <div>
                                        <p style={{
                                            color: 'rgb(137, 143, 150)'
                                        }}>
                                            Nickname
                                        </p>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <input
                                                type="color"
                                                value={style.userNameColors[0]}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setEditingColorKey('userNameColor0');
                                                }}
                                                onChange={(e) => {
                                                    handleColorChange({ hex: e.target.value });
                                                }}
                                                className={`form-control form-control-color ${editingColorKey === 'userNameColor0' ? 'focused-color-input' : ''}`}
                                                style={{
                                                    padding: '4px',
                                                    width: '36px',
                                                    height: '28px',
                                                    borderRadius: "6px"
                                                }}
                                            />

                                            <FontAwesomeIcon
                                                icon={userNameSingleColor ? faXmark : faCaretRight}
                                                style={{
                                                    cursor: 'pointer',
                                                    width: '10px',
                                                    transition: 'color 0.2s ease',
                                                    padding: "6px 8px"
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgb(137, 143, 150)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgb(100, 105, 111)')}
                                                onClick={() => {
                                                    setUserNameSingleColor((prev) => {
                                                        const newVal = !prev;
                                                        if (newVal) {
                                                            setStyle((prevStyle) => ({
                                                                ...prevStyle,
                                                                userNameColors: [prevStyle.userNameColors[0], prevStyle.userNameColors[0]],
                                                            }));
                                                        }
                                                        return newVal;
                                                    });
                                                }}
                                            />

                                            <input
                                                type="color"
                                                value={userNameSingleColor ? style.userNameColors[0] : style.userNameColors[1]}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (userNameSingleColor) return;
                                                    setEditingColorKey('userNameColor1');
                                                }}
                                                onChange={(e) => {
                                                    if (!userNameSingleColor) {
                                                        handleColorChange({ hex: e.target.value });
                                                    }
                                                }}
                                                disabled={userNameSingleColor}
                                                className={`form-control form-control-color ${editingColorKey === 'userNameColor1' ? 'focused-color-input' : ''}`}
                                                style={{
                                                    padding: '4px',
                                                    width: '36px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    opacity: userNameSingleColor ? 0.4 : 1,
                                                    cursor: userNameSingleColor ? 'not-allowed' : 'pointer',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {editingColorKey && (
                                    <div
                                        style={{
                                            marginTop: "26px",
                                            marginBottom: "6px"
                                        }}
                                    >
                                        <SliderPicker
                                            color={color}
                                            onChange={handleColorChange}
                                        />
                                    </div>
                                )}

                                <div style={{
                                    marginTop: "1.1rem"
                                }}>
                                    <p style={{
                                        color: 'rgb(137, 143, 150)'
                                    }}>
                                        Gradient direction
                                    </p>
                                    <GradientDirectionPicker
                                        style={style}
                                        setStyle={setStyle}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: "rgb(33, 37, 41)",
                            padding: "1rem 20px",
                            position: "relative",
                            display: "inline-block"
                        }}>
                            <p style={{
                                color: "white",
                                marginBottom: "1rem",
                                fontSize: "1.1rem",
                            }}>
                                Avatar
                            </p>

                            <AvatarIconPicker
                                selectedIcon={style.avatarIcon}
                                onSelect={(icon) => setStyle(prev => ({ ...prev, avatarIcon: icon }))}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: "flex",
                        justifyContent: 'space-between',
                        marginTop: "1rem",
                        alignItems: "flex-start"
                    }}>
                        <div style={{
                            display: "flex",
                            gap: "1rem",
                            marginRight: "1rem",
                        }}>
                            <Button
                                style={{ paddingInline: "2rem" }}
                                variant='dark'
                                type='submit'
                                disabled={!isStyleChanged || isLoading}
                                onClick={handleSaveStyle}
                            >
                                <FontAwesomeIcon icon={faFloppyDisk} /> Save
                            </Button>
                            <Button
                                variant='dark'
                                type='button'
                                onClick={resetStyle}
                                disabled={!isStyleChanged || isLoading}
                            >
                                <FontAwesomeIcon
                                    icon={faRotateLeft}
                                    style={{
                                        position: "relative",
                                        top: "2px"
                                    }}
                                />
                            </Button>
                        </div>

                        <ToastMessage message={message} onClose={() => setMessage(null)} />

                        <Button
                            style={{
                                paddingInline: "2rem",
                                marginLeft: "1rem"
                            }}
                            variant='dark'
                            type='button'
                            onClick={logout}
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} /> Log out
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
