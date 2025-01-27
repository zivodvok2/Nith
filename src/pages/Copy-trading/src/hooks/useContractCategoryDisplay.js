import { useMemo } from 'react';
import useContractsForCompany from './useContractsForCompany';

const useContractCategoryDisplay = contractTypes => {
    const { contracts, isLoading, error } = useContractsForCompany();

    const contractCategoryDisplays = useMemo(() => {
        if (!contracts.length || !contractTypes?.length) return [];

        const displays = new Set();

        contracts.forEach(contract => {
            Object.entries(contract.sentiments).forEach(([, sentimentData]) => {
                if (contractTypes.includes(sentimentData.contract_type)) {
                    displays.add(contract.contract_category_display);
                }
            });
        });

        return Array.from(displays);
    }, [contracts, contractTypes]);

    return {
        contractCategoryDisplays,
        isLoading,
        error,
    };
};

export default useContractCategoryDisplay;
