import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import webSocketService from '@/services/web-socket';
import { axiosInstance } from '@/services/axios';
import { WEBSOCKET_MAPPING } from '@/constants/api';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/constant';
import {isTokenExpired} from "@/utils/fn-common";

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const connectedToken = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || isTokenExpired(accessToken)) {
      if (webSocketService.isConnected()) {
        webSocketService.disconnect();
      }
      connectedToken.current = null;
      return;
    }

    const shouldReconnect = !webSocketService.isConnected() || connectedToken.current !== accessToken;
    if (!shouldReconnect) return;

    if (webSocketService.isConnected()) {
      webSocketService.disconnect();
    }


    const baseURL = axiosInstance.defaults.baseURL || '';
    const wsProtocol = baseURL.startsWith('https') ? 'wss' : 'ws';
    const host = baseURL.replace(/^https?:\/\//, '');
    const wsURL = `${wsProtocol}://${host}${WEBSOCKET_MAPPING}`;

    webSocketService.initialize(wsURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      beforeConnect: () => {
        const latestAccessToken = useAuthStore.getState().accessToken;
        webSocketService.updateHeaders({
          Authorization: `Bearer ${latestAccessToken}`,
        });
      },
    });
    webSocketService.subscribe('/user/queue/notifications', (data) => {
      if (data.type === 'FRIEND_REQUEST') {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INCOMING_FRIEND_REQUESTS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INCOMING_FRIEND_REQUESTS_SEE_ALL] });
      }
    });
    connectedToken.current = accessToken;


  }, [isAuthenticated, accessToken]);

  return <>{children}</>;
};
