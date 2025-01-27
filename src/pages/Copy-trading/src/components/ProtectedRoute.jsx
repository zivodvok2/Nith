import { Navigate } from 'react-router-dom';
import useDerivAccounts from '../hooks/useDerivAccounts';

const ProtectedRoute = ({ children }) => {
    const { defaultAccount, isLoading } = useDerivAccounts();

    console.log('ProtectedRoute - defaultAccount:', defaultAccount);
    console.log('ProtectedRoute - isLoading:', isLoading);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!defaultAccount?.token) {
        console.log('No token found, redirecting to login');
        return <Navigate to='/' replace />;
    }

    return children;
};

export default ProtectedRoute;
