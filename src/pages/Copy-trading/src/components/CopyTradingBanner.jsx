import PropTypes from 'prop-types';
import { DerivLightTrustedPartnershipIcon } from '@deriv/quill-icons';
import { Button,Text } from '@deriv-com/quill-ui';

const CopyTradingBanner = ({ onGetStarted }) => {
    return (
        <div className='mb-6'>
            <div className='bg-white p-8 rounded-lg shadow-sm'>
                <div className='flex flex-col md:flex-row items-center gap-8'>
                    <div className='flex-shrink-0 flex justify-center'>
                        <DerivLightTrustedPartnershipIcon height='120px' width='120px' />
                    </div>
                    <div className='flex flex-col items-center md:items-start gap-4 w-full md:w-fit text-center md:text-left'>
                        <Text size='xl' bold>
                            Copy Trading
                        </Text>
                        <Text className='text-gray-600'>
                            Start copying successful traders and earn while they trade.
                        </Text>
                        <Button variant='primary' size='lg' onClick={onGetStarted}>
                            Get Started
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

CopyTradingBanner.propTypes = {
    onGetStarted: PropTypes.func.isRequired,
};

export default CopyTradingBanner;
