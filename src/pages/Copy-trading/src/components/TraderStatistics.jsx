import { Text } from '@deriv-com/quill-ui';
import useCopyTradingStats from '../hooks/useCopyTradingStats';
import useDerivAccounts from '../hooks/useDerivAccounts';
import StatCard from './StatCard';

const TraderStatistics = () => {
    const { defaultAccount } = useDerivAccounts();
    const { stats, isLoading, error } = useCopyTradingStats(defaultAccount?.account);

    if (error) {
        return <div className='text-red-500'>Error loading statistics: {error}</div>;
    }

    if (isLoading || !stats) {
        return <div>Loading statistics...</div>;
    }

    const statisticsData = [
        {
            label: 'Average Duration',
            value: `${stats.avg_duration ?? 0} seconds`,
        },
        {
            label: 'Average Loss',
            value: stats.avg_loss?.toFixed(2) ?? '0.00',
        },
        {
            label: 'Average Profit',
            value: stats.avg_profit?.toFixed(2) ?? '0.00',
        },
        {
            label: 'Current Copiers',
            value: stats.copiers ?? 0,
        },
        {
            label: 'Last 12 Months Profitable Trades',
            value: stats.last_12months_profitable_trades ?? 0,
        },
        {
            label: 'Performance Probability',
            value: `${(stats.performance_probability * 100).toFixed(1)}%`,
        },
        {
            label: 'Total Trades',
            value: stats.total_trades ?? 0,
        },
        {
            label: 'Profitable Trades',
            value: stats.trades_profitable ?? 0,
        },
    ];

    return (
        <div className='mt-8 p-6 bg-white rounded-lg shadow-sm'>
            <div className='flex items-center mb-8 pb-6 border-b border-gray-200'>
                <Text size='xl' bold className='text-gray-800 font-extrabold tracking-tight'>
                    My Trading Statistics
                </Text>
            </div>
            <div className='space-y-8'>
                {/* General Statistics */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {statisticsData.map((item, index) => (
                        <StatCard key={index} label={item.label} value={item.value} />
                    ))}
                </div>

                {/* Monthly Profitable Trades */}
                {Object.keys(stats.monthly_profitable_trades).length > 0 && (
                    <div>
                        <Text size='lg' bold className='mb-4 text-gray-800'>
                            Monthly Profitable Trades
                        </Text>
                        <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
                            {Object.entries(stats.monthly_profitable_trades).map(([month, value]) => {
                                const [year, monthNum] = month.split('-');
                                const monthName = new Date(`${year}-${monthNum}-01`).toLocaleString('default', {
                                    month: 'short',
                                });
                                return <StatCard key={month} label={`${monthName} ${year}`} value={value} compact />;
                            })}
                        </div>
                    </div>
                )}

                {/* Yearly Profitable Trades */}
                {Object.keys(stats.yearly_profitable_trades).length > 0 && (
                    <div>
                        <Text size='lg' bold className='mb-4 text-gray-800'>
                            Yearly Profitable Trades
                        </Text>
                        <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
                            {Object.entries(stats.yearly_profitable_trades).map(([year, value]) => (
                                <StatCard key={year} label={year} value={value} compact />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TraderStatistics;
