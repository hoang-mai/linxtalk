import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/auth-store';
import { isTokenExpired } from '@/utils/fn-common';
import { useAccountStore } from '@/store/account-store';
import { AUTH } from '@/constants/api';
import { useLanguageStore } from '@/store/language-store';

const axiosInstance = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://10.145.54.187:8080',
    headers: {
        'Content-Type': 'application/json',
        'Accept-Language': useLanguageStore.getState().language,
    },
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
        throw new Error('No refresh token');
    }

    const res = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}${AUTH}/refresh-token`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
    );

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data.data;
    useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
    return newAccessToken;
};

axiosInstance.interceptors.request.use(
    async (config) => {
        const { accessToken, refreshToken } = useAuthStore.getState();

        if (accessToken && isTokenExpired(accessToken) && refreshToken) {
            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = refreshAccessToken()
                    .catch((error) => {
                        useAuthStore.getState().logout();
                        useAccountStore.getState().clearAccount();
                        throw error;
                    })
                    .finally(() => {
                        isRefreshing = false;
                        refreshPromise = null;
                    });
            }

            try {
                const newToken = await refreshPromise!;
                config.headers.Authorization = `Bearer ${newToken}`;
            } catch (error) {
                return Promise.reject(error);
            }
        } else if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        return Promise.reject(error.response?.data || error);
    }
);

const get = <T,>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.get<T>(url, config);
};

const post = <T,>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.post<T>(url, data, config);
};

const patch = <T,>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.patch<T>(url, data, config);
};

const put = <T,>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.put<T>(url, data, config);
};

const del = <T,>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.delete<T>(url, config);
};

export { get, post, patch, put, del };
