import { useState } from 'react';
import PropTypes from 'prop-types';
import {
    LabelPairedCircleCheckCaptionBoldIcon,
    LabelPairedCopySmRegularIcon,
    LegacyDelete1pxIcon,
} from '@deriv/quill-icons';
import { Text } from '@deriv-com/quill-ui';

const TokenContainer = ({ tokenData, isNew = false, onDelete, className = '' }) => {
    const containerStyles = {
        default: 'bg-gray-100/50',
        new: 'bg-yellow-50 border border-yellow-200',
    };

    const [showCopySuccess, setShowCopySuccess] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(tokenData.token);
        setShowCopySuccess(true);
        setTimeout(() => {
            setShowCopySuccess(false);
        }, 1000);
    };

    const handleDelete = () => {
        onDelete(tokenData.token);
    };

    return (
        <div
            className={`flex items-center gap-4 p-4 rounded-md ${
                isNew ? containerStyles.new : containerStyles.default
            } ${className}`}
        >
            <Text size='md' bold className='min-w-[150px] truncate'>
                {tokenData.display_name}
            </Text>
            <Text className='flex-1 font-mono break-all'>{tokenData.token}</Text>
            <div className='flex gap-2'>
                {isNew && (
                    <button className='p-2 hover:bg-gray-200 rounded-full transition-colors' onClick={handleCopy}>
                        {showCopySuccess ? (
                            <LabelPairedCircleCheckCaptionBoldIcon fill='#333333' iconSize='xs' />
                        ) : (
                            <LabelPairedCopySmRegularIcon fill='#333333' iconSize='xs' />
                        )}
                    </button>
                )}
                <button className='p-2 hover:bg-gray-200 rounded-full transition-colors' onClick={handleDelete}>
                    <LegacyDelete1pxIcon fill='#FF7F50' iconSize='xs' />
                </button>
            </div>
        </div>
    );
};

TokenContainer.propTypes = {
    tokenData: PropTypes.shape({
        display_name: PropTypes.string.isRequired,
        token: PropTypes.string.isRequired,
    }).isRequired,
    isNew: PropTypes.bool,
    onDelete: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default TokenContainer;
