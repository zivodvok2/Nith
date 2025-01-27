import { useState } from 'react';
import PropTypes from 'prop-types';
import { DropdownButton,Text } from '@deriv-com/quill-ui';
import ProfitableChart from './ProfitableChart';

const ProfitableTrades = ({ monthlyTrades, yearlyTrades }) => {
    const [selectedView, setSelectedView] = useState('monthly');

    const viewOptions = [
        {
            id: 1,
            label: 'Monthly View',
            value: 'monthly',
            onClick: () => setSelectedView('monthly'),
        },
        {
            id: 2,
            label: 'Yearly View',
            value: 'yearly',
            onClick: () => setSelectedView('yearly'),
        },
    ];

    const data = selectedView === 'monthly' ? monthlyTrades : yearlyTrades;

    return (
        <div>
            <div className='flex justify-between items-center mb-4'>
                <Text size='lg' bold className='text-gray-800'>
                    Profitable Trades
                </Text>
                <DropdownButton
                    actionSheetFooter={{
                        primaryAction: {
                            content: 'Apply',
                            onAction: () => {},
                        },
                    }}
                    color='black'
                    contentHeight='sm'
                    contentTitle=''
                    iconPosition='start'
                    label={selectedView === 'monthly' ? 'Monthly View' : 'Yearly View'}
                    onClose={() => {}}
                    onOpen={() => {}}
                    onSelectionChange={() => {}}
                    options={viewOptions}
                    size='md'
                    variant='primary'
                    closeContentOnClick
                />
            </div>
            <ProfitableChart data={data} type={selectedView} />
        </div>
    );
};

ProfitableTrades.propTypes = {
    monthlyTrades: PropTypes.objectOf(PropTypes.number).isRequired,
    yearlyTrades: PropTypes.objectOf(PropTypes.number).isRequired,
};

export default ProfitableTrades;
