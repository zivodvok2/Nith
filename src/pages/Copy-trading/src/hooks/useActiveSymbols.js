import { useEffect,useState } from 'react';
import useWebSocket from './useWebSocket';

const useActiveSymbols = () => {
    const { sendMessage, isConnected } = useWebSocket();
    const [symbols, setSymbols] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSymbols = () => {
            if (!isConnected) return;

            setIsLoading(true);
            setError(null);

            try {
                sendMessage(
                    {
                        active_symbols: 'brief',
                        product_type: 'basic',
                    },
                    response => {
                        if (response.error) {
                            setError(response.error.message);
                        } else {
                            setSymbols(response.active_symbols || []);
                        }
                        setIsLoading(false);
                    }
                );
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchSymbols();
    }, [isConnected, sendMessage]);

    return {
        symbols,
        isLoading,
        error,
    };
};

export default useActiveSymbols;
