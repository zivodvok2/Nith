import { standalone_routes } from '../../../components/shared/utils/routes';
import { DerivLogo, useDevice } from '@deriv-com/ui';
import './app-logo.scss';
import React from 'react';

export const AppLogo = () => {
    const { isDesktop } = useDevice();

    if (!isDesktop) return null;

    return (
        <div className='app-header__logo-container'>
            <DerivLogo className='app-header__logo' href='/' variant='wallets' />
            <span className='app-header__logo-text'>D-zenith</span>
        </div>
    );
};
