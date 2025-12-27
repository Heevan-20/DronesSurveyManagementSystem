import express from "express";
import http from "http";
import { Server } from "socket.io";
import routes from "./routes.js";
import cors from "cors"

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors())
app.use(express.json());
app.use("/api", routes);

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});


// make io available inside routes
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

server.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});
