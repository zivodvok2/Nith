import React from "react";
import { BrowserRouter as Router, Route,Routes } from "react-router-dom";
import { SnackbarProvider, Spinner,ThemeProvider } from "@deriv-com/quill-ui";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./hooks/useAuth";

type AppProps = {
    isStandalone?: boolean; // Prop to determine if the app is running standalone or as a tab
};

function App({ isStandalone = true }: AppProps) {
    return (
        <ThemeProvider theme="light" persistent>
            <SnackbarProvider>
                <AuthProvider>
                    <AppContent isStandalone={isStandalone} />
                </AuthProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}

type AppContentProps = {
    isStandalone: boolean;
};

function AppContent({ isStandalone }: AppContentProps) {
    const { isConnected } = useAuth();

    if (!isConnected) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <Router>
            <div className="bg-gray-50">
                {/* Conditionally render Header based on isStandalone */}
                {isStandalone && <Header />}
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/*" element={<Login />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
