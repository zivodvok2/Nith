import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { useOauth2 } from '@/hooks/auth/useOauth2';

import { SnackbarProvider, Spinner, ThemeProvider } from '@deriv-com/quill-ui';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function CopyTrading({ handleTabChange }) {
    return (
        <ThemeProvider theme="light" persistent>
            <SnackbarProvider>
                <AuthProvider> {/* Wrap AuthProvider here */}
                    <AppContent handleTabChange={handleTabChange} />
                </AuthProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}

function AppContent() {
    return (
        <div>
            <Dashboard />
        </div>
    );
}

export default CopyTrading;
