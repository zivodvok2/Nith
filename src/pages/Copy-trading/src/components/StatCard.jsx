import PropTypes from 'prop-types';
import { Text } from '@deriv-com/quill-ui';

const StatCard = ({ label, value, compact = false }) => (
    <div className={`${compact ? 'p-3' : 'p-4'} bg-gray-50 rounded-lg hover:shadow-md transition-shadow`}>
        <Text className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'} mb-1`}>{label}</Text>
        <Text size={compact ? 'lg' : 'xl'} bold className='text-gray-900'>
            {value}
        </Text>
    </div>
);

StatCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    compact: PropTypes.bool,
};

export default StatCard;
