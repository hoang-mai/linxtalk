export { };

declare global {
    interface BaseResponse<T> {
        stats: number;
        message: string;
        data: T;
    }

    interface PageResponse<T> {
        pageSize: number;
        pageNumber: number;
        totalElements: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
        data: T[];
    }

    type ToastType = "success" | "error" | "warning" | "info";

    interface Toast {
        message: string;
        type: ToastType;
    }
}
