import { onlineManager, QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useToastStore } from '@/store/toast-store';
import { offlineQueue } from '@/services/offline-queue';
import { axiosInstance } from '@/services/axios';
import i18n from '@/i18n';

const PERSISTED_QUERY_KEYS: string[] = [
    "profile",
    "incoming-friend-requests",
    "incoming-friend-requests-see-all"
];

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: Infinity,
            networkMode: 'online',
        },
        mutations: {
            networkMode: 'always',
        },
    },
});

export const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
});

export const persistOptions = {
    persister: asyncStoragePersister,
    dehydrateOptions: {
        shouldDehydrateQuery: (query: any) => {
            const queryKey = query.queryKey[0];
            return PERSISTED_QUERY_KEYS.includes(queryKey);
        },
    },
};

let isFirstLoad = true;
let wasOffline = false;

onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
        const isConnected = !!state.isConnected;
        setOnline(isConnected);

        if (!isConnected) {
            wasOffline = true;
            useToastStore.getState().showToast({
                message: i18n.t('errors.noNetwork'),
                type: 'error',
            });
        } else if (!isFirstLoad && wasOffline) {
            wasOffline = false;
            useToastStore.getState().showToast({
                message: i18n.t('errors.networkRestored'),
                type: 'success',
            });

            offlineQueue.processQueue();
        }

        isFirstLoad = false;
    });
});

