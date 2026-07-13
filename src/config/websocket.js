import { Server } from 'socket.io';

let io = null;

export const initWebSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Yeni bir WebSocket istemcisi bağlandı: ${socket.id}`);

        // Belirli bir ihale odasına katılma (Tender room join)
        socket.on('join_tender', (tenderId) => {
            socket.join(tenderId);
            console.log(`İstemci ${socket.id}, İhale Odasına Katıldı: ${tenderId}`);
        });

        // Belirli bir ihale odasından ayrılma (Tender room leave)
        socket.on('leave_tender', (tenderId) => {
            socket.leave(tenderId);
            console.log(`İstemci ${socket.id}, İhale Odasından Ayrıldı: ${tenderId}`);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 WebSocket istemcisi koptu: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('WebSocket sunucusu henüz ilklendirilmedi!');
    }
    return io;
};
