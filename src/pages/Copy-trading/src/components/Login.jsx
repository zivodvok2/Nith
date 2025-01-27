import { useEffect } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
import { Spinner } from '@deriv-com/quill-ui';
import useDerivAccounts from '../hooks/useDerivAccounts';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { defaultAccount, isLoading, updateAccounts } = useDerivAccounts();

    useEffect(() => {
        // Handle OAuth redirect logic
        const currentUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search || location.search);
        const hashParams = new URLSearchParams(location.hash.replace('#', ''));

        console.log('OAuth Redirect Debug:', {
            currentUrl,
            urlSearch: window.location.search,
            locationSearch: location.search,
            hashSearch: location.hash,
            urlParams: Object.fromEntries(urlParams.entries()),
            hashParams: Object.fromEntries(hashParams.entries()),
            pathname: window.location.pathname,
            locationState: location.state,
        });

        const accounts = [];
        let defaultAcct = null;

        // Iterate through params to find account data
        let index = 1;
        while (urlParams.has(`acct${index}`) || hashParams.has(`acct${index}`)) {
            const account = {
                account: urlParams.get(`acct${index}`) || hashParams.get(`acct${index}`),
                token: urlParams.get(`token${index}`) || hashParams.get(`token${index}`),
                currency: urlParams.get(`cur${index}`) || hashParams.get(`cur${index}`),
            };
            console.log(`Found account ${index}:`, account);

            if (account.account && account.token) {
                accounts.push(account);
                if (index === 1) {
                    defaultAcct = account;
                }
            }
            index++;
        }

        // Handle accounts if found in OAuth redirect
        if (accounts.length > 0) {
            console.log('Updating accounts and redirecting to dashboard');
            const otherAccounts = accounts.slice(1);
            updateAccounts(defaultAcct, otherAccounts);
            window.location.href = `${window.location.origin}/copy-trading/#/dashboard`;
            return;
        }

        // Regular login flow - redirect if already logged in
        if (!isLoading && defaultAccount?.token) {
            navigate('/dashboard', { replace: true });
        }
    }, [defaultAccount, navigate, isLoading, location, updateAccounts]);

    const showSpinner =
        (isLoading || window.location.search || window.location.hash.includes('acct')) && !defaultAccount?.token;

    if (!showSpinner) {
        return null;
    }

    return (
        <div className='min-h-screen flex items-center justify-center'>
            <Spinner size='lg' />
        </div>
    );
};

export default Login;
