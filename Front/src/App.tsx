import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Loading from "./components/Loading/Loading";
import PageHeader from "./components/PageHeader/PageHeader";
import PageWrapper from "./components/PageWrapper/PageWrapper";
import EaseOutWrapper from "./components/EaseOutWrapper/EaseOutWrapper";

import Board from "./pages/Board/Board";
import Auth from "./pages/Auth/Auth";
import Profile from "./pages/Profile/Profile";

import { sendLog } from "./utils/SendLog";

function App() {
    const [isLoadingEnded, setLoadingEnded] = useState(false);

    const handleLoadingComplete = () => {
        setTimeout(() => {
            setLoadingEnded(true);
            sessionStorage.setItem("hasVisitedBefore", "true");
        }, 600);
    };

    useEffect(() => {
        const isFirstVisit = sessionStorage.getItem("hasVisitedBefore") !== "true";

        if (!isFirstVisit) {
            setLoadingEnded(true);
        } else {
            localStorage.clear();
            sendLog("The user created a new session.", "info");
        }
    }, []);

    return (
        <PageWrapper>
            {!isLoadingEnded ? (
                <Loading onAnimationComplete={handleLoadingComplete} />
            ) : (
                <Router>
                    <EaseOutWrapper
                        show={isLoadingEnded}
                        duration={800}
                        style={{
                            width: "100%"
                        }}
                    >
                        <PageHeader />
                    </EaseOutWrapper>
                    <Routes>
                        <Route path="/" element={<></>} />
                        <Route path="/news" element={<Board />} />
                        <Route path="/login" element={<Auth />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </Router>
            )}
        </PageWrapper>
    );
}

export default App;
