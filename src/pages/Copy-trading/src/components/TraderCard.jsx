import PropTypes from 'prop-types';
import { Button,Text } from '@deriv-com/quill-ui';
import useCopyTradingStats from '../hooks/useCopyTradingStats';

const TraderCard = ({ trader, onStopCopy }) => {
    const { stats, isLoading } = useCopyTradingStats(trader.loginid);

    const handleStopCopy = () => {
        onStopCopy(trader);
    };

    return (
        <div className='bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow'>
            <div className='flex flex-col md:flex-row justify-between items-start gap-4 mb-4'>
                <div>
                    <Text size='sm' className='text-gray-500'>
                        Trader
                    </Text>
                    <Text size='xl' bold>
                        {trader.loginid}
                    </Text>
                </div>
                <div className='flex flex-col md:flex-row gap-2 w-full md:w-auto'>
                    <Button variant='secondary' onClick={handleStopCopy} fullWidth>
                        Stop Copying
                    </Button>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                    <Text size='sm' className='text-gray-500'>
                        Maximum Stake
                    </Text>
                    <Text size='lg' bold>
                        {trader.max_trade_stake}
                    </Text>
                </div>
                <div>
                    <Text size='sm' className='text-gray-500'>
                        Minimum Stake
                    </Text>
                    <Text size='lg' bold>
                        {trader.min_trade_stake}
                    </Text>
                </div>
            </div>

            <div className='border-t pt-4 mb-4'>
                {isLoading ? (
                    <Text className='text-center text-gray-500'>Loading statistics...</Text>
                ) : stats ? (
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                        <div>
                            <Text size='sm' className='text-gray-500'>
                                Active Since
                            </Text>
                            <Text size='lg' bold>
                                {stats.active_since
                                    ? new Date(stats.active_since * 1000).toLocaleDateString('en-US', {
                                          month: 'long',
                                          year: 'numeric',
                                      })
                                    : '-'}
                            </Text>
                        </div>
                        <div>
                            <Text size='sm' className='text-gray-500'>
                                No. of profitable trades
                            </Text>
                            <Text size='lg' bold>
                                {stats.trades_profitable || 0}
                            </Text>
                        </div>
                        <div>
                            <Text size='sm' className='text-gray-500'>
                                No. of copiers
                            </Text>
                            <Text size='lg' bold>
                                {stats.copiers || 0}
                            </Text>
                        </div>
                        <div>
                            <Text size='sm' className='text-gray-500'>
                                Total Loss
                            </Text>
                            <Text size='lg' bold className='text-red-600'>
                                {stats.avg_loss || 0}
                            </Text>
                        </div>
                        <div>
                            <Text size='sm' className='text-gray-500'>
                                Total Profit
                            </Text>
                            <Text size='lg' bold className='text-green-600'>
                                {stats.avg_profit || 0}
                            </Text>
                        </div>
                        <div>
                            <Text size='sm' className='text-gray-500'>
                                Performance Probability
                            </Text>
                            <Text size='lg' bold>
                                {((stats.performance_probability || 0) * 100).toFixed(1)}%
                            </Text>
                        </div>
                    </div>
                ) : (
                    <Text className='text-center text-gray-500'>No statistics available</Text>
                )}
            </div>
        </div>
    );
};

TraderCard.propTypes = {
    trader: PropTypes.shape({
        loginid: PropTypes.string.isRequired,
        token: PropTypes.string.isRequired,
        max_trade_stake: PropTypes.number.isRequired,
        min_trade_stake: PropTypes.number.isRequired,
    }).isRequired,
    onStopCopy: PropTypes.func.isRequired,
};

export default TraderCard;
