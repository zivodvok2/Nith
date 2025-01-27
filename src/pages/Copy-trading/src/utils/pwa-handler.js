// Initialize PWA installation handling
const initPWAInstall = () => {
    console.log('🚀 Initializing PWA install handler...');

    // Global handler for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', e => {
        console.log('🎯 beforeinstallprompt event captured globally');
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        window.deferredPrompt = e;
        console.log('💾 Install prompt stored for later use');

        // Dispatch custom event for React components
        window.dispatchEvent(new CustomEvent('pwaInstallReady'));
    });

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
        console.log('🎉 PWA successfully installed');
        window.deferredPrompt = null;
        // Dispatch custom event for React components
        window.dispatchEvent(new CustomEvent('pwaInstalled'));
    });
};

// Execute initialization
initPWAInstall();

// Export for module usage
export { initPWAInstall };
