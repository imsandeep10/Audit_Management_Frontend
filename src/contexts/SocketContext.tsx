import io from "socket.io-client";
import { createContext, useContext, useEffect, useState } from "react";

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType | undefined>({
    socket: null,
    isConnected: false,
});

export const SocketProvider = ({children} : {children: React.ReactNode}) => {
    const [socket, setSocket] = useState<any | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() =>  {
        const socketInstance = io(import.meta.env.VITE_API_BASE_URL, {
            autoConnect: true,
        });

        socketInstance.on("connect", () => {
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};