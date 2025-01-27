import PropTypes from 'prop-types';

const TraderMobileNavigation = ({ selectedMenu, onMenuSelect }) => {
    return (
        <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-system-light-secondary-background px-4 py-3'>
            <div className='flex justify-around items-center max-w-6xl mx-auto'>
                <button
                    onClick={() => onMenuSelect('statistics')}
                    className={`flex flex-col items-center px-4 py-2 rounded-lg w-32 ${
                        selectedMenu === 'statistics' ? 'text-solid-slate-1400 font-bold' : 'text-solid-slate-700'
                    }`}
                >
                    <span className='text-sm'>Statistics</span>
                </button>
                <button
                    onClick={() => onMenuSelect('tokens')}
                    className={`flex flex-col items-center px-4 py-2 rounded-lg w-32 ${
                        selectedMenu === 'tokens' ? 'text-solid-slate-1400 font-bold' : 'text-solid-slate-700'
                    }`}
                >
                    <span className='text-sm'>API Tokens</span>
                </button>
                <button
                    onClick={() => onMenuSelect('settings')}
                    className={`flex flex-col items-center px-4 py-2 rounded-lg w-32 ${
                        selectedMenu === 'settings' ? 'text-solid-slate-1400 font-bold' : 'text-solid-slate-700'
                    }`}
                >
                    <span className='text-sm'>Settings</span>
                </button>
            </div>
        </div>
    );
};

TraderMobileNavigation.propTypes = {
    selectedMenu: PropTypes.oneOf(['statistics', 'tokens', 'settings']).isRequired,
    onMenuSelect: PropTypes.func.isRequired,
};

export default TraderMobileNavigation;
