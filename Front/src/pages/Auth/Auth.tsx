import React, { useState, useEffect } from "react";

import { Form, Button, Alert, ProgressBar } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFaceSadTear,
    faFaceLaugh,
    faKey
} from "@fortawesome/free-solid-svg-icons";

import zxcvbn from "zxcvbn";

import PageWrapper from "../../components/PageWrapper/PageWrapper";

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
    const testResult = zxcvbn(password);
    const baseScore = testResult.score;
    const hasSpecialChars = /[^a-zA-Z0-9]/.test(password);
    const lengthBonus = password.length >= 12 ? 1 : 0;
    const specialBonus = password.length >= 6 && hasSpecialChars ? 1 : 0;

    const extendedScore = Math.min(baseScore + lengthBonus + specialBonus, 6);

    const getColor = () => {
        switch (extendedScore) {
            case 0: return "#7F9399";
            case 1: return "#90ADF7";
            case 2: return "#90ADF7";
            case 3: return "#0473DC";
            case 4: return "#FEEB74";
            case 5: return "#eebe2f";
            case 6: return "#E1A202";
            default: return "transparent";
        }
    };

    const getLabel = () => {
        switch (extendedScore) {
            case 0: return "Dismal";
            case 1: return "Crazy";
            case 2: return "Badass";
            case 3: return "Apocalyptic!";
            case 4: return "Savage!";
            case 5: return "Sick Skills!!";
            case 6: return "Smokin' Sexy Style!!";
            default: return "";
        }
    };

    const progressPercent = (extendedScore / 6) * 100;

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                marginTop: "8px"
            }}
        >
            <ProgressBar
                now={progressPercent}
                style={{
                    height: "4px",
                    flex: 1,
                    borderRadius: "4px",
                    backgroundColor: "rgb(33, 37, 41)",
                }}
                variant="custom"
            >
                <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                        width: `${progressPercent}%`,
                        backgroundColor: getColor(),
                    }}
                />
            </ProgressBar>
            <p style={{
                color: "rgb(137, 143, 150)",
                fontSize: "70%",
                textAlign: "right",
                position: "relative",
                top: "-3px",
                marginRight: "4px",
                whiteSpace: "nowrap"
            }}>
                {getLabel()}
            </p>
        </div>
    );
};


const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");

    const [message, setMessage] = useState<{
        text: string;
        variant: string;
        icon?: any;
    } | null>(null);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isLogin) {
                setMessage({
                    text: "Login successful!",
                    variant: "success",
                    icon: faFaceLaugh,
                });
                window.dispatchEvent(new Event("loggedIn"));
            } else {
                setMessage({
                    text: "Successfully registered! Please confirm your email.",
                    variant: "success",
                    icon: faFaceLaugh,
                });
                setIsLogin(true);
            }

            setPassword("");
            setConfirmPassword("");
            setUsername("");
        } catch (error: any) {
            console.error(error);
            let errorText = isLogin ? "Login failed." : "Registration failed.";

            if (
                isLogin &&
                error.response?.status === 403 &&
                typeof error.response.data.detail === "string"
            ) {
                errorText = error.response.data.detail;
            }

            setMessage({
                text: errorText,
                variant: "danger",
                icon: faFaceSadTear,
            });
        }
    };

    useEffect(() => {
        if (message) {
            const fadeOutTimer = setTimeout(() => setIsFadingOut(true), 3000);
            const removeMessageTimer = setTimeout(() => {
                setMessage(null);
                setIsFadingOut(false);
            }, 4000);
            return () => {
                clearTimeout(fadeOutTimer);
                clearTimeout(removeMessageTimer);
            };
        }
    }, [message]);

    const generateStrongPassword = (): string => {
        const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*";

        const getRandom = (set: string) =>
            set.charAt(Math.floor(Math.random() * set.length));

        const passwordChars: string[] = [];

        while (passwordChars.length < 16) {
            passwordChars.push(getRandom(letters));
            if (passwordChars.length < 16) passwordChars.push(getRandom(numbers));
            if (passwordChars.length < 16) passwordChars.push(getRandom(symbols));
        }

        for (let i = passwordChars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
        }

        return passwordChars.join('');
    };

    return (
        <PageWrapper>
            <Form onSubmit={handleSubmit} style={{ width: "300px" }}>
                <Form.Group className='mb-3'>
                    <Form.Control
                        placeholder='Username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group style={{ marginBottom: "4px" }}>
                    <Form.Control
                        type='text'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {!isLogin && <PasswordStrengthMeter password={password} />}
                </Form.Group>

                {!isLogin && (
                    <>
                        <Form.Group
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                color: "rgb(137, 143, 150)"
                            }}
                        >
                            <Form.Control
                                type='password'
                                placeholder='Confirm password'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            or
                            <Button
                                variant="dark"
                                type="button"
                                onClick={() => {
                                    const generated = generateStrongPassword();
                                    setPassword(generated);
                                    setConfirmPassword(generated);
                                }}
                            >
                                <FontAwesomeIcon icon={faKey} />
                            </Button>
                        </Form.Group>
                        <p style={{
                            color: "rgb(100, 105, 111)",
                            fontSize: "70%",
                            position: "relative",
                            top: "-3px",
                            whiteSpace: "nowrap",
                            margin: "8px 0 2px 0"
                        }}>
                            No loot worth stealing here anyway...
                        </p>
                    </>
                )}

                <Button className='w-100' variant='dark' type='submit'>
                    {isLogin ? "Log in" : "Register"}
                </Button>

                {message && (
                    <Alert
                        style={{
                            opacity: isFadingOut ? 0 : 1,
                            maxHeight: isFadingOut ? 0 : "100px",
                            padding: isFadingOut ? "0" : "8px",
                            marginTop: isFadingOut ? "0" : "16px",
                            marginBottom: 0,
                            overflow: "hidden",
                            textAlign: "center",
                            transition: "opacity 1s, max-height 1s ease, padding 1s ease, margin 1.5s ease",
                            backgroundColor: message.variant === "success" ? "rgb(40, 167, 69)" : "rgb(220, 53, 69)",
                            color: "white",
                            border: "1px solid rgb(33, 37, 41)",
                        }}
                    >
                        {message.icon && <FontAwesomeIcon icon={message.icon} style={{ marginRight: 6 }} />}
                        {message.text}
                    </Alert>
                )}

                <p style={{ color: "grey", textAlign: "center", marginTop: "12px", fontSize: "90%" }}>
                    {isLogin ? "No account? Rip and... " : (
                        <>
                            The only thing they fear...<br /> is you
                        </>
                    )}
                    <span
                        style={{
                            color: "rgb(25, 135, 84)",
                            cursor: "pointer",
                            fontSize: "110%"
                        }}
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setPassword("");
                            setConfirmPassword("");
                            setUsername("");
                            setMessage(null);
                        }}
                    >
                        {isLogin ? "register." : " logging in."}
                    </span>
                </p>
            </Form>
        </PageWrapper>
    );
};

export default Auth;
