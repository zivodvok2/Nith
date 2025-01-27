import { useState } from 'react';
import PropTypes from 'prop-types';
import { Text,ToggleSwitch } from '@deriv-com/quill-ui';

const Settings = ({ settings, updateSettings, onChangeSettings }) => {
    const [allowCopiers, setAllowCopiers] = useState(settings?.allow_copiers ?? false);

    const handleTraderToggle = async () => {
        try {
            await updateSettings({ allow_copiers: !allowCopiers ? 1 : 0 });
            setAllowCopiers(!allowCopiers);
            onChangeSettings?.();
        } catch (error) {
            console.error('Failed to update trader status:', error);
        }
    };

    return (
        <div className='p-8 bg-white h-full space-y-8'>
            <Text as='h2' size='xl' bold>
                Settings
            </Text>
            <div>
                <div className='flex items-center justify-between gap-16'>
                    <div className='space-y-2'>
                        <Text as='h3' size='lg' bold>
                            Trader Mode
                        </Text>
                        <Text size='sm' color='secondary'>
                            Enable this to allow others to copy your trades
                        </Text>
                    </div>
                    <ToggleSwitch checked={allowCopiers} onChange={handleTraderToggle} size='lg' />
                </div>
            </div>
        </div>
    );
};

Settings.propTypes = {
    settings: PropTypes.shape({
        allow_copiers: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    }),
    updateSettings: PropTypes.func.isRequired,
    onChangeSettings: PropTypes.func,
};

export default Settings;
