import PropTypes from 'prop-types';
import { DerivLightTradeInAnyDirectionIcon } from '@deriv/quill-icons';
import { Button, SectionMessage,Text } from '@deriv-com/quill-ui';

const TraderBanner = ({ onStartTrading, disabled = false }) => {
    return (
        <div className='bg-white p-8 rounded-lg shadow-sm'>
            <div className='flex flex-col md:flex-row items-center gap-8'>
                <div className='flex-shrink-0 flex justify-center'>
                    <DerivLightTradeInAnyDirectionIcon height='120px' width='120px' />
                </div>
                <div className='flex flex-col items-center md:items-start gap-4 w-full md:w-fit text-center md:text-left'>
                    <Text size='xl' bold>
                        Become a Trader
                    </Text>
                    <Text className='text-gray-600'>Allow others to copy your strategy by becoming a trader.</Text>
                    <Button onClick={onStartTrading} variant='primary' size='lg' disabled={disabled}>
                        Start Trading
                    </Button>
                    <div className='w-full max-w-[300px] md:max-w-none'>
                        <SectionMessage
                            message="You won't be able to copy others once you become a trader"
                            size='sm'
                            status='warning'
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

TraderBanner.propTypes = {
    onStartTrading: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default TraderBanner;
