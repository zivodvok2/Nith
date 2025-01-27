// RiskDisclaimerModal.tsx
import React from 'react';
import { Modal } from '@deriv-com/ui';
import { Localize, useTranslations } from '@deriv-com/translations';
import Text from '@/components/shared_ui/text';

const RiskDisclaimerModal = ({ onClose }: { onClose: () => void }) => {
    const { localize } = useTranslations();

    return (
        <Modal isOpen onClose={onClose}>
            <Modal.Header>{localize('Risk Disclaimer')}</Modal.Header>
            <Modal.Body>
                <Text>
                    {localize('Deriv offers complex derivatives, such as options and contracts for difference (“CFDs”).')}
                    <br />
                    {localize ('These products may not be suitable for all clients, and trading them puts you at risk.')}
                    <br />
                    {localize ('Please make sure that you understand the following risks before trading Deriv products:')}
                    <br /><br />
                    {localize('You may lose some or all of the money you invest in the trade.')}
                    <br />
                    {localize('If your trade involves currency conversion, exchange rates will affect your profit and loss.')}
                    <br />
                    {localize('You should never trade with borrowed money or with money that you cannot afford to lose.')}
                </Text>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={onClose}>{localize('Close')}</button>
            </Modal.Footer>
        </Modal>
    );
};

export default RiskDisclaimerModal;
