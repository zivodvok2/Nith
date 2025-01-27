import { useEffect,useState } from 'react';
import { DerivLightIcWarningIcon } from '@deriv/quill-icons';
import { Button, Text,TextField } from '@deriv-com/quill-ui';
import useAPIToken from '../hooks/useAPIToken';
import TokenContainer from './TokenContainer';

const TOKEN_NAME_REGEX = /^[a-zA-Z0-9_]+$/;

const TokenManagement = () => {
    const { createToken, getTokens, deleteToken } = useAPIToken();
    const [tokens, setTokens] = useState([]);
    const [tokenName, setTokenName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [lastCreatedToken, setLastCreatedToken] = useState(null);
    const [error, setError] = useState('');
    const [isValidInput, setIsValidInput] = useState(true);

    const fetchTokens = async () => {
        try {
            const response = await getTokens();
            if (response.api_token?.tokens) {
                const readTokens = response.api_token.tokens.filter(token => token.scopes?.includes('read'));
                setTokens(readTokens);
            }
        } catch (error) {
            console.error('Failed to fetch tokens:', error);
        }
    };

    useEffect(() => {
        fetchTokens();
    }, []);

    const handleCreateToken = async () => {
        if (!tokenName.trim()) return;

        setIsCreating(true);
        setError('');

        try {
            const response = await createToken(tokenName, ['read']);
            if (response.api_token?.tokens) {
                const readTokens = response.api_token.tokens.filter(token => token.scopes?.includes('read'));
                // Find the newly created token by matching the name
                const newlyCreated = readTokens.find(token => token.display_name === tokenName);
                setTokens(readTokens);
                if (newlyCreated) {
                    setLastCreatedToken(newlyCreated);
                    setTokenName(''); // Clear form only after successful token creation
                }
            }
        } catch (error) {
            console.error('Failed to create token:', error);
            setError(error.message || 'Failed to create token. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteToken = async token => {
        setError('');
        try {
            await deleteToken(token);
            fetchTokens(); // Refresh token list after deletion
        } catch (error) {
            console.error('Failed to delete token:', error);
            setError(error.message || 'Failed to delete token. Please try again.');
        }
    };

    return (
        <div className='bg-white p-6 rounded-lg shadow-sm mb-8 flex flex-col gap-4'>
            {/* Token Creation Form */}
            <Text size='xl' bold className='mb-4'>
                API Tokens
            </Text>

            <div className='mb-6 rounded-md flex flex-col gap-4'>
                <div className='flex flex-col md:flex-row items-start gap-2'>
                    <TextField
                        label='Create New Token'
                        value={tokenName}
                        onChange={e => {
                            const value = e.target.value;
                            setTokenName(value);
                            setIsValidInput(value === '' || TOKEN_NAME_REGEX.test(value));
                            if (value === '' || TOKEN_NAME_REGEX.test(value)) {
                                setError('');
                            }
                        }}
                        placeholder='Enter token name'
                        disabled={isCreating}
                        fullWidth
                        status={!isValidInput || !!error ? 'error' : undefined}
                        message={!isValidInput ? 'Only letters, numbers, and underscores are allowed' : error || ''}
                    />
                    <Button
                        onClick={handleCreateToken}
                        variant='primary'
                        size='lg'
                        isLoading={isCreating}
                        disabled={isCreating || !tokenName.trim() || !isValidInput}
                        className='w-full md:w-auto'
                    >
                        {isCreating ? 'Creating...' : 'Create'}
                    </Button>
                </div>
                <Text className='mt-2 text-gray-600 text-sm'>
                    This token will have read-only access for copy trading purposes.
                </Text>
            </div>

            {/* New Token Display */}
            {lastCreatedToken && (
                <div className='mb-6'>
                    <div className='mb-2 flex items-center gap-2'>
                        <DerivLightIcWarningIcon height='20px' width='20px' />
                        <Text bold>New Token:</Text>
                        <Text className='text-yellow-600 text-sm'>
                            Make sure to copy your {lastCreatedToken.display_name} token now. You won&apos;t be able to
                            see it again!
                        </Text>
                    </div>
                    <TokenContainer tokenData={lastCreatedToken} isNew={true} onDelete={handleDeleteToken} />
                </div>
            )}

            {/* Available Tokens List */}
            <div className='space-y-4'>
                <Text bold>Available Tokens</Text>
                {tokens.length === 0 ? (
                    <Text className='text-gray-600'>No tokens available. Create one to share with copiers.</Text>
                ) : (
                    // Sort tokens to show newly created token first
                    [...tokens]
                        .sort((a, b) => {
                            if (a.display_name === lastCreatedToken?.display_name) return -1;
                            if (b.display_name === lastCreatedToken?.display_name) return 1;
                            return 0;
                        })
                        .map((token, index) => (
                            <TokenContainer
                                key={index}
                                tokenData={token}
                                isNew={token.display_name === lastCreatedToken?.display_name}
                                onDelete={handleDeleteToken}
                            />
                        ))
                )}
            </div>
        </div>
    );
};

export default TokenManagement;
