import * as PositionsHelper from '../positions-helper';

describe('addCommaToNumber', () => {
    it('should work as expected with number steps of thousands leading to a comma separated string', () => {
        const number = 1224500.3153;
        expect(PositionsHelper.addCommaToNumber(number)).toEqual('1,224,500.3153');
    });
});

describe('getBarrierLabel', () => {
    it('should return Target label if contract has a digit contract type', () => {
        const contract_info = {
            contract_type: 'DIGITDIFF',
        };
        expect(PositionsHelper.getBarrierLabel(contract_info)).toEqual('Target');
    });
});

describe('getBarrierValue', () => {
    it('should return correct target value according to digit type mapping if contract type is digit', () => {
        const contract_info = {
            contract_type: 'DIGITDIFF',
            barrier: '1',
        };
        expect(PositionsHelper.getBarrierValue(contract_info)).toEqual('Not 1');
    });
    it('should return barrier value with correct rounding', () => {
        const contract_info = {
            contract_type: 'CALL',
            barrier: '2031.0000',
        };
        expect(PositionsHelper.getBarrierValue(contract_info)).toEqual('2,031.0000');
    });
    it('should return null if there is no barrier value or it is equal to null', () => {
        const contract_info = {
            contract_type: 'CALL',
            barrier: null,
        };
        expect(PositionsHelper.getBarrierValue(contract_info)).toEqual(null);
    });
});
