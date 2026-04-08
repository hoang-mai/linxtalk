import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToastStore } from '@/store/toast-store';
import i18n from '@/i18n';
import {MAX_RETRIES} from "@/constants/constant";
import {AxiosRequestConfig} from "axios";
import {axiosInstance} from "@/services/axios";

export interface QueueItem {
    id: string;
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    data?: unknown;
    headers?: Record<string, string>;
    label?: string;
    createdAt: number;
    retryCount: number;
    maxRetries: number;
}

class OfflineQueue {
    private queue: QueueItem[] = [];
    private isProcessing = false;


    async enqueue(item: Omit<QueueItem, 'id' | 'createdAt' | 'retryCount' | 'maxRetries'> & { maxRetries?: number }): Promise<QueueItem> {
        const queueItem: QueueItem = {
            ...item,
            id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            createdAt: Date.now(),
            retryCount: 0,
            maxRetries: item.maxRetries ?? MAX_RETRIES,
        };
        this.queue.push(queueItem);
        return queueItem;
    }

    async processQueue(): Promise<void> {

        if (this.isProcessing || this.queue.length === 0) return;
        this.isProcessing = true;

        console.log(`[OfflineQueue] Processing ${this.queue.length} items...`);

        const itemsToProcess = [...this.queue];
        const failedItems: QueueItem[] = [];

        for (const item of itemsToProcess) {
            try {
                const config: AxiosRequestConfig = {
                    method: item.method,
                    url: item.url,
                    data: item.data,
                    headers: item.headers,
                };
                await axiosInstance.request(config);

                console.log(`[OfflineQueue] ✓ Processed: ${item.method} ${item.url}`);
            } catch (error) {
                item.retryCount++;
                if (item.retryCount < item.maxRetries) {
                    failedItems.push(item);
                    console.warn(`[OfflineQueue] ✗ Failed (retry ${item.retryCount}/${item.maxRetries}): ${item.method} ${item.url}`);
                } else {
                    console.error(`[OfflineQueue] ✗ Dropped (max retries): ${item.method} ${item.url}`);
                }
            }
        }

        this.queue = failedItems;
        this.isProcessing = false;

        if (failedItems.length > 0) {
            console.log(`[OfflineQueue] ${failedItems.length} items remain in queue`);
        } else {
            console.log(`[OfflineQueue] Queue cleared`);
        }
    }
}

export const offlineQueue = new OfflineQueue();
