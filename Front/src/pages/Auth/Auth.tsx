import React, { useState, useEffect, useRef } from "react";

import { Form, Button, Alert, ProgressBar } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFaceSadTear,
    faFaceLaugh,
    faDice
} from "@fortawesome/free-solid-svg-icons";

import zxcvbn from "zxcvbn";

import RandomText from "../../components/RandomText/RandomText";
import PageWrapper from "../../components/PageWrapper/PageWrapper";

import { sendLog } from "../../components/SendLog/SendLog";

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
    const testResult = zxcvbn(password);
    const baseScore = testResult.score;
    const hasSpecialChars = /[^a-zA-Z0-9]/.test(password);
    const lengthBonus = password.length >= 16 ? 1 : 0;
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
                <RandomText text={getLabel()} speed={10} />
            </p>
        </div>
    );
};


const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");

    const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

    const [message, setMessage] = useState<{
        text: string;
        variant: string;
        icon?: any;
    } | null>(null);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const isLoginRef = useRef(isLogin);
    useEffect(() => {
        isLoginRef.current = isLogin;
    }, [isLogin]);

    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                userName: username,
                password: password,
            };

            if (isLogin) {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const contentType = response.headers.get("Content-Type");

                    let errorData: any;
                    if (contentType && contentType.includes("application/json")) {
                        errorData = await response.json();
                    } else {
                        errorData = await response.text();
                    }

                    throw { response: { status: response.status, data: errorData } };
                }

                const data = await response.json();
                localStorage.setItem("token", data.token);

                setMessage({
                    text: "Login successful!",
                    variant: "success",
                    icon: faFaceLaugh,
                });

                window.dispatchEvent(new Event("loggedIn"));

                sendLog("The user has logged in.", "info");
            } else {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const contentType = response.headers.get("Content-Type");

                    let errorData: any;
                    if (contentType && contentType.includes("application/json")) {
                        errorData = await response.json();
                    } else {
                        errorData = await response.text();
                    }

                    throw { response: { status: response.status, data: errorData } };
                }

                setMessage({
                    text: "Successfully registered!",
                    variant: "success",
                    icon: faFaceLaugh,
                });

                setIsLogin(true);

                sendLog("The user has registered an account.", "info");
            }

            setPassword("");
            setConfirmPassword("");
            setUsername("");
        } catch (error: any) {
            let errorText = isLogin ? "Login failed." : "Registration failed.";

            const status = error?.response?.status;
            const data = error?.response?.data;

            if (status === 401 || status === 403) {
                if (typeof data === "string") {
                    errorText = data;
                } else if (typeof data?.detail === "string") {
                    errorText = data.detail;
                }
            } else if (status === 400 && !isLogin) {
                if (typeof data === "string") {
                    errorText = data;
                }
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

    const generateStrongPassword = async (
        setPassword: (value: string) => void,
        setConfirmPassword: (value: string) => void,
        getIsLogin: () => boolean
    ) => {
        setIsGeneratingPassword(true);

        const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*";
        const getRandom = (set: string) => set.charAt(Math.floor(Math.random() * set.length));
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        const passwordChars: string[] = [];

        const abortIfLogin = async () => {
            if (getIsLogin()) {
                setPassword("");
                setConfirmPassword("");
                setIsGeneratingPassword(false);
                throw new Error("Aborted due to login state");
            }
        };

        try {
            while (passwordChars.length < 16) {
                await abortIfLogin();
                passwordChars.push(getRandom(letters));
                setPassword(passwordChars.join(''));
                setConfirmPassword(passwordChars.join(''));
                await delay(120);

                if (passwordChars.length < 16) {
                    await abortIfLogin();
                    passwordChars.push(getRandom(numbers));
                    setPassword(passwordChars.join(''));
                    setConfirmPassword(passwordChars.join(''));
                    await delay(120);
                }

                if (passwordChars.length < 16) {
                    await abortIfLogin();
                    passwordChars.push(getRandom(symbols));
                    setPassword(passwordChars.join(''));
                    setConfirmPassword(passwordChars.join(''));
                    await delay(120);
                }
            }

            for (let i = passwordChars.length - 1; i > 0; i--) {
                await abortIfLogin();
                const j = Math.floor(Math.random() * (i + 1));
                [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
                const current = passwordChars.join('');
                setPassword(current);
                setConfirmPassword(current);
                await delay(60);
            }

            await abortIfLogin();
            const finalPassword = passwordChars.join('');
            setPassword(finalPassword);
            setConfirmPassword(finalPassword);
            setIsGeneratingPassword(false);
        } catch {
            // Nothing to see here
        }
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
                <Form.Group >
                    <Form.Control
                        type='text'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isGeneratingPassword}
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
                                color: "rgb(137, 143, 150)",
                                marginTop: "2px"
                            }}
                        >
                            <Form.Control
                                type='password'
                                placeholder='Confirm password'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isGeneratingPassword}
                            />
                            or
                            <Button
                                variant="dark"
                                type="button"
                                onClick={() => {
                                    generateStrongPassword(setPassword, setConfirmPassword, () => isLoginRef.current);
                                }}
                                disabled={isGeneratingPassword}
                            >
                                <FontAwesomeIcon icon={faDice} />
                            </Button>
                        </Form.Group>
                        <p style={{
                            color: "rgb(100, 105, 111)",
                            fontSize: "70%",
                            position: "relative",
                            top: "-3px",
                            whiteSpace: "nowrap",
                            marginTop: "8px"
                        }}>
                            No loot worth stealing here anyway...
                        </p>
                    </>
                )}

                <Button
                    className='w-100'
                    style={{
                        marginTop: "1rem"
                    }}
                    variant='dark'
                    type='submit'
                    disabled={isGeneratingPassword || message?.text != null}
                >
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
                            fontSize: "115%"
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
