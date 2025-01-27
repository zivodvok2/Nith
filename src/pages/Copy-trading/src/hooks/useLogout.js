import { useCallback } from 'react';
import useAuth from './useAuth';
import useWebSocket from './useWebSocket';

const useLogout = () => {
    const { sendMessage } = useWebSocket();
    const { isAuthorized, clearAccounts } = useAuth();

    const logout = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!isAuthorized) {
                resolve({ logout: 1 }); // Already logged out
                return;
            }

            try {
                sendMessage({ logout: 1 }, response => {
                    if (response.error) {
                        reject(new Error(response.error.message));
                    } else {
                        clearAccounts(); // Clear stored accounts on successful logout
                        resolve(response);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }, [isAuthorized, sendMessage, clearAccounts]);

    return { logout };
};

export default useLogout;
