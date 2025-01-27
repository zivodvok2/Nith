import { useState } from 'react';
import useAuth from '../contexts/AuthContext';
import useWebSocket from './useWebSocket';

const useCopyStart = () => {
    const { sendMessage } = useWebSocket();
    const { isAuthorized, isConnected } = useAuth();
    const [processingTrader, setProcessingTrader] = useState(null);

    const startCopyTrading = (trader, maxTradeStake, minTradeStake, onSuccess, onError) => {
        if (!isConnected || !isAuthorized) {
            onError('Connection not ready. Please try again.');
            return;
        }

        if (typeof maxTradeStake !== 'number' || typeof minTradeStake !== 'number') {
            onError('Invalid trade stake values. Please provide valid numbers.');
            return;
        }

        if (minTradeStake < 0 || maxTradeStake < 0) {
            onError('Trade stake values must be positive numbers.');
            return;
        }

        if (minTradeStake > maxTradeStake) {
            onError('Minimum trade stake cannot be greater than maximum trade stake.');
            return;
        }

        setProcessingTrader(trader);
        sendMessage(
            {
                copy_start: trader.token,
                max_trade_stake: maxTradeStake,
                min_trade_stake: minTradeStake,
            },
            response => {
                if (response.error) {
                    onError(response.error.message || 'Error starting copy trade');
                } else {
                    onSuccess(trader);
                }
                setProcessingTrader(null);
            }
        );
    };

    return {
        startCopyTrading,
        processingTrader,
    };
};

export default useCopyStart;
