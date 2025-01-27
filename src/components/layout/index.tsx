import { useEffect } from 'react';
import clsx from 'clsx';
import Cookies from 'js-cookie';
import { Outlet } from 'react-router-dom';
import { useOauth2 } from '@/hooks/auth/useOauth2';
import { requestOidcAuthentication } from '@deriv-com/auth-client';
import { useDevice } from '@deriv-com/ui';
import Footer from './footer';
import AppHeader from './header';
import Body from './main-body';
import FloatingRiskDisclaimerButton from '../layout/RiskDisclaimer/FloatingRiskDisclaimerButton'; // Import the floating button
import './layout.scss';
import React from 'react';

const Layout = () => {
    const { isDesktop } = useDevice();
    const { isOAuth2Enabled } = useOauth2();

    const isCallbackPage = window.location.pathname === '/callback';
    const isLoggedInCookie = Cookies.get('logged_state') === 'true';
    const isEndpointPage = window.location.pathname.includes('endpoint');
    const clientAccounts = JSON.parse(localStorage.getItem('accountsList') ?? '{}');
    const isClientAccountsPopulated = Object.keys(clientAccounts).length > 0;

    useEffect(() => {
        if (isLoggedInCookie && !isClientAccountsPopulated && isOAuth2Enabled && !isEndpointPage && !isCallbackPage) {
            requestOidcAuthentication({
                redirectCallbackUri: `${window.location.origin}/callback`,
            });
        }
    }, [isLoggedInCookie, isClientAccountsPopulated, isOAuth2Enabled, isEndpointPage, isCallbackPage]);

    return (
        <div className={clsx('layout', { responsive: isDesktop })}>
            {!isCallbackPage && <AppHeader />}
            <Body>
                <Outlet />
                <FloatingRiskDisclaimerButton />
            </Body>
            {!isCallbackPage && isDesktop && <Footer />}
            {/* Render the floating risk disclaimer button */}
            
        </div>
    );
};

export default Layout;
