import { useEffect,useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Snackbar,Text, TextField } from '@deriv-com/quill-ui';
import useAuth from '../contexts/AuthContext';
import useWebSocket from '../hooks/useWebSocket';

const AddTraderForm = ({ onAddTrader }) => {
    const [traderData, setTraderData] = useState({
        token: '',
        maxStake: null,
        minStake: null,
    });

    const { sendMessage, lastMessage } = useWebSocket();
    const { isAuthorized, isConnected } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [snackbar, setSnackbar] = useState({
        isVisible: false,
        message: '',
        status: 'neutral',
    });

    useEffect(() => {
        if (!lastMessage || !isProcessing) return;

        if (lastMessage.msg_type === 'copy_start') {
            setIsProcessing(false);

            if (lastMessage.error) {
                setSnackbar({
                    isVisible: true,
                    message: lastMessage.error.message || 'Failed to start copy trading',
                    status: 'fail',
                });
            } else {
                onAddTrader?.(traderData);
                setTraderData({
                    token: '',
                    maxStake: null,
                    minStake: null,
                });
                setSnackbar({
                    isVisible: true,
                    message: 'Successfully started copy trading',
                    status: 'neutral',
                });
            }
        }
    }, [lastMessage, isProcessing, onAddTrader, traderData]);

    const handleSubmit = e => {
        e.preventDefault();
        if (!isConnected || !isAuthorized) {
            setSnackbar({
                isVisible: true,
                message: 'Not connected to server',
                status: 'fail',
            });
            return;
        }
        const { maxStake, minStake } = traderData;

        if (minStake > maxStake) {
            setSnackbar({
                isVisible: true,
                message: 'Minimum stake cannot be greater than maximum stake',
                status: 'fail',
            });
            return;
        }

        setIsProcessing(true);
        sendMessage({
            copy_start: traderData.token,
            max_trade_stake: maxStake,
            min_trade_stake: minStake,
        });
    };

    const handleSnackbarClose = () => {
        setSnackbar(prev => ({ ...prev, isVisible: false }));
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setTraderData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <>
            <div className='bg-white p-6 rounded-lg border shadow-sm mb-8 flex flex-col gap-4'>
                <Text size='sm' className='text-gray-600'>
                    Enter trading details to start copying a trader
                </Text>
                <form onSubmit={handleSubmit}>
                    <div className='flex flex-col md:flex-row items-center gap-4'>
                        <div className='w-full flex-1'>
                            <TextField
                                className='w-full'
                                label='Trading Token'
                                name='token'
                                value={traderData.token}
                                onChange={handleChange}
                                placeholder='Enter trading token'
                                required
                            />
                        </div>
                        <div className='w-full flex-1'>
                            <TextField
                                className='w-full'
                                label='Minimum Stake'
                                name='minStake'
                                type='number'
                                min='0'
                                value={traderData.minStake ?? ''}
                                onChange={handleChange}
                                placeholder='Enter minimum stake'
                                required
                                message={
                                    traderData.minStake !== null && Number(traderData.minStake) <= 0
                                        ? 'Stake should be more than 0'
                                        : ''
                                }
                                status={
                                    traderData.minStake !== null && Number(traderData.minStake) <= 0
                                        ? 'error'
                                        : undefined
                                }
                            />
                        </div>
                        <div className='w-full flex-1'>
                            <TextField
                                className='w-full'
                                label='Maximum Stake'
                                name='maxStake'
                                type='number'
                                min='0'
                                value={traderData.maxStake ?? ''}
                                onChange={handleChange}
                                placeholder='Enter maximum stake'
                                required
                            />
                        </div>
                        <div className='w-full md:w-auto'>
                            <Button
                                className='w-full'
                                type='submit'
                                variant='primary'
                                disabled={!traderData.token.trim() || !traderData.maxStake || !traderData.minStake}
                            >
                                Start Copying
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
            <div className='fixed top-0 left-0 right-0 flex justify-center pt-4 z-50'>
                <Snackbar
                    isVisible={snackbar.isVisible}
                    message={snackbar.message}
                    status={snackbar.status}
                    hasCloseButton={true}
                    onCloseAction={handleSnackbarClose}
                    standalone={true}
                />
            </div>
        </>
    );
};

AddTraderForm.propTypes = {
    onAddTrader: PropTypes.func,
};

export default AddTraderForm;
