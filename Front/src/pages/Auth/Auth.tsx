import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { Form, Button, ProgressBar } from "react-bootstrap";

import axios from "axios";
import zxcvbn from "zxcvbn";

import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFaceSadTear,
    faFaceLaugh,
    faDice,
    faArrowsLeftRightToLine,
    faArrowsLeftRight
} from "@fortawesome/free-solid-svg-icons";

import RandomText from "../../components/RandomText/RandomText";

import { sendLog } from "../../utils/SendLog";
import ToastMessage from "../../components/ToastMessage/ToastMessage";

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
                    marginTop: "2px",
                    backgroundColor: "rgb(33, 37, 41)",
                }}
                variant="custom"
            >
                <div
                    className="progress-bar"
                    style={{
                        width: `${progressPercent}%`,
                        backgroundColor: getColor(),
                    }}
                />
            </ProgressBar>
            <p style={{
                color: "rgb(137, 143, 150)",
                fontSize: "0.7rem",
                textAlign: "right",
                position: "relative",
                top: "-3px",
                marginRight: "4px",
                whiteSpace: "nowrap"
            }}>
                <RandomText text={getLabel()} speed={15} />
            </p>
        </div>
    );
};

const Auth: React.FC = () => {
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");

    const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/profile");
        }
    }, [navigate]);

    const [message, setMessage] = useState<{
        text: string;
        variant: string;
        icon: IconDefinition;
    } | null>(null);

    const isLoginRef = useRef(isLogin);
    useEffect(() => {
        isLoginRef.current = isLogin;
    }, [isLogin]);

    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLogin) {
            const trimmedUsername = username.trim();
            const trimmedPassword = password.trim();

            if (trimmedUsername.length < 6) {
                setMessage({
                    text: "Username must be at least 6 characters long.",
                    variant: "danger",
                    icon: faArrowsLeftRight,
                });
                return;
            }

            if (trimmedUsername.length > 25) {
                setMessage({
                    text: "Username cannot be longer than 25 characters.",
                    variant: "danger",
                    icon: faArrowsLeftRightToLine,
                });
                return;
            }

            if (username !== trimmedUsername) {
                setMessage({
                    text: "Username cannot start or end with spaces.",
                    variant: "danger",
                    icon: faFaceSadTear,
                });
                return;
            }

            if (username.includes(" ")) {
                setMessage({
                    text: "Username cannot contain spaces.",
                    variant: "danger",
                    icon: faFaceSadTear,
                });
                return;
            }

            if (trimmedPassword.length < 5) {
                setMessage({
                    text: "Password must be at least 5 characters long.",
                    variant: "danger",
                    icon: faArrowsLeftRight,
                });
                return;
            }

            if (trimmedPassword.length > 30) {
                setMessage({
                    text: "Password cannot be longer than 30 characters.",
                    variant: "danger",
                    icon: faArrowsLeftRightToLine,
                });
                return;
            }

            if (password !== trimmedPassword) {
                setMessage({
                    text: "Password cannot start or end with spaces.",
                    variant: "danger",
                    icon: faFaceSadTear,
                });
                return;
            }
        }

        try {
            const payload = {
                userName: username,
                password: password,
            };

            if (isLogin) {
                const response = await axios.post(`${API_URL}/auth/login`, payload);
                const data = response.data;

                localStorage.setItem("token", data.token);

                setMessage({
                    text: "Login successful!",
                    variant: "success",
                    icon: faFaceLaugh,
                });

                window.dispatchEvent(new Event("loggedIn"));

                navigate("/profile");

                sendLog("The user has logged in.", "info");
            } else {
                await axios.post(`${API_URL}/auth/register`, payload);

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
        <div>
            <Form onSubmit={handleSubmit} style={{ width: "300px" }}>
                <Form.Group>
                    <Form.Control
                        name="username"
                        placeholder='Username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete={isLogin ? "username" : "new-username"}
                    />
                </Form.Group>
                <Form.Group >
                    <Form.Control
                        name="password"
                        type='text'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isGeneratingPassword}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        style={{ marginTop: "8px" }}
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
                                name="confirm-password"
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
                            fontSize: "0.7rem",
                            position: "relative",
                            whiteSpace: "nowrap",
                            marginTop: "4px"
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

                <div style={{
                    marginTop: "14px"
                }}>
                    <ToastMessage
                        message={message}
                        onClose={() => setMessage(null)}
                    />
                </div>

                <p
                    style={{
                        color: "grey",
                        textAlign: "center",
                        marginTop: "1rem",
                        fontSize: "0.8rem"
                    }}
                >
                    {isLogin ? "No account? Rip and... " : (
                        <>
                            The only thing they fear...<br /> is you
                        </>
                    )}
                    <span
                        style={{
                            color: "rgb(25, 135, 84)",
                            cursor: "pointer",
                            fontSize: "1rem"
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
        </div>
    );
};

export default Auth;
