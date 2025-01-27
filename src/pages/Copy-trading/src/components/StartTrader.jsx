import PropTypes from 'prop-types';
import { Button, Text } from '@deriv-com/quill-ui';

const StartTrader = ({ onStartTrading }) => {
    return (
        <div className='max-w-6xl mx-auto p-6'>
            <div className='text-center bg-white p-8 rounded-lg shadow-sm'>
                <Text size='2xl' bold className='mb-4'>
                    Start Your Trading Journey
                </Text>
                <Text className='mb-6 text-gray-600'>
                    Enable copy trading to let others follow your trading strategy and earn additional income.
                </Text>
                <Button onClick={onStartTrading} variant='primary' size='lg'>
                    Start as Trader
                </Button>
            </div>
        </div>
    );
};

StartTrader.propTypes = {
    onStartTrading: PropTypes.func.isRequired,
};

export default StartTrader;
