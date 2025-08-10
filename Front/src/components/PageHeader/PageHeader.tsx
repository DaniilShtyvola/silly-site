import { FC, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import "./PageHeader.css";

import { Navbar, Nav } from "react-bootstrap";

import axios from "axios";

import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import {
    faNewspaper,
    faScrewdriverWrench,
    faCode,
    faTurnUp,
    faLocationDot,
    faRightToBracket
} from "@fortawesome/free-solid-svg-icons";

import RandomText from "../RandomText/RandomText";
import EaseOutWrapper from "../EaseOutWrapper/EaseOutWrapper";
import GradientAvatar from "../GradientAvatar/GradientAvatar";
import GradientUsername from "../GradientUsername/GradientUsername";

import useAuthAvatar from '../../hooks/UseAuth';

import { UserStyle, UserStyleDto } from "../../models/UserStyle";

import { parseStyle } from "../../utils/ParseStyle";
import { AvatarIcons } from "../../utils/AvatarIcons";

interface CustomNavLinkProps {
    icon?: FontAwesomeIconProps['icon'];
    text: React.ReactNode;
    tooltip: string;
    link: string;
    onHover: (text: string, link: string) => void;
    gradientColors?: [string, string];
}

const CustomNavLink: React.FC<CustomNavLinkProps> = ({
    icon,
    text,
    tooltip,
    link,
    onHover
}) => {
    const location = useLocation();

    return (
        <Nav>
            <Nav.Link
                as={Link}
                to={link}
                className={`custom-nav-link ${location.pathname === link ? 'selected' : ''}`}
                style={{
                    padding: "0px 22px"
                }}
                onMouseEnter={() => onHover(tooltip, link)}
                onMouseLeave={() => onHover('', '')}
            >
                {icon && <FontAwesomeIcon icon={icon} />}{" "}
                {text}
            </Nav.Link>
        </Nav>
    );
};

interface PageHeaderProps { }

const PageHeader: FC<PageHeaderProps> = () => {
    const location = useLocation();

    const { isAuthenticated, username, isAdmin } = useAuthAvatar();

    const [hoverState, setHoverState] = useState<{ text: string; link: string }>({
        text: "Hover over a link to get more info...",
        link: "",
    });
    const [hoverTimer, setHoverTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    const [style, setStyle] = useState<UserStyle>({
        avatarColors: ["#898F96", "#898F96"],
        userNameColors: ["#898F96", "#898F96"],
        avatarDirection: "to right",
        avatarIcon: AvatarIcons["user"],
    });

    const handleHover = (text: string, link: string) => {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
        }

        const timer = setTimeout(() => {
            if (text !== "") {
                setHoverState({ text, link });
            } else {
                setHoverState({ text: "Hover over a link to get more info...", link: "" });
            }
        }, 200);

        setHoverTimer(timer);
    };

    useEffect(() => {
        return () => {
            if (hoverTimer) {
                clearTimeout(hoverTimer);
            }
        };
    }, [hoverTimer]);

    useEffect(() => {
        const savedStyle = localStorage.getItem("userStyle");
        if (savedStyle) {
            try {
                const parsed = JSON.parse(savedStyle) as UserStyle;
                setStyle(parsed);
            } catch {
                console.warn("Failed to parse saved style from localStorage");
            }
        }
    }, []);

    useEffect(() => {
        const handleLoggedIn = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await axios.get<UserStyleDto>(`${import.meta.env.VITE_API_URL}/me/style`, {
                    headers: { token },
                });

                const parsed = parseStyle(response.data);
                setStyle(parsed);

                localStorage.setItem("userStyle", JSON.stringify(parsed));
            } catch (error) {
                console.error("Failed to fetch user style on loggedIn event:", error);
            }
        };

        window.addEventListener("loggedIn", handleLoggedIn);

        return () => {
            window.removeEventListener("loggedIn", handleLoggedIn);
        };
    }, []);

    return (
        <>
            <Navbar
                style={{
                    width: "100%",
                    borderBottom: "rgb(43, 48, 52) solid 1px",
                    color: "white"
                }}
            >
                <Nav
                    className="me-auto"
                    style={{
                        display: "flex",
                        flexDirection: "row"
                    }}
                >
                    <CustomNavLink link={"/news"} icon={faNewspaper} text={"News"} tooltip={"Boy, this is so educational!"} onHover={handleHover} />
                    <CustomNavLink link={"/creator"} icon={faCode} text={"Creator"} tooltip={"Find out who made that mess."} onHover={handleHover} />
                    {isAdmin && (
                        <CustomNavLink link={"/admin"} icon={faScrewdriverWrench} text={"Admin"} tooltip={"Manage and oversee everything here."} onHover={handleHover} />
                    )}
                </Nav>

                <Nav
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center"
                    }}
                >
                    {isAuthenticated && username ? (
                        <div style={{
                            display: "flex"
                        }}
                        >
                            <CustomNavLink
                                link={"/profile"}
                                text={<GradientUsername text={username} colors={style.userNameColors} />}
                                tooltip={"Your profile needs more SSStyle."}
                                onHover={handleHover}
                            />
                            <div
                                style={{
                                    position: "relative",
                                    display: "flex",
                                    marginLeft: "6px"
                                }}
                            >
                                <Link
                                    to="/profile"
                                    style={{
                                        position: "absolute",
                                        left: "-18px",
                                        top: "-6px"
                                    }}
                                    onMouseEnter={() => handleHover("Your profile needs more SSStyle.", "/profile")}
                                    onMouseLeave={() => handleHover('', '')}
                                >
                                    <GradientAvatar
                                        icon={style.avatarIcon}
                                        colors={style.avatarColors}
                                        direction={style.avatarDirection}
                                        size={40}
                                    />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <CustomNavLink link={"/login"} icon={faRightToBracket} text={"Login"} tooltip={"Pull the trigger and log in."} onHover={handleHover} />
                    )}
                </Nav>
            </Navbar>
            <div style={{
                width: "100%",
                fontSize: "0.8rem",
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <p style={{
                    color: hoverState.text === "Hover over a link to get more info..." ? "rgb(100, 105, 111)" : "rgb(137, 143, 150)",
                    transition: "color 0.5s ease"
                }}>
                    <RandomText text={hoverState.text} speed={10} />
                </p>
                <EaseOutWrapper
                    show={hoverState.link != ''}
                    duration={400}
                    style={{
                        display: "flex",
                        color: "rgb(100, 105, 111)"
                    }}
                >
                    <p
                        style={{
                            transition: "color 0.5s ease",
                            textAlign: "end"
                        }}
                    >
                        <RandomText text={hoverState.link} speed={30} />
                    </p>
                    <FontAwesomeIcon
                        icon={location.pathname === hoverState.link ? faLocationDot : faTurnUp}
                        style={{
                            marginLeft: "4px",
                            position: "relative",
                            top: location.pathname === hoverState.link ? "4px" : "2.5px",
                            fontSize: "0.6rem"
                        }}
                    />
                </EaseOutWrapper>
            </div>
        </>
    );
};

export default PageHeader;
