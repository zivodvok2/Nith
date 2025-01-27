import React from 'react';
import { Modal } from '@deriv-com/ui';
import { Localize, useTranslations } from '@deriv-com/translations';
import Text from '../../shared_ui/text';
import Cookies from 'js-cookie';  // Import js-cookie to manage cookies
import './footer.scss';

const RiskDisclaimerModal = ({ onClose }: { onClose: () => void }) => {
    const { localize } = useTranslations();

    // Function to handle "Never show this again"
    const handleNeverShowAgain = () => {
        // Set a cookie to prevent the modal from showing again
        Cookies.set('hide_risk_disclaimer', 'true', { expires: 365 }); // Cookie will expire in 365 days
        onClose(); // Close the modal after setting the cookie
    };

    return ( 
        <Modal className='.mod' isOpen={true} onRequestClose={onClose}>
            <Modal.Header className= 'risk-header'>{localize('Risk Disclaimer')}</Modal.Header>
            <Modal.Body className='risk-disclaimer-body'>
                <Text >
                    {localize('Deriv offers complex derivatives, such as options and contracts for difference (“CFDs”).')}
                    <br />
                    {localize('These products may not be suitable for all clients, and trading them puts you at risk.')}
                    <br />
                    {localize('Please make sure that you understand the following risks before trading Deriv products:')}
                    <br />
                    {localize('You may lose some or all of the money you invest in the trade.')}
                    <br />
                    {localize('If your trade involves currency conversion, exchange rates will affect your profit and loss.')}
                    <br />
                    {localize('You should never trade with borrowed money or with money that you cannot afford to lose.')}
                </Text>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={onClose} className='close-button'>{localize('Close')}</button>
                <button onClick={handleNeverShowAgain} className='never-show-button'>
                    {localize('Never show this again')}
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default RiskDisclaimerModal;
