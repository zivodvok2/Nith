import { useEffect,useState } from 'react';
import useAuth from './useAuth';
import useWebSocket from './useWebSocket';

const useBalance = () => {
    const [balances, setBalances] = useState({});
    const { sendMessage, isConnected } = useWebSocket();
    const { isAuthorized, isLoading } = useAuth();

    useEffect(() => {
        // Only subscribe if connected, authorized, and not loading
        if (!isConnected || !isAuthorized || isLoading) return;

        // Subscribe to balance updates
        const subscribeToBalance = () => {
            sendMessage(
                {
                    balance: 1,
                    subscribe: 1,
                    account: 'all',
                },
                response => {
                    if (response.error) {
                        console.error('Balance subscription error:', response.error);
                        return;
                    }

                    if (response.balance) {
                        setBalances(prevBalances => ({
                            ...prevBalances,
                            [response.balance.loginid]: response.balance,
                        }));
                    }
                }
            );
        };

        subscribeToBalance();

        // Cleanup subscription on unmount or when auth state changes
        return () => {
            if (isConnected) {
                sendMessage({
                    balance: 1,
                    subscribe: 0,
                    account: 'all',
                });
            }
        };
    }, [isConnected, isAuthorized, isLoading, sendMessage]);

    return balances;
};

export default useBalance;
