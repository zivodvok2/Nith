import { useCallback, useEffect,useState } from 'react';

const useDerivAccounts = () => {
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [otherAccounts, setOtherAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load accounts from localStorage when hook is initialized
    useEffect(() => {
        try {
            console.log('Loading accounts from localStorage');
            const storedDefault = localStorage.getItem('deriv_default_account');
            const storedOthers = localStorage.getItem('deriv_other_accounts');

            if (storedDefault) {
                console.log('Found stored default account:', JSON.parse(storedDefault));
                setDefaultAccount(JSON.parse(storedDefault));
            }
            if (storedOthers) {
                setOtherAccounts(JSON.parse(storedOthers));
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateAccounts = useCallback((newDefaultAccount, newOtherAccounts) => {
        console.log('Updating accounts:', { newDefaultAccount, newOtherAccounts });
        // Update state
        setDefaultAccount(newDefaultAccount);
        setOtherAccounts(newOtherAccounts);
        setIsLoading(false);

        // Update localStorage
        localStorage.setItem('deriv_default_account', JSON.stringify(newDefaultAccount));
        localStorage.setItem('deriv_other_accounts', JSON.stringify(newOtherAccounts));
    }, []);

    const clearAccounts = useCallback(() => {
        console.log('Clearing accounts');
        setDefaultAccount(null);
        setOtherAccounts([]);
        localStorage.removeItem('deriv_default_account');
        localStorage.removeItem('deriv_other_accounts');
    }, []);

    return {
        defaultAccount,
        otherAccounts,
        isLoading,
        updateAccounts,
        clearAccounts,
    };
};

export default useDerivAccounts;
