import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Loading from "./components/Loading/Loading";
import PageHeader from "./components/PageHeader/PageHeader";
import Home from "./pages/Home/Home";
import PageWrapper from "./components/PageWrapper/PageWrapper";
import EaseOutWrapper from "./components/EaseOutWrapper/EaseOutWrapper";

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
                        <Route path="/" element={<Home />} />
                    </Routes>
                </Router>
            )}
        </PageWrapper>
    );
}

export default App;
