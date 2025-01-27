import { useEffect, useState } from 'react';
import { Snackbar, Spinner,Text } from '@deriv-com/quill-ui';
import useCopyStart from '../hooks/useCopyStart';
import useCopyStop from '../hooks/useCopyStop';
import useCopyTradersList from '../hooks/useCopyTradersList';
import AddTraderForm from './AddTraderForm';
import TraderCard from './TraderCard';

const CopierDashboard = () => {
    const { startCopyTrading, processingTrader: copyStartProcessingTrader } = useCopyStart();
    const { stopCopyTrading, processingTrader: copyStopProcessingTrader } = useCopyStop();
    const { traders: apiTraders, isLoading, error, refreshList } = useCopyTradersList();

    useEffect(() => {
        console.log('CopierDashboard - Traders:', {
            apiTraders,
            isLoading,
            error,
        });
    }, [apiTraders, isLoading, error]);
    const isProcessing = copyStartProcessingTrader || copyStopProcessingTrader;
    const [snackbar, setSnackbar] = useState({
        isVisible: false,
        message: '',
        status: 'neutral',
    });

    const handleSnackbarClose = () => {
        setSnackbar(prev => ({ ...prev, isVisible: false }));
    };

    const handleStartCopy = trader => {
        startCopyTrading(
            trader,
            trader => {
                setSnackbar({
                    isVisible: true,
                    message: `Successfully started copying ${trader.id}`,
                    status: 'neutral',
                });
            },
            errorMessage => {
                setSnackbar({
                    isVisible: true,
                    message: errorMessage,
                    status: 'fail',
                });
            }
        );
    };

    const handleStopCopy = trader => {
        stopCopyTrading(
            trader,
            trader => {
                setSnackbar({
                    isVisible: true,
                    message: `Stopped copying ${trader.name}`,
                    status: 'neutral',
                });
                refreshList();
            },
            errorMessage => {
                setSnackbar({
                    isVisible: true,
                    message: errorMessage,
                    status: 'fail',
                });
            }
        );
    };

    const handleAddTrader = trader => {
        console.log('New trader added:', trader);
        // Refresh the traders list from API
        refreshList();
    };

    return (
        <div className='max-w-6xl mx-auto p-6'>
            <AddTraderForm onAddTrader={handleAddTrader} />

            <div className='mb-8'>
                <Text size='lg' bold>
                    Actively Copied Traders
                </Text>
            </div>

            {isLoading ? (
                <div className='text-center py-8 flex items-center justify-center gap-2'>
                    <Spinner size='sm' />
                    <span>Loading traders</span>
                </div>
            ) : error ? (
                <div className='text-center py-8 text-red-600'>Error loading traders: {error}</div>
            ) : !apiTraders?.length ? (
                <div className='text-center py-8'>No traders available</div>
            ) : (
                <div className='grid gap-6'>
                    {apiTraders.map(trader => (
                        <TraderCard
                            key={trader.loginid}
                            trader={trader}
                            onStartCopy={handleStartCopy}
                            onStopCopy={handleStopCopy}
                            isProcessing={isProcessing}
                        />
                    ))}
                </div>
            )}

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
        </div>
    );
};

export default CopierDashboard;
