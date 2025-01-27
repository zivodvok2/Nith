// FloatingRiskDisclaimerButton.tsx
import React, { useState } from 'react';
import { Modal } from '@deriv-com/ui';
import { Localize, useTranslations } from '@deriv-com/translations';
import Cookies from 'js-cookie';
import './FloatingRiskDisclaimerButton.scss';

const FloatingRiskDisclaimerButton = () => {
    const { localize } = useTranslations();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Check if the modal should be shown based on the cookie
    const shouldShowButton = !Cookies.get('hide_risk_disclaimer');

    // Open and close modal handlers
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Handle "Never show this again" action
    const handleNeverShowAgain = () => {
        Cookies.set('hide_risk_disclaimer', 'true', { expires: 365 }); // Set cookie to hide button
        closeModal();
    };

    if (!shouldShowButton) return null;

    return (
        <>
            {/* Floating button */}
            <button className='floating-risk-disclaimer-button' onClick={openModal}>
                {localize('Risk Disclaimer')}
            </button>

            {/* Modal */}
            {isModalOpen && (
                <Modal className='risk-disclaimer-modal' isOpen={true} onRequestClose={closeModal}>
                    <Modal.Header className='risk-header'>{localize('Risk Disclaimer')}</Modal.Header>
                    <Modal.Body className='risk-disclaimer-body'>
                        <p>
                            {localize(
                                'Deriv offers complex derivatives, such as options and contracts for difference (“CFDs”). These products may not be suitable for all clients, and trading them puts you at risk.'
                            )}
                        </p>
                        <ul>
                            <li>{localize('You may lose some or all of the money you invest in the trade.')}</li>
                            <li>{localize('')}</li>
                            <li>{localize('Do not trade with borrowed money or money you cannot afford to lose.')}</li>
                        </ul>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={closeModal} className='close-button'>
                            {localize('Close')}
                        </button>
                        <button onClick={handleNeverShowAgain} className='never-show-button'>
                            {localize('Never show this again')}
                        </button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default FloatingRiskDisclaimerButton;
