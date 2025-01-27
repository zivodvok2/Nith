import { useCallback,useEffect, useState } from 'react';
import useAuth from '../contexts/AuthContext';
import useWebSocket from './useWebSocket';

const useCopyTradersList = () => {
    const { sendMessage, lastMessage } = useWebSocket();
    const { isAuthorized, isConnected } = useAuth();
    const [traders, setTraders] = useState([]);
    const [copiers, setCopiers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchList = useCallback(() => {
        if (!isConnected || !isAuthorized) return;

        sendMessage(
            {
                copytrading_list: 1,
                // Optional parameters can be added here:
                // sort_fields: ["performance", "monthly_profitable_trades"],
                // sort_order: ["DESC", "DESC"]
            },
            response => {
                console.log('Copy Trading List Response:', response);

                if (response.error) {
                    setError(response.error.message);
                    setIsLoading(false);
                    return;
                }

                if (response.copytrading_list) {
                    setTraders(response.copytrading_list.traders);
                    setCopiers(response.copytrading_list.copiers);
                    setIsLoading(false);
                    setError(null);
                }
            }
        );
    }, [sendMessage, isConnected, isAuthorized]);

    // Initial fetch when authorized and connected
    useEffect(() => {
        if (isAuthorized && isConnected) {
            fetchList();
        }
    }, [isAuthorized, isConnected, fetchList]);

    // Handle broadcast messages
    useEffect(() => {
        if (!lastMessage) return;

        if (lastMessage.msg_type === 'copytrading_list') {
            if (lastMessage.error) {
                setError(lastMessage.error.message);
                setIsLoading(false);
                return;
            }

            if (lastMessage.copytrading_list) {
                setTraders(lastMessage.copytrading_list.traders);
                setCopiers(lastMessage.copytrading_list.copiers);
                setIsLoading(false);
                setError(null);
            }
        }
    }, [lastMessage]);

    return {
        traders,
        copiers,
        isLoading,
        error,
        refreshList: fetchList,
    };
};

export default useCopyTradersList;
