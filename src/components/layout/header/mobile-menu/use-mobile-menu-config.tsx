import { ComponentProps, ReactNode } from 'react';
import Livechat from '@/components/chat/Livechat';
import useIsLiveChatWidgetAvailable from '@/components/chat/useIsLiveChatWidgetAvailable';
import { standalone_routes } from '@/components/shared';
import { useOauth2 } from '@/hooks/auth/useOauth2';
import useRemoteConfig from '@/hooks/growthbook/useRemoteConfig';
import useThemeSwitcher from '@/hooks/useThemeSwitcher';
import RootStore from '@/stores/root-store';
import {
    LegacyAccountLimitsIcon,
    LegacyCashierIcon,
    LegacyChartsIcon,
    LegacyHelpCentreIcon,
    LegacyHomeOldIcon,
    LegacyLogout1pxIcon,
    LegacyProfileSmIcon,
    LegacyResponsibleTradingIcon,
    LegacyTheme1pxIcon,
    LegacyWhatsappIcon,
} from '@deriv/quill-icons/Legacy';
import { BrandDerivLogoCoralIcon } from '@deriv/quill-icons/Logo';
import { DerivLogo} from '@deriv-com/ui';
import { useTranslations } from '@deriv-com/translations';
import { ToggleSwitch } from '@deriv-com/ui';
import { URLConstants } from '@deriv-com/utils';

export type TSubmenuSection = 'accountSettings' | 'cashier';

//IconTypes
type TMenuConfig = {
    LeftComponent: ReactNode | React.ElementType;
    RightComponent?: ReactNode;
    as: 'a' | 'button';
    href?: string;
    label: ReactNode;
    onClick?: () => void;
    removeBorderBottom?: boolean;
    submenu?: TSubmenuSection;
    target?: ComponentProps<'a'>['target'];
}[];

const useMobileMenuConfig = (client?: RootStore['client']) => {
    const { localize } = useTranslations();
    const { is_dark_mode_on, toggleTheme } = useThemeSwitcher();
    const { oAuthLogout } = useOauth2({ handleLogout: async () => client?.logout(), client });
    const { data } = useRemoteConfig(true);
    const { cs_chat_whatsapp } = data;

    // Force live chat and WhatsApp to be unavailable and hidden
    const is_livechat_available = false; // Override to make live chat inactive
    const is_whatsapp_available = false; // Override to make WhatsApp inactive

    const menuConfig: TMenuConfig[] = [
        [
            {
                as: 'a',
                href: standalone_routes.dzenith,
                label: localize('D-zenith'),
                LeftComponent: BrandDerivLogoCoralIcon,
            },
            {
                as: 'button',
                label: localize('Dark theme'),
                LeftComponent: LegacyTheme1pxIcon,
                RightComponent: <ToggleSwitch value={is_dark_mode_on} onChange={toggleTheme} />,
            },
        ],
        (
            [
                // Remove WhatsApp from the menu configuration by commenting it out or deleting the code block
                /*
                cs_chat_whatsapp
                    ? {
                          as: 'a',
                          href: URLConstants.whatsApp,
                          label: localize('WhatsApp'),
                          LeftComponent: LegacyWhatsappIcon,
                          target: '_blank',
                      }
                    : null,
                */
                // Remove live chat from the menu configuration by commenting it out or deleting the code block
                /*
                is_livechat_available
                    ? {
                          as: 'button',
                          label: localize('Live chat'),
                          LeftComponent: Livechat,
                          onClick: () => {
                              window.enable_freshworks_live_chat
                                  ? window.fcWidget.open()
                                  : window.LiveChatWidget?.call('maximize');
                          },
                      }
                    : null,
                */
            ] as TMenuConfig
        ).filter(Boolean), // This removes null items from the menu array
        client?.is_logged_in
            ? [
                  {
                      as: 'button',
                      label: localize('Log out'),
                      LeftComponent: LegacyLogout1pxIcon,
                      onClick: oAuthLogout,
                      removeBorderBottom: true,
                  },
              ]
            : [],
    ];

    return {
        config: menuConfig,
    };
};

export default useMobileMenuConfig;
