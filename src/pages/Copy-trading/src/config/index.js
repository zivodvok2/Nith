// Production configuration
export const PROD_CONFIG = {
    APP_ID: '66982',
    WS_URL: 'wss://ws.derivws.com/websockets/v3',
    OAUTH_URL: 'https://oauth.deriv.com',
};

// Development configuration
export const DEV_CONFIG = {
    APP_ID: '66982',
    WS_URL: 'wss://ws.derivws.com/websockets/v3',
    OAUTH_URL: 'https://oauth.deriv.com',
};

// Get configuration with fallback to production values
export const getConfig = () => {
    // Use development config if all dev env variables are present
    APP_ID: '66982';
    WS_URL: 'wss://ws.derivws.com/websockets/v3';
    OAUTH_URL: 'https://oauth.deriv.com';

    // Fallback to production config
    return PROD_CONFIG;
};
