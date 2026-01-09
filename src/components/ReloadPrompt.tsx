// @ts-ignore
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needUpdate: [needUpdate, setNeedUpdate],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error: any) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedUpdate(false);
    };

    if (!offlineReady && !needUpdate) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            <div className="bg-[#1a1a1a] border border-gray-800 p-4 rounded-xl shadow-2xl max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-3">
                    {offlineReady ? (
                        <span className="text-sm font-medium">App ready to work offline</span>
                    ) : (
                        <span className="text-sm font-medium">New version available! Update to get latest features.</span>
                    )}
                </div>
                <div className="flex gap-2">
                    {needUpdate && (
                        <button
                            onClick={() => updateServiceWorker(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                        >
                            Update
                        </button>
                    )}
                    <button
                        onClick={close}
                        className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
