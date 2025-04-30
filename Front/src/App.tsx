import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Loading from "./components/Loading/Loading";
import PageHeader from "./components/PageHeader/PageHeader";
import Home from "./pages/Home/Home";
import PageWrapper from "./components/PageWrapper/PageWrapper";

function App() {
    const [isLoadingEnded, setLoadingEnded] = useState(false);

    const handleLoadingComplete = () => {
        setTimeout(() => {
            setLoadingEnded(true);
            sessionStorage.setItem("hasVisitedBefore", "true");
        }, 1000);
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
                    <PageHeader />
                    <Routes>
                        <Route path="/" element={<Home />} />
                    </Routes>
                </Router>
            )}
        </PageWrapper>
    );
}

export default App;
