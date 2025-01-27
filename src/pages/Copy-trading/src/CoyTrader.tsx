import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { SnackbarProvider, Spinner, ThemeProvider } from "@deriv-com/quill-ui";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./hooks/useAuth";

type ModuleProps = {
    onNavigate?: (route: string) => void; // Optional callback when navigation happens
};

const CopyTrader: React.FC<ModuleProps> = ({ onNavigate }) => {
    return (
        <ThemeProvider theme="light" persistent>
            <SnackbarProvider>
                <AuthProvider>
                    <ModuleContent onNavigate={onNavigate} />
                </AuthProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
};

// Module's internal logic and routing
type ModuleContentProps = {
    onNavigate?: (route: string) => void;
};

const ModuleContent: React.FC<ModuleContentProps> = ({ onNavigate }) => {
    const { isConnected } = useAuth();

    // Handle user navigation (if the parent app wants to know about route changes)
    const handleRouteChange = (route: string) => {
        if (onNavigate) onNavigate(route);
    };

    // Show a loading spinner while waiting for authentication
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
                <Routes>
                    <Route
                        path="/"
                        element={
                            <Login />
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard
                                />
                            </ProtectedRoute>
                        }
                    />
                    {/* Fallback route */}
                    <Route
                        path="/*"
                        element={
                            <Login />
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default CopyTrader;
