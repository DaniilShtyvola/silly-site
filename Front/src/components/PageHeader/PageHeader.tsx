import { FC, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./PageHeader.css";

import { Navbar, Nav } from "react-bootstrap";

import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import {
    faCat,
    faScrewdriverWrench,
    faCode,
    faTurnUp,
    faLocationDot,
    faRightToBracket
} from "@fortawesome/free-solid-svg-icons";

import RandomText from "../RandomText/RandomText";
import EaseOutWrapper from "../EaseOutWrapper/EaseOutWrapper";

interface CustomNavLinkProps {
    icon?: FontAwesomeIconProps['icon'];
    text: string;
    tooltip: string;
    link: string;
    onHover: (text: string, link: string) => void;
}

const CustomNavLink: React.FC<CustomNavLinkProps> = ({ icon, text, tooltip, link, onHover }) => {
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
                {icon && <FontAwesomeIcon icon={icon} />} {text}
            </Nav.Link>
        </Nav>
    );
};

interface PageHeaderProps { }

const PageHeader: FC<PageHeaderProps> = () => {
    const location = useLocation();

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    const [hoverState, setHoverState] = useState<{ text: string; link: string }>({
        text: 'Hover over a link to get more info...',
        link: ''
    });
    const [hoverTimer, setHoverTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    const handleHover = (text: string, link: string) => {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
        }

        const timer = setTimeout(() => {
            if (text !== '') {
                setHoverState({ text, link });
            } else {
                setHoverState({ text: 'Hover over a link to get more info...', link: '' });
            }
        }, 200);

        setHoverTimer(timer);
    };

    useEffect(() => {
        const processLogin = async (token: string) => {
            try {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));

                const userNameFromToken = tokenPayload.userName;
                if (userNameFromToken) {
                    setUsername(userNameFromToken);
                }

                const userIsAdmin = tokenPayload.isAdmin;
                if (userIsAdmin) {
                    setIsAdmin(userIsAdmin);
                }
            } catch (err) {
                console.error("Failed to parse token", err);
            }

            const storedAvatar = localStorage.getItem("avatar");
            if (storedAvatar) {
                setAvatar(storedAvatar);
                setIsAuthenticated(true);
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/get-avatar`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        token: token
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch avatar");
                }

                const data = await response.json();

                if (data.avatarBase64) {
                    localStorage.setItem("avatar", data.avatarBase64);
                    setAvatar(data.avatarBase64);
                }

                setIsAuthenticated(true);
            } catch (error) {
                console.error("Something happened while trying to fetch an avatar. :(", error);
            }
        };

        const token = localStorage.getItem("token");

        if (token) {
            processLogin(token);
        } else {
            const handleLoggedIn = async () => {
                const newToken = localStorage.getItem("token");
                if (newToken) {
                    await processLogin(newToken);
                }
            };

            window.addEventListener("loggedIn", handleLoggedIn);

            return () => {
                window.removeEventListener("loggedIn", handleLoggedIn);
            };
        }
    }, []);

    useEffect(() => {
        return () => {
            if (hoverTimer) {
                clearTimeout(hoverTimer);
            }
        };
    }, [hoverTimer]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, [location]);

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
                    <CustomNavLink link={"/cats"} icon={faCat} text={"Cats"} tooltip={"Meet the silliest cats in the world!"} onHover={handleHover} />
                    <CustomNavLink link={"/creator"} icon={faCode} text={"Catfather"} tooltip={"Find out who made that mess."} onHover={handleHover} />
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
                            <CustomNavLink link={"/profile"} text={username} tooltip={"Your profile needs more SSStylish."} onHover={handleHover} />
                            <div
                                style={{
                                    position: "relative",
                                    display: "flex",
                                    marginLeft: "6px"
                                }}
                            >
                                <Link to="/profile">
                                    <img
                                        src={`data:image/jpeg;base64,${avatar}`}
                                        alt="avatar"
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: "50%",
                                            position: "absolute",
                                            left: "-18px",
                                            top: "-9px",
                                            border: "rgb(43, 48, 52) solid 1px",
                                            cursor: "pointer"
                                        }}
                                        onMouseEnter={() => handleHover("Your profile needs more SSStyle!", "/profile")}
                                        onMouseLeave={() => handleHover('', '')}
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
                fontSize: "85%",
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
                            fontSize: "75%"
                        }}
                    />
                </EaseOutWrapper>
            </div>
        </>
    );
};

export default PageHeader;
