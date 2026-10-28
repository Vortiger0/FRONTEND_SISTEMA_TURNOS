import { io } from "socket.io-client"

//conexion directa al back sin pasar por el proxy de vite (no lo necesita),
//el back ya tiene abierto su cors para este origen
export const socket = io("http://localhost:3000", {
    transports: ["websocket"], //evita el intento de polling por http que la csp bloquea, va directo por websocket
})