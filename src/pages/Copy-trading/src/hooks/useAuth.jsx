import { createContext, useCallback, useContext,useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useWebSocket from './useWebSocket';

const AuthContext = createContext(null);

// Singleton state
let isAuthorizedGlobal = false;
let authErrorGlobal = null;

export const useAuthState = () => {
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [otherAccounts, setOtherAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isConnected, sendMessage, close } = useWebSocket();

    // Load accounts from localStorage when hook is initialized
    useEffect(() => {
        try {
            console.log('Loading accounts from localStorage');
            const storedDefault = localStorage.getItem('deriv_default_account');
            const storedOthers = localStorage.getItem('deriv_other_accounts');

            if (storedDefault) {
                console.log('Found stored default account:', JSON.parse(storedDefault));
                setDefaultAccount(JSON.parse(storedDefault));
            }
            if (storedOthers) {
                setOtherAccounts(JSON.parse(storedOthers));
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Authorize effect - handles both initial auth and account switching
    useEffect(() => {
        if (isConnected && defaultAccount?.token) {
            console.log('Sending authorize request for account switch/initial auth');
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
    }, [isConnected, defaultAccount, sendMessage, close]);

    const updateAccounts = useCallback((newDefaultAccount, newOtherAccounts) => {
        console.log('Updating accounts:', { newDefaultAccount, newOtherAccounts });
        // Update state
        setDefaultAccount(newDefaultAccount);
        setOtherAccounts(newOtherAccounts);
        setIsLoading(false);

        // Update localStorage
        localStorage.setItem('deriv_default_account', JSON.stringify(newDefaultAccount));
        localStorage.setItem('deriv_other_accounts', JSON.stringify(newOtherAccounts));
    }, []);

    const clearAccounts = useCallback(() => {
        console.log('Clearing accounts');
        setDefaultAccount(null);
        setOtherAccounts([]);
        localStorage.removeItem('deriv_default_account');
        localStorage.removeItem('deriv_other_accounts');
    }, []);

    const authorize = useCallback(
        async token => {
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
        },
        [isConnected, sendMessage, clearAccounts, close]
    );

    return {
        defaultAccount,
        otherAccounts,
        isLoading,
        isAuthorized: isAuthorizedGlobal,
        authError: authErrorGlobal,
        isConnected,
        updateAccounts,
        clearAccounts,
        authorize,
    };
};

export const AuthProvider = ({ children }) => {
    const auth = useAuthState();
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
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
