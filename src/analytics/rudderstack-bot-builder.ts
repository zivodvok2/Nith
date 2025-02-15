import { Analytics, TEvents } from '@deriv-com/analytics';
import { ACTION, form_name } from './constants';

export const rudderStackSendSwitchLoadStrategyTabEvent = ({ quick_strategy_tab }: TEvents['ce_bot_form']) => {
    Analytics.trackEvent('ce_bot_form', {
        action: ACTION.SWITCH_QUICK_STRATEGY_TAB,
        form_name,
        quick_strategy_tab,
        subform_name: 'quick_strategy',
        subpage_name: 'bot_builder',
    });
};
