import { useCallback,useEffect, useState } from 'react';
import { getConfig } from '../config';

// Singleton WebSocket instance
let wsInstance = null;
let subscribers = new Set();
let messageHandlers = new Map();
let currentReqId = 1;
let pingInterval = null;

// Ping interval in milliseconds (10 seconds)
const PING_INTERVAL = 10000;

const sendPing = () => {
    if (wsInstance?.readyState === WebSocket.OPEN) {
        const reqId = generateReqId();
        wsInstance.send(JSON.stringify({ ping: 1, req_id: reqId }));
    }
};

const generateReqId = () => {
    return currentReqId++;
};

const createWebSocket = () => {
    const config = getConfig();
    const { WS_URL, APP_ID } = config;
    const wsUrl = `${WS_URL}?app_id=${APP_ID}`;

    if (wsInstance) {
        return wsInstance;
    }
    wsInstance = new WebSocket(wsUrl);

    wsInstance.onopen = () => {
        subscribers.forEach(subscriber => subscriber.onOpen?.());
        // Start ping interval
        if (pingInterval) {
            clearInterval(pingInterval);
        }
        pingInterval = setInterval(sendPing, PING_INTERVAL);
    };

    wsInstance.onclose = () => {
        subscribers.forEach(subscriber => subscriber.onClose?.());
        wsInstance = null;
        messageHandlers.clear();
        // Clear ping interval
        if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
        }
    };

    wsInstance.onerror = error => {
        subscribers.forEach(subscriber => subscriber.onError?.(error));
    };

    wsInstance.onmessage = event => {
        try {
            const response = JSON.parse(event.data);
            const reqId = response.req_id;

            // Skip broadcasting ping messages
            if (!response.ping) {
                // Handle specific message handler if exists
                if (reqId && messageHandlers.has(reqId)) {
                    messageHandlers.get(reqId)(response);
                    messageHandlers.delete(reqId);
                }

                // Broadcast to all subscribers (except ping)
                subscribers.forEach(subscriber => subscriber.onMessage?.(response));
            }
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    };

    return wsInstance;
};

const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [lastMessage, setLastMessage] = useState(null);

    useEffect(() => {
        const subscriber = {
            onOpen: () => {
                setIsConnected(true);
                setError(null);
            },
            onClose: () => {
                setIsConnected(false);
            },
            onError: error => {
                setError(error);
                setIsConnected(false);
            },
            onMessage: message => {
                setLastMessage(message);
            },
        };

        subscribers.add(subscriber);
        const ws = createWebSocket();

        // If WebSocket is already open when hook is initialized
        if (ws.readyState === WebSocket.OPEN) {
            setIsConnected(true);
        }

        return () => {
            subscribers.delete(subscriber);
        };
    }, []);

    const sendMessage = useCallback((message, callback) => {
        if (!wsInstance || wsInstance.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket is not connected');
        }

        const reqId = generateReqId();
        const messageWithId = {
            ...message,
            req_id: reqId,
        };

        if (callback) {
            messageHandlers.set(reqId, callback);
        }

        wsInstance.send(JSON.stringify(messageWithId));
        return reqId;
    }, []);

    const close = useCallback(() => {
        if (wsInstance) {
            wsInstance.close();
        }
    }, []);

    return {
        isConnected,
        error,
        lastMessage,
        sendMessage,
        close,
    };
};

export default useWebSocket;
