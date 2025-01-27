import { useEffect,useState } from 'react';
import { Button, Heading,Text } from '@deriv-com/quill-ui';

const PWAInstallBanner = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [installable, setInstallable] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            document.referrer.includes('android-app://');

        if (isStandalone) {
            console.log('📱 App is already installed');
            return;
        }

        // Handle install prompt ready
        const handleInstallReady = () => {
            console.log('✅ Install prompt ready, showing banner');
            setDeferredPrompt(window.deferredPrompt);
            setInstallable(true);
            setIsVisible(true);
        };

        // Handle successful installation
        const handleInstalled = () => {
            console.log('🎉 PWA was installed');
            setIsVisible(false);
            setInstallable(false);
            setDeferredPrompt(null);
        };

        // Check if we already have a deferred prompt
        if (window.deferredPrompt) {
            handleInstallReady();
        }

        // Listen for custom events from pwa-handler.js
        window.addEventListener('pwaInstallReady', handleInstallReady);
        window.addEventListener('pwaInstalled', handleInstalled);

        return () => {
            window.removeEventListener('pwaInstallReady', handleInstallReady);
            window.removeEventListener('pwaInstalled', handleInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // Show manual installation instructions
            console.log('ℹ️ No install prompt available, showing manual instructions');
            return;
        }

        console.log('📲 Triggering install prompt');
        try {
            // Show the prompt
            await deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`👤 User response to install prompt: ${outcome}`);

            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setIsVisible(false);
                setInstallable(false);
            }
        } catch (error) {
            console.error('❌ Error during installation:', error);
            // Keep the prompt for retry
            setIsVisible(true);
        }
    };

    if (!isVisible) return null;

    return (
        <div className='fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-lg p-5 border border-gray-200 z-50 transition-all duration-300 ease-in-out transform hover:shadow-xl animate-slideIn'>
            <div className='flex items-start gap-4'>
                <div className='flex-1 space-y-3'>
                    <Heading.H4 className='mb-2'>Install Deriv Copy Trading</Heading.H4>
                    <Text className='text-gray-600'>
                        {installable
                            ? 'Get instant access to your trading activities, faster loading times, and a seamless experience!'
                            : 'Add to your home screen for quick access and enhanced features. Open this website in Chrome or Safari for the best experience.'}
                    </Text>
                    <div className='flex gap-3 mt-4'>
                        <Button
                            variant='primary'
                            onClick={handleInstallClick}
                            className='flex-1 md:flex-none px-4 py-3'
                        >
                            {installable ? 'Install Now' : 'Add to Home Screen'}
                        </Button>
                        <Button
                            variant='ghost'
                            onClick={() => setIsVisible(false)}
                            className='flex-1 md:flex-none px-4 py-3'
                        >
                            Maybe Later
                        </Button>
                    </div>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className='text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1'
                    aria-label='Close'
                >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default PWAInstallBanner;
