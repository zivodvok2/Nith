import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { LegacyClose1pxIcon } from '@deriv/quill-icons/Legacy';
import { Localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import LocalFooter from '../../components/load-modal/Zenith_loader';
import WorkspaceControl from '../../components/load-modal/workspace-control';
import { useStore } from '../../hooks/useStore';
import './my-bots.scss'; // Import the SCSS file

const MyBots = observer(() => {
    const { dashboard, load_modal, blockly_store } = useStore();
    const { active_tab, active_tour } = dashboard;
    const { handleFileChange, loaded_local_file, setLoadedLocalFile, imported_strategy_type } = load_modal;

    const [is_file_supported, setIsFileSupported] = React.useState(true);
    const { isDesktop } = useDevice();
    const { is_loading } = blockly_store;
    const [activeCategory, setActiveCategory] = React.useState<'digit' | 'trend' | 'market' | 'special'>('digit');
    const xml_files = {
        digit: [
            { name: '1 tick Digit Over 2', file_path: '/My_xml/tickDIgitOver.xml', description: 'A fast-paced digit over strategy.', title: '1 Tick Digit Over 2' },
            { name: 'Defender Digits Auto Bot', file_path: '/My_xml/Defender_Digits Auto Bot.xml', description: 'Defensive strategy for digits trading.', title: 'Defender Digits Auto Bot' },
            { name: 'Digit Over 3', file_path: '/My_xml/Digit Over 3.xml', description: 'Digit over strategy with a multiplier.', title: 'Digit Over 3' },
            { name: 'DIGIT-OVER COMPOUNDER', file_path: '/My_xml/DIGIT-OVER COMPOUNDER STRATEGY BOT.xml', description: 'A compounding strategy bot for digit trading.', title: 'Digit Over Compounder' },
            { name: 'Shark Digits', file_path: '/My_xml/Shark_Digits.xml', description: 'Aggressive digit trading strategy.', title: 'Shark Digits' },
            { name: 'SPUTNIK Digit Differ', file_path: '/My_xml/SPUTNIK_DIGIT-DIFFER BOT.xml', description: 'Differ bot with a Sputnik pattern.', title: 'SPUTNIK Digit Differ' },
            { name: 'Quad Digit Bot', file_path: '/My_xml/Quad Digit Bot.xml', description: 'Four-step digit trading bot.', title: 'Quad Digit Bot' },
            { name: 'Renko Digits', file_path: '/My_xml/Renko-Digits.xml', description: 'Renko-based digit trading strategy.', title: 'Renko Digits' },
            { name: 'Stealth Mode Digit Over', file_path: '/My_xml/Stealth-Mode-DigitOver-AutoBot.xml', description: 'Stealth mode digit over bot.', title: 'Stealth Mode Digit Over' },
            { name: 'Super Digit Differ Bot', file_path: '/My_xml/Super Digit Differ Bot.xml', description: 'Advanced digit differ bot.', title: 'Super Digit Differ' },
            { name: 'Under 8 Smart Bot', file_path: '/My_xml/Under 8 Smart Bot.xml', description: 'Specialized under 8 trading bot.', title: 'Under 8 Smart Bot' },
            { name: 'Digit-Ranger Auto Bot', file_path: '/My_xml/Digit-Ranger-Auto-Bot.xml', description: 'Advanced ranger bot for digits.', title: 'Digit-Ranger Auto Bot' },
            { name: 'Dynamic Digits Auto Bot', file_path: '/My_xml/Dynamic_Digits-Auto-Bot.xml', description: 'Dynamic strategy for digit trading.', title: 'Dynamic Digits Auto Bot' }
        ],
        trend: [
            { name: 'Higher-Lower Trend Challenger', file_path: '/My_xml/Higher-Lower Trend-Challenger BinaryBot.xml', description: 'A trend-based higher-lower bot.', title: 'Trend Challenger' },
            { name: 'HL BearKing Premium', file_path: '/My_xml/HL BearKing premium Bot.xml', description: 'Bearish trend strategy bot.', title: 'HL BearKing Premium' },
            { name: 'HL Hammer B-BOT', file_path: '/My_xml/HL HAMMER B-BOT 1.0.xml', description: 'Hammer pattern trading strategy.', title: 'HL Hammer B-BOT' },
            { name: 'Trend Follow', file_path: '/My_xml/trend_follow.xml', description: 'Follow the market trend strategy.', title: 'Trend Follow' },
            { name: 'Stoch and RSI Bot', file_path: '/My_xml/Stoch and RSI Bot.xml', description: 'Uses stochastic and RSI for trend analysis.', title: 'Stoch and RSI Bot' }
        ],
        market: [
            { name: 'RF Market Monitor', file_path: '/My_xml/RF_Market-Monitor.xml', description: 'Monitors market conditions for trading.', title: 'Market Monitor' },
            { name: 'RF Compressor Signal Bot', file_path: '/My_xml/RF-Compressor Signal Bot V1.0.1.xml', description: 'Compressed signal-based RF bot.', title: 'Compressor Signal Bot' },
            { name: 'VIX 100 UNDER DOG INDEX BOT', file_path: '/My_xml/VIX 100 UNDER DOG INDEX BOT.xml', description: 'Market-based volatility index bot.', title: 'VIX 100 Under Dog' },
            { name: 'Market Switcher Robot', file_path: '/My_xml/Market Switcher Robot by Binarytool.site.xml', description: 'Switches strategies based on market conditions.', title: 'Market Switcher' },
            { name: 'BULL-MARKET-AUTO-BOT TRADER', file_path: '/My_xml/BULL-MARKET-AUTO-BOT TRADER.XML', description: 'Bull market auto trader.', title: 'Bull Market Auto Bot' },
            { name: 'BEAR-MARKET-AUTO-BOT TRADER', file_path: '/My_xml/BEAR-MARKET-AUTO-BOT-TRADER.XML', description: 'Bear market auto trader.', title: 'Bear Market Auto Bot' }
        ],
        special: [
            { name: 'One Touch Tetris B-Bot', file_path: '/My_xml/One Touch Tetris B-Bot.xml', description: 'Unique strategy based on touch mechanics.', title: 'One Touch Tetris' },
            { name: '7-UP DIGIT BOT', file_path: '/My_xml/7-UP-DIGIT-BOT.XML.xml', description: 'Digit bot with an advanced up strategy.', title: '7-UP Digit Bot' },
            { name: 'VALENTINE PHANTOM DIFFER V2.0', file_path: '/My_xml/VALENTINE PHANTOM DIFFER V2.0 (1) (1).xml', description: 'A special phantom differ strategy bot.', title: 'Valentine Phantom Differ' },
            { name: 'Exponential Strategy Bot', file_path: '/My_xml/Exponential_Strategy_Bot.xml', description: 'An exponentially growing strategy.', title: 'Exponential Strategy' },
            { name: 'Auto C4 Volt Under 8 AI Premium', file_path: '/My_xml/AUTO_C4_VOLT_Under8_AI_PREMIUM.xml', description: 'Auto trading bot for under 8.', title: 'Auto C4 Volt Under 8 AI' }
        ]
    };
   

    const loadFile = async (file_path: any) => {
        try {
            const response = await fetch(file_path);
            if (!response.ok) throw new Error(`Failed to fetch the file: ${response.statusText}`);
            const file_content = (await response.text()) as string;
            const file = new Blob([file_content], { type: 'text/xml' });
            const file_object = new File([file], file_path.split('/').pop(), { type: 'text/xml' });

            const is_supported = handleFileChange({ target: { files: [file_object] } }, false);
            setIsFileSupported(is_supported);

            if (is_supported) {
                setLoadedLocalFile(file_object);
            }
        } catch (error) {
            console.error('Error loading the file:', error);
            setIsFileSupported(false);
        }
    };

    React.useEffect(() => {
        if (loaded_local_file && is_file_supported && imported_strategy_type !== 'pending' && !is_loading) {
            console.log('File loaded successfully');
        }
    }, [loaded_local_file, is_file_supported, imported_strategy_type, is_loading]);

    if (loaded_local_file && is_file_supported) {
        return (
            <div className='load-strategy__container load-strategy__container--has-footer'>
                <div
                    className={classNames('load-strategy__local-preview', {
                        'load-strategy__local-preview--active': active_tab === 1 && active_tour,
                    })}
                >
                    <div className='load-strategy__title'>
                        <Localize i18n_default_text='Preview' />
                    </div>
                    <div className='load-strategy__preview-workspace'>
                        <div id='load-strategy__blockly-container' style={{ height: '100%' }}>
                            <div className='load-strategy__local-preview-close'>
                                <LegacyClose1pxIcon
                                    onClick={() => setLoadedLocalFile(null)}
                                    height='20px'
                                    width='20px'
                                />
                            </div>
                            <WorkspaceControl />
                        </div>
                    </div>
                </div>
                {!isDesktop && (
                    <div className='load-strategy__local-footer'>
                        <LocalFooter />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className='load-strategy__container'>
            <div className='load-strategy__file-list'>
                <div className='category-tabs'>
    <button
        className={classNames('category-tab', 'category-tab-new', { active: activeCategory === 'digit' })}
        onClick={() => setActiveCategory('digit')}
    >
        Digit
    </button>
    <button
        className={classNames('category-tab', 'category-tab-old', { active: activeCategory === 'market' })}
        onClick={() => setActiveCategory('market')}
    >
        Market
    </button>
    <button
        className={classNames('category-tab', 'category-tab-popular', { active: activeCategory === 'trend' })}
        onClick={() => setActiveCategory('trend')}
    >
        Trend
    </button>
    <button
        className={classNames('category-tab', 'category-tab-popular', { active: activeCategory === 'special' })}
        onClick={() => setActiveCategory('special')}
    >
        Special
    </button>
</div>
<div className='file-cards'>
    {xml_files[activeCategory].map(file => (
        <button 
            key={file.name} 
            className='file-card' 
            onClick={() => loadFile(file.file_path)}
        >
            <h3 className='file-title'>{file.title}</h3>
            
        </button>
    ))}
</div>

            </div>
        </div>
    );
});

export default MyBots;