import PropTypes from 'prop-types';

const TraderDesktopNavigation = ({ selectedMenu, onMenuSelect }) => {
    return (
        <div className='hidden md:block'>
            <div className='w-48 p-1 bg-system-light-secondary-background rounded-2xl'>
                <div className='relative flex flex-col'>
                    {/* Animated Background */}
                    <div
                        className='absolute transition-transform duration-200 ease-in-out bg-white rounded-xl shadow-sm h-12'
                        style={{
                            transform: `translateY(${
                                selectedMenu === 'statistics' ? '0' : selectedMenu === 'tokens' ? '48px' : '96px'
                            })`,
                            width: 'calc(100% - 8px)',
                            left: '4px',
                        }}
                    />

                    {/* Buttons */}
                    <button
                        onClick={() => onMenuSelect('statistics')}
                        className={`relative h-12 px-4 rounded-xl flex items-center justify-start transition-colors ${
                            selectedMenu === 'statistics'
                                ? 'text-solid-slate-1400 font-bold'
                                : 'text-solid-slate-700 hover:text-solid-slate-1200'
                        }`}
                    >
                        Statistics
                    </button>
                    <button
                        onClick={() => onMenuSelect('tokens')}
                        className={`relative h-12 px-4 rounded-xl flex items-center justify-start transition-colors ${
                            selectedMenu === 'tokens'
                                ? 'text-solid-slate-1400 font-bold'
                                : 'text-solid-slate-700 hover:text-solid-slate-1200'
                        }`}
                    >
                        API Tokens
                    </button>
                    <button
                        onClick={() => onMenuSelect('settings')}
                        className={`relative h-12 px-4 rounded-xl flex items-center justify-start transition-colors ${
                            selectedMenu === 'settings'
                                ? 'text-solid-slate-1400 font-bold'
                                : 'text-solid-slate-700 hover:text-solid-slate-1200'
                        }`}
                    >
                        Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

TraderDesktopNavigation.propTypes = {
    selectedMenu: PropTypes.oneOf(['statistics', 'tokens', 'settings']).isRequired,
    onMenuSelect: PropTypes.func.isRequired,
};

export default TraderDesktopNavigation;
