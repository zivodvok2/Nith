import React from 'react';
import { observer } from 'mobx-react';
import { Button } from '@deriv/components';
import { localize } from '@deriv/translations';
import { useStore } from 'Stores/useStore';
import './index.scss';

const RecentFooter = observer(() => {
    const { load_modal } = useStore();
    const { is_open_button_loading, loadFileFromRecent } = load_modal;
    return (
        <Button
            text={localize('Open')}
            onClick={loadFileFromRecent}
            is_loading={is_open_button_loading}
            has_effect
            primary
            large
        />
    );
});

export default RecentFooter;
