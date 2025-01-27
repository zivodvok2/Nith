type Service = 'derivCom' | 'derivApp' | 'smartTrader';
type DomainType = 'me' | 'be' | 'com';

interface DomainConfig {
    staging: string | Record<DomainType, string>;
    production: Record<DomainType, string>;
}

const domains: Record<Service, DomainConfig> = {
    derivCom: {
        staging: 'https://staging.deriv.com',
        production: {
            me: 'https://deriv.me',
            be: 'https://deriv.be',
            com: 'https://deriv.com',
        },
    },
    derivApp: {
        staging: 'https://staging-app.deriv.com',
        production: {
            me: 'https://app.deriv.me',
            be: 'https://app.deriv.be',
            com: 'https://app.deriv.com',
        },
    },
    smartTrader: {
        staging: {
            me: 'https://staging-smarttrader.deriv.me',
            be: 'https://staging-smarttrader.deriv.be',
            com: 'https://staging-smarttrader.deriv.com',
        },
        production: {
            me: 'https://smarttrader.deriv.me',
            be: 'https://smarttrader.deriv.be',
            com: 'https://smarttrader.deriv.com',
        },
    },
};

const getDerivDomain = (service: Service): string => {
    const hostname = window.location.hostname;
    const isStaging = hostname.includes('staging');
    const domainType: DomainType = hostname.endsWith('.me') ? 'me' : hostname.endsWith('.be') ? 'be' : 'com';

    const serviceConfig = domains[service];

    if (isStaging) {
        if (typeof serviceConfig.staging === 'string') {
            return serviceConfig.staging;
        } else {
            return serviceConfig.staging[domainType];
        }
    } else {
        return serviceConfig.production[domainType];
    }
};

/**
 * Standalone routes that use the domain helper functions.
 * Uses template literals to compose URLs dynamically.
 */
export const standalone_routes = {
    bot: '/',
    cashier: `${getDerivDomain('derivApp')}/cashier/`,
    cashier_deposit: `${getDerivDomain('derivApp')}/cashier/deposit`,
    cashier_p2p: `${getDerivDomain('derivApp')}/cashier/p2p`,
    contract: `${getDerivDomain('derivApp')}/contract/:contract_id`,
    personal_details: `${getDerivDomain('derivApp')}/account/personal-details`,
    positions: `${getDerivDomain('derivApp')}/reports/positions`,
    profit: `${getDerivDomain('derivApp')}/reports/profit`,
    reports: `${getDerivDomain('derivApp')}/reports`,
    root: getDerivDomain('derivApp'),
    smarttrader: getDerivDomain('smartTrader'),
    statement: `${getDerivDomain('derivApp')}/reports/statement`,
    trade: `${getDerivDomain('derivApp')}/dtrader`,
    traders_hub: 'https://d-zenith.com',
    wallets_transfer: `${getDerivDomain('derivApp')}/wallet/account-transfer`,
    signup: `https://hub.deriv.com/tradershub/signup`,
    deriv_com: getDerivDomain('derivCom'),
    deriv_app: getDerivDomain('derivApp'),
    endpoint: '/endpoint',
    account_limits: `${getDerivDomain('derivApp')}/account/account-limits`,
    help_center: `${getDerivDomain('derivCom')}/help-centre/`,
    responsible: `${getDerivDomain('derivCom')}/responsible/`,
    telegram: 'https://t.me/deriv_zenith',
    dzenith: 'https://d-zenith.com',
};
