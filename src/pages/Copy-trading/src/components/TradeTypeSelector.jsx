import PropTypes from 'prop-types';
import { Chip, Text } from '@deriv-com/quill-ui';
import useContractsForCompany from '../hooks/useContractsForCompany';

const defaultOption = {
    label: 'Select a trade type',
    value: '',
};

const TradeTypeSelector = ({ selectedContracts = [], onChange }) => {
    const { contracts, isLoading, error } = useContractsForCompany();

    if (error) {
        return (
            <Text size='sm' className='text-red-600'>
                Error loading contracts: {error}
            </Text>
        );
    }

    if (isLoading) {
        return <Text size='sm'>Loading contracts...</Text>;
    }

    const dropdownOptions = contracts.map(contract => {
        const contractTypes = Object.values(contract.sentiments).map(sentiment => sentiment.contract_type);

        // Check if this contract is already selected
        const isSelected = selectedContracts.some(
            selectedContract =>
                JSON.stringify(Object.values(selectedContract.sentiments).map(s => s.contract_type)) ===
                JSON.stringify(contractTypes)
        );

        return {
            label: contract.contract_category_display,
            value: contractTypes,
            disabled: isSelected,
        };
    });

    const handleSelect = option => {
        if (!option || !option.value) return;

        // Find the contract that matches the selected option
        const selectedContract = contracts.find(
            contract =>
                JSON.stringify(Object.values(contract.sentiments).map(s => s.contract_type)) ===
                JSON.stringify(option.value)
        );

        if (selectedContract) {
            onChange?.([...selectedContracts, selectedContract]);
        }
    };

    return (
        <div className='flex flex-col gap-4'>
            <Text bold>Trade Types</Text>
            <div className='flex gap-2'>
                {selectedContracts.length === 0 ? (
                    <Chip.Dismissible label='All' size='md' />
                ) : (
                    selectedContracts.map(contract => (
                        <Chip.Dismissible
                            key={`${contract.barrier_category}_${contract.contract_category}`}
                            label={contract.contract_category_display}
                            onDismiss={() => {
                                const updatedContracts = selectedContracts.filter(
                                    c =>
                                        c.barrier_category !== contract.barrier_category ||
                                        c.contract_category !== contract.contract_category
                                );
                                onChange?.(updatedContracts);
                            }}
                            size='md'
                        />
                    ))
                )}
                <div className='max-h-[32px] z-10'>
                    <Chip.SingleSelectDropdown
                        defaultOption={defaultOption}
                        value={defaultOption}
                        options={dropdownOptions}
                        onSelectionChange={handleSelect}
                        size='md'
                    />
                </div>
            </div>
        </div>
    );
};

TradeTypeSelector.propTypes = {
    selectedContracts: PropTypes.arrayOf(
        PropTypes.shape({
            barrier_category: PropTypes.string.isRequired,
            contract_category: PropTypes.string.isRequired,
            contract_category_display: PropTypes.string.isRequired,
            sentiment: PropTypes.string.isRequired,
            contract_type: PropTypes.string.isRequired,
            contract_display: PropTypes.string.isRequired,
            sentiments: PropTypes.object.isRequired,
        })
    ),
    onChange: PropTypes.func,
};

export default TradeTypeSelector;
