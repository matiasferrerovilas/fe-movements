/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useKeycloak } from "@react-keycloak/web";

export type EventCallback<T = any> = (payload: T) => void;

interface WebSocketContextProps {
  subscribe: <T = any>(topic: string, callback: EventCallback<T>) => void;
  unsubscribe: (topic: string, callback: EventCallback) => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextProps | undefined>(
  undefined
);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, Set<EventCallback>>>(new Map());
  const activeSubscriptionsRef = useRef<Map<string, any>>(new Map()); // Guarda las suscripciones STOMP
  const { keycloak, initialized } = useKeycloak();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // CRÍTICO: Espera a que Keycloak esté inicializado y autenticado
    if (!initialized || !keycloak.authenticated || !keycloak.token) {
      return;
    }

    const token = keycloak.token;

    const baseUrlOriginal = window.env;
    const baseUrl =
      baseUrlOriginal.backend.websocketUrl != undefined
        ? baseUrlOriginal.backend.websocketUrl
        : "https://movement.eva-core.com";

    console.debug("Iniciando conexión WebSocket a:", baseUrlOriginal);
    const client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws?access_token=${token}`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (str.includes("error") || str.includes("ERROR")) {
          console.error("WS Error:", str);
        }
      },
      onConnect: () => {
        console.debug("✅ WebSocket conectado");
        setIsConnected(true);

        // Re-suscribir a todos los topics guardados
        subscriptionsRef.current.forEach((callbacks, topic) => {
          console.debug(`📡 Re-suscribiendo a ${topic}`);
          const subscription = client.subscribe(topic, (message) => {
            try {
              const payload = JSON.parse(message.body);
              callbacks.forEach((cb) => cb(payload));
            } catch (error) {
              console.error(`Error parseando mensaje de ${topic}:`, error);
            }
          });
          activeSubscriptionsRef.current.set(topic, subscription);
        });
      },
      onDisconnect: () => {
        console.debug("❌ WebSocket desconectado");
        setIsConnected(false);
        activeSubscriptionsRef.current.clear();
      },
      onStompError: (frame) => {
        console.error("❌ Error STOMP:", frame.headers["message"]);
        console.error("Detalles:", frame.body);
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    const activeSubscriptionsSnapshot = activeSubscriptionsRef.current;

    return () => {
      console.debug("🧹 Limpiando WebSocket...");
      if (client.active) {
        client.deactivate();
      }
      clientRef.current = null;
      activeSubscriptionsSnapshot.clear();
      setIsConnected(false);
    };
  }, [keycloak.token, keycloak.authenticated, initialized]);

  const subscribe = <T,>(topic: string, callback: EventCallback<T>) => {
    // Guarda el callback en el mapa de suscripciones
    if (!subscriptionsRef.current.has(topic)) {
      subscriptionsRef.current.set(topic, new Set());
    }
    subscriptionsRef.current.get(topic)!.add(callback);

    // Si el cliente está conectado, suscribe inmediatamente
    if (
      clientRef.current?.connected &&
      !activeSubscriptionsRef.current.has(topic)
    ) {
      console.debug(`📡 Suscribiendo a ${topic}`);
      try {
        const subscription = clientRef.current.subscribe(topic, (message) => {
          try {
            const payload = JSON.parse(message.body);
            subscriptionsRef.current.get(topic)?.forEach((cb) => cb(payload));
          } catch (error) {
            console.error(`Error parseando mensaje de ${topic}:`, error);
          }
        });
        activeSubscriptionsRef.current.set(topic, subscription);
      } catch (error) {
        console.error(`Error suscribiendo a ${topic}:`, error);
      }
    } else {
      console.debug(`⏳ Suscripción a ${topic} pendiente (esperando conexión)`);
    }
  };

  const unsubscribe = (topic: string, callback: EventCallback) => {
    const callbacks = subscriptionsRef.current.get(topic);
    if (callbacks) {
      callbacks.delete(callback);

      // Si no quedan callbacks, desuscribirse del topic completamente
      if (callbacks.size === 0) {
        subscriptionsRef.current.delete(topic);

        const subscription = activeSubscriptionsRef.current.get(topic);
        if (subscription) {
          try {
            subscription.unsubscribe();
            activeSubscriptionsRef.current.delete(topic);
            console.debug(`🔕 Des-suscrito de ${topic}`);
          } catch (error) {
            console.error(`Error des-suscribiendo de ${topic}:`, error);
          }
        }
      }
    }
  };

  return (
    <WebSocketContext.Provider value={{ subscribe, unsubscribe, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context)
    throw new Error("useWebSocket must be used within WebSocketProvider");
  return context;
};
