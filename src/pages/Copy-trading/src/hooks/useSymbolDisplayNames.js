import { useMemo } from 'react';
import useActiveSymbols from './useActiveSymbols';

const useSymbolDisplayNames = (symbolsList = []) => {
    const { symbols, isLoading, error } = useActiveSymbols();

    const displayNames = useMemo(() => {
        if (!symbols.length || !symbolsList.length) return [];

        return symbolsList
            .map(symbol => {
                const symbolData = symbols.find(s => s.symbol === symbol);
                return symbolData ? symbolData.display_name : null;
            })
            .filter(Boolean);
    }, [symbols, symbolsList]);

    return {
        displayNames,
        isLoading,
        error,
    };
};

export default useSymbolDisplayNames;
