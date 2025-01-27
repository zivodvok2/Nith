import { useCallback, useEffect, useRef,useState } from 'react';
import { getConfig } from '../config';
import useDerivAccounts from './useDerivAccounts';

const config = getConfig();
const WEBSOCKET_URL = `${config.WS_URL}?app_id=${config.APP_ID}`;

console.log('WebSocket Configuration:', {
    ...config,
    FINAL_URL: WEBSOCKET_URL,
});

// Singleton WebSocket instance and state
let globalWs = null;
let responseHandlers = new Set();
let isAuthorizedGlobal = false;

const useDerivWebSocket = () => {
    const [socket, setSocket] = useState(null);
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const { defaultAccount, clearAccounts } = useDerivAccounts();
    const [wsResponse, setWsResponse] = useState(null);
    const handleResponseRef = useRef(null);
    const authRetryCountRef = useRef(0); // Track authorization retry attempts

    // Create the response handler
    useEffect(() => {
        handleResponseRef.current = response => {
            setWsResponse(response);

            if (response.msg_type === 'authorize') {
                if (response.error) {
                    console.error('Authorization failed:', response.error);

                    // If we've already tried to reauthorize once, clear accounts and force relogin
                    if (authRetryCountRef.current >= 1) {
                        console.log('Multiple authorization failures, clearing accounts...');
                        clearAccounts();
                        setIsConnected(false);
                        if (globalWs) {
                            globalWs.close();
                            globalWs = null;
                        }
                        return;
                    }

                    // First retry - attempt to reauthorize with the same connection
                    console.log('Attempting to reauthorize...');
                    authRetryCountRef.current += 1;
                    if (globalWs?.readyState === WebSocket.OPEN) {
                        globalWs.send(
                            JSON.stringify({
                                authorize: defaultAccount.token,
                            })
                        );
                    }
                } else {
                    console.log('Authorization successful');
                    authRetryCountRef.current = 0; // Reset retry counter on success
                    isAuthorizedGlobal = true;
                    setIsConnected(true);
                    globalWs.send(
                        JSON.stringify({
                            get_settings: 1,
                        })
                    );
                }
            } else if (response.msg_type === 'get_settings') {
                setSettings(response.get_settings);
                setIsLoading(false);
            }
        };
    }, [defaultAccount, clearAccounts]);

    // Initialize WebSocket connection
    useEffect(() => {
        if (!defaultAccount?.token || !WEBSOCKET_URL) {
            console.log('Cannot initialize WebSocket:', {
                hasToken: Boolean(defaultAccount?.token),
                hasWsUrl: Boolean(WEBSOCKET_URL),
                wsUrl: WEBSOCKET_URL,
            });
            return;
        }

        console.log('Initializing WebSocket with URL:', WEBSOCKET_URL);
        console.log('Using token:', defaultAccount.token);

        const initializeWebSocket = () => {
            if (!globalWs) {
                console.log('Creating new WebSocket connection');
                globalWs = new WebSocket(WEBSOCKET_URL);

                globalWs.onopen = () => {
                    console.log('WebSocket connected, readyState:', globalWs.readyState);
                    setIsConnected(true);
                    if (!isAuthorizedGlobal) {
                        console.log('Sending authorize request with token:', defaultAccount.token);
                        globalWs.send(
                            JSON.stringify({
                                authorize: defaultAccount.token,
                            })
                        );
                    }
                };

                globalWs.onerror = error => {
                    console.error('WebSocket error:', error);
                };

                globalWs.onclose = () => {
                    console.log('WebSocket connection closed');
                    globalWs = null;
                    isAuthorizedGlobal = false;
                    responseHandlers.forEach(handler => handler({ type: 'connection', status: 'disconnected' }));
                    setIsConnected(false);
                };

                globalWs.onmessage = msg => {
                    const response = JSON.parse(msg.data);
                    console.log('Raw WebSocket message:', response);
                    responseHandlers.forEach(handler => handler(response));
                };
            }

            responseHandlers.add(handleResponseRef.current);
            setSocket(globalWs);

            if (globalWs.readyState === WebSocket.OPEN && !isAuthorizedGlobal) {
                setIsConnected(true);
                console.log('WebSocket already open, sending authorize request');
                globalWs.send(
                    JSON.stringify({
                        authorize: defaultAccount.token,
                    })
                );
            }
        };

        initializeWebSocket();

        return () => {
            if (handleResponseRef.current) {
                responseHandlers.delete(handleResponseRef.current);
                if (responseHandlers.size === 0 && globalWs) {
                    console.log('Cleaning up WebSocket connection');
                    globalWs.close();
                    globalWs = null;
                }
            }
        };
    }, [defaultAccount]);

    const sendRequest = useCallback(request => {
        if (globalWs?.readyState === WebSocket.OPEN) {
            globalWs.send(JSON.stringify(request));
        } else {
            console.error('WebSocket is not connected');
        }
    }, []);

    return {
        socket,
        settings,
        isLoading,
        isConnected,
        sendRequest,
        wsResponse,
    };
};

export default useDerivWebSocket;
