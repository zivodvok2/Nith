import { standalone_routes } from '@/components/shared';
import { useTranslations } from '@deriv-com/translations';
import { PlatformSwitcher as UIPlatformSwitcher, PlatformSwitcherItem } from '@deriv-com/ui';
import { platformsConfig } from '../header-config';
import './platform-switcher.scss';

const PlatformSwitcher = () => {
    const shouldRenderPlatforms = false; // Toggle visibility

    if (!shouldRenderPlatforms) {
        return null; // Hides the entire component
    }
    const { localize } = useTranslations();

    return (
        <UIPlatformSwitcher
            bottomLinkLabel={localize('Looking for CFDs? Go to Trader’s Hub')}
            buttonProps={{
                icon: null, //platformsConfig[1].buttonIcon,
            }}
            bottomLinkProps={{
                href: '', //standalone_routes.traders_hub,
            }}
        >
            {platformsConfig.map(() => null)}
        </UIPlatformSwitcher>
    );
};

export default PlatformSwitcher;
