import React from 'react';
import { render, screen } from '@testing-library/react';
import AccumulatorsProfitLossTooltip from '../accumulators-profit-loss-tooltip';

jest.mock('Modules/SmartChart', () => ({
    ...jest.requireActual('Modules/SmartChart'),
    FastMarker: jest.fn(({ children, className }) => <div className={className}>{children}</div>),
}));
jest.mock('../accumulators-profit-loss-text', () => () => 'AccumulatorsProfitLossText');

describe('AccumulatorsProfitLossTooltip', () => {
    const props: React.ComponentProps<typeof AccumulatorsProfitLossTooltip> = {
        alignment: 'right',
        className: 'profit-loss-tooltip',
        currency: 'USD',
        current_spot: 6468.95,
        current_spot_time: 1666091856,
        high_barrier: '6469.10',
        is_sold: 0,
        profit: 0.15,
        should_show_profit_text: true,
    };
    const profit_text = 'Total profit/loss:';

    it('should render AccumulatorsProfitLossText if contract is not sold', () => {
        render(<AccumulatorsProfitLossTooltip {...props} />);

        expect(screen.getByText('AccumulatorsProfitLossText')).toBeInTheDocument();
    });
    it('should not render AccumulatorsProfitLossText if should_show_profit_text is false', () => {
        render(<AccumulatorsProfitLossTooltip {...props} should_show_profit_text={false} />);

        expect(screen.queryByText('AccumulatorsProfitLossText')).not.toBeInTheDocument();
    });
    it('should render AccumulatorsProfitLossTooltip when contract is sold', () => {
        jest.useFakeTimers();

        render(
            <AccumulatorsProfitLossTooltip
                {...props}
                is_sold={1}
                exit_tick={props.current_spot}
                exit_tick_time={props.current_spot_time}
            />
        );

        const spot_el = screen.getByTestId('dt_accumulator_tooltip_spot');
        expect(spot_el).toBeInTheDocument();
        expect(spot_el).toHaveClass('profit-loss-tooltip__spot-circle');
        expect(screen.getByText(profit_text)).toBeInTheDocument();
        expect(screen.getByText('0.15 USD')).toBeInTheDocument();
    });
});
