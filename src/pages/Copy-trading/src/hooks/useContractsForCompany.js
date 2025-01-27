import { useEffect,useState } from 'react';
import { contractsConfig } from '../config/contracts_config';
import useWebSocket from './useWebSocket';

const consolidateContracts = contracts => {
    const contractMap = new Map();

    contracts.forEach(contract => {
        const key = `${contract.barrier_category}_${contract.contract_category}`;
        if (!contractMap.has(key)) {
            // Get config for contract type and barrier category
            const configContract = contractsConfig[contract.contract_type]?.[contract.barrier_category];

            contractMap.set(key, {
                barrier_category: contract.barrier_category,
                contract_category: contract.contract_category,
                // Use config contract_category_display if available, otherwise use from response
                contract_category_display:
                    configContract?.contract_category_display || contract.contract_category_display,
                default_stake: contract.default_stake,
                sentiments: {},
            });
        }

        const sentiment = contract.sentiment;
        contractMap.get(key).sentiments[sentiment] = {
            contract_type: contract.contract_type,
            contract_display: contract.contract_display,
        };
    });

    return Array.from(contractMap.values());
};

const useContractsForCompany = () => {
    const [contracts, setContracts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { sendMessage, isConnected } = useWebSocket();

    useEffect(() => {
        const fetchContracts = async () => {
            if (!isConnected) return;

            try {
                sendMessage({ contracts_for_company: 1 }, response => {
                    if (response.error) {
                        setError(response.error.message);
                        setContracts([]);
                    } else {
                        const availableContracts = response.contracts_for_company?.available || [];
                        const consolidatedContracts = consolidateContracts(availableContracts);
                        setContracts(consolidatedContracts);
                    }
                    setIsLoading(false);
                });
            } catch (err) {
                setError(err.message);
                setContracts([]);
                setIsLoading(false);
            }
        };

        fetchContracts();
    }, [isConnected, sendMessage]);

    return {
        contracts,
        isLoading,
        error,
    };
};

export default useContractsForCompany;
