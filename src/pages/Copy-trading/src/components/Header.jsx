import { Button, Skeleton,Text } from '@deriv-com/quill-ui';
import derivIcon from '../assets/deriv-icon.svg';
import { getConfig } from '../config';
import useAuth from '../contexts/AuthContext';
import useDerivAccounts from '../hooks/useDerivAccounts';
import AccountSelector from './AccountSelector';

const Header = () => {
    const { defaultAccount, otherAccounts, clearAccounts } = useDerivAccounts();
    const { isAuthorized, isLoading } = useAuth();
    const config = getConfig();
    const handleLogout = () => {
        clearAccounts();
        window.location.href = '/copy-trading/#/';
    };

    const handleDerivLogin = () => {
        window.location.href = `${config.OAUTH_URL}/oauth2/authorize?app_id=${config.APP_ID}`;
    };

    return (
        <header className='bg-white shadow-sm'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                        <img src={derivIcon} alt='Deriv' className='w-6 h-6' />
                        <Text size='lg' bold>
                            Copy Trading
                        </Text>
                    </div>

                    <div className='flex items-center space-x-4'>
                        {isLoading ? (
                            <>
                                <div className='w-40 h-8'>
                                    <Skeleton.Square active rounded width='100%' />
                                </div>
                                <div className='w-20 h-8'>
                                    <Skeleton.Square active rounded width='100%' />
                                </div>
                            </>
                        ) : (
                            <>
                                {isAuthorized && (
                                    <AccountSelector defaultAccount={defaultAccount} otherAccounts={otherAccounts} />
                                )}
                                {isAuthorized ? (
                                    <Button variant='secondary' size='sm' onClick={handleLogout} color='black'>
                                        Log out
                                    </Button>
                                ) : (
                                    <Button variant='primary' size='sm' onClick={handleDerivLogin}>
                                        Log in
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
