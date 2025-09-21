import { setupWSConnection } from "y-websocket/bin/utils.js";
import { WebSocketServer } from "ws";
const port = Number(process.env.PORT || 1234);
const wss = new WebSocketServer({ port });
wss.on("connection", (conn, req) => {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const docName = url.searchParams.get("room") || "default";
  setupWSConnection(conn, req, { docName });
});
console.log("Yjs collab server on", port);
