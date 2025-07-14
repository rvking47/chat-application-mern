
import { io } from "socket.io-client";

const ENDPOINT = "http://localhost:5000"; // update for production if needed
const socket = io(ENDPOINT);

export default socket;
