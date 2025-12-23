import { Server } from "socket.io";

const connectedUsers = new Map();

export const setupSocket = (server) => {

    const io = new Server(server, {
        cors: {
            origin: [
                "http://localhost:3000",
                "http://192.168.18.12:3000",
                "http://localhost:5173",
                "https://andaleya.pe",
                "https://merchants.andaleya.pe",
                "https://andale.ttutis.com",
                "https://www.andaleya.pe",
                "https://www.merchants.andaleya.pe",
            ],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("⚡ Socket conectado:", socket.id);

        socket.on("registerUser", (userId) => {
            connectedUsers.set(userId, socket.id);
            console.log("🟢 Usuario registrado:", userId, socket.id);
        });

        socket.on("disconnect", () => {
            for (const [userId, sid] of connectedUsers.entries()) {
                if (sid === socket.id) {
                    connectedUsers.delete(userId);
                    break;
                }
            }
            console.log("❌ Socket desconectado:", socket.id);
        });
    });

    return { io, connectedUsers };
};