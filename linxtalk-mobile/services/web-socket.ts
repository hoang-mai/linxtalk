import { PrivateMessageRequest } from '@/constants/type';
import { Client, IFrame, IMessage, StompSubscription } from '@stomp/stompjs';

export interface WebSocketConfig {
    headers?: Record<string, string>;
    beforeConnect?: () => void;
}

export type MessageCallback = (data: any) => void;


class WebSocketService {
    private client: Client | null = null;
    private connected: boolean = false;
    private subscriptions: Map<string, MessageCallback> = new Map();
    private activeSubscriptions: Map<string, StompSubscription> = new Map();

    initialize(url: string, config: WebSocketConfig = {}): void {

        this.client = new Client({
            brokerURL: url,
            connectHeaders: config.headers || {},
            forceBinaryWSFrames: true,
            appendMissingNULLonIncoming: true,
            reconnectDelay: 5000,
            heartbeatIncoming: 0,
            heartbeatOutgoing: 10000,

            beforeConnect: () => {
                if (config.beforeConnect) {
                    config.beforeConnect();
                }
            },

            onConnect: (frame: IFrame) => {
                this.connected = true;
                this.resubscribeAll();
            },

            onStompError: (frame: IFrame) => {
            },

            onWebSocketClose: () => {
                this.connected = false;
            },

            onDisconnect: () => {
                this.connected = false;
            },
            debug: url => console.log(url),
        });

        this.client.activate();
    }

    subscribe(destination: string, callback: MessageCallback): StompSubscription | undefined {
        this.subscriptions.set(destination, callback);

        if (this.client && this.connected && !this.activeSubscriptions.has(destination)) {
            const subscription = this.client.subscribe(destination, (message: IMessage) => {
                try {
                    const body = JSON.parse(message.body);
                    callback(body);
                } catch {
                    callback(message.body);
                }
            });

            this.activeSubscriptions.set(destination, subscription);
            return subscription;
        }

        return undefined;
    }

    private resubscribeAll(): void {
        this.activeSubscriptions.forEach(sub => sub.unsubscribe());
        this.activeSubscriptions.clear();
        this.subscriptions.forEach((callback, destination) => {
            if (this.client && this.connected) {
                const subscription = this.client.subscribe(destination, (message: IMessage) => {
                    try {
                        const body = JSON.parse(message.body);
                        callback(body);
                    } catch {
                        callback(message.body);
                    }
                });

                this.activeSubscriptions.set(destination, subscription);
            }
        });
    }

    unsubscribe(destination: string): void {
        const subscription = this.activeSubscriptions.get(destination);
        if (subscription) {
            subscription.unsubscribe();
            this.activeSubscriptions.delete(destination);
        }
        this.subscriptions.delete(destination);
    }

    send(destination: string, body: PrivateMessageRequest): void {
        if (this.client && this.connected) {
            this.client.publish({
                destination: destination,
                body: JSON.stringify(body)
            });
        } else {
            console.warn('WebSocket chưa kết nối, không thể gửi message');
        }
    }

    updateHeaders(headers: Record<string, string>): void {
        if (this.client) {
            this.client.connectHeaders = headers;
        }
    }

    disconnect(): void {
        if (this.client) {
            this.activeSubscriptions.forEach(sub => sub.unsubscribe());
            this.activeSubscriptions.clear();
            this.subscriptions.clear();
            this.client.deactivate();
            this.connected = false;
        }
    }

    isConnected(): boolean {
        return this.connected;
    }
}
const webSocketService = new WebSocketService();
export default webSocketService;