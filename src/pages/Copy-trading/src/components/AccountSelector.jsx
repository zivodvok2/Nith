import { useState } from 'react';
import PropTypes from 'prop-types';
import { DropdownButton } from '@deriv-com/quill-ui';

const AccountSelector = ({ defaultAccount, otherAccounts }) => {
    const [selectedAccount, setSelectedAccount] = useState(defaultAccount);

    const handleSelectionChange = selectedValue => {
        const account = [...otherAccounts, defaultAccount].find(acc => acc.account === selectedValue);
        if (account) {
            setSelectedAccount(account);
        }
    };

    const options = [
        {
            id: defaultAccount.account,
            label: `${defaultAccount.account}`,
            value: defaultAccount.account,
        },
        ...otherAccounts.map(account => ({
            id: account.account,
            label: `${account.account} (${account.currency})`,
            value: account.account,
        })),
    ];

    return (
        <DropdownButton
            actionSheetFooter={{
                primaryAction: {
                    content: 'Apply',
                    onAction: () => {},
                },
            }}
            closeContentOnClick
            color='black'
            contentAlign='right'
            contentHeight='sm'
            contentTitle='Accounts'
            iconPosition='start'
            label={`${selectedAccount.account} ${selectedAccount.currency ? `(${selectedAccount.currency})` : ''}`}
            onClose={() => {}}
            onOpen={() => {}}
            onSelectionChange={handleSelectionChange}
            options={options}
            size='sm'
            variant='secondary'
        />
    );
};

AccountSelector.propTypes = {
    defaultAccount: PropTypes.shape({
        account: PropTypes.string.isRequired,
    }).isRequired,
    otherAccounts: PropTypes.arrayOf(
        PropTypes.shape({
            account: PropTypes.string.isRequired,
            currency: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default AccountSelector;
