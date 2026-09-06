// src/test-redis-tcp.ts    
import net from "net";

const socket = net.createConnection({
  host: "172.18.0.4",
  port: 6379,
});

socket.on("connect", () => {
  console.log("TCP CONNECTED");

  setTimeout(() => {
    const command = Buffer.from("*1\r\n$4\r\nPING\r\n", "ascii");

    console.log("SENDING:", JSON.stringify(command.toString()));

    socket.write(command);
  }, 1000);
});

socket.on("data", (data) => {
  console.log("RAW RESPONSE:", JSON.stringify(data.toString()));
});

socket.on("error", (err) => {
  console.log("TCP ERROR:", err.message);
});

socket.on("close", (hadError) => {
  console.log("TCP CLOSE, hadError =", hadError);
});

setTimeout(() => {
  console.log("10 SECOND TIMEOUT");
  socket.destroy();
}, 10000);