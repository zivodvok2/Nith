import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useDerivAccounts from '../hooks/useDerivAccounts';
import useWebSocket from '../hooks/useWebSocket';

const AuthContext = createContext(null);

// Singleton state
let isAuthorizedGlobal = false;
let authErrorGlobal = null;

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { defaultAccount, clearAccounts } = useDerivAccounts();
    const { isConnected, sendMessage, close } = useWebSocket();

    // Handle authorization
    useEffect(() => {
        if (isConnected && defaultAccount?.token && !isAuthorizedGlobal) {
            console.log('Sending authorize request');
            setIsLoading(true);
            sendMessage({ authorize: defaultAccount.token }, response => {
                setIsLoading(false);
                if (response.error) {
                    console.error('Authorization failed:', response.error);
                    authErrorGlobal = response.error;
                    isAuthorizedGlobal = false;
                    clearAccounts();
                    close();
                } else {
                    console.log('Authorization successful');
                    authErrorGlobal = null;
                    isAuthorizedGlobal = true;
                }
            });
        }
    }, [isConnected, defaultAccount, sendMessage, clearAccounts, close]);

    // Reset auth state when connection is lost
    useEffect(() => {
        if (!isConnected) {
            isAuthorizedGlobal = false;
        }
    }, [isConnected]);

    const authorize = async token => {
        if (!isConnected) {
            throw new Error('WebSocket not connected');
        }

        return new Promise((resolve, reject) => {
            setIsLoading(true);
            sendMessage({ authorize: token }, response => {
                setIsLoading(false);
                if (response.error) {
                    console.error('Authorization failed:', response.error);
                    authErrorGlobal = response.error;
                    isAuthorizedGlobal = false;
                    clearAccounts();
                    close();
                    reject(response.error);
                } else {
                    console.log('Authorization successful');
                    authErrorGlobal = null;
                    isAuthorizedGlobal = true;
                    resolve(response);
                }
            });
        });
    };

    const value = {
        isAuthorized: isAuthorizedGlobal,
        authError: authErrorGlobal,
        isConnected,
        authorize,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default useAuth;
