import i18n from "@/i18n";

export class OfflineError extends Error {
    constructor() {
        super(i18n.t('errors.noNetwork'));
        this.name = 'OfflineError';
    }
}

export class QueuedError extends Error {
    constructor() {
        super();
        this.name = 'QueuedError';
    }
}