const path = require("path");
const cors = require("cors");
const fs = require("fs");
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const pty = require("node-pty");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 204, 
};

app.use(cors(corsOptions));
app.use(express.json());



wss.on("connection", (ws) => {
  const shell = pty.spawn("bash", [], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env,
  });

  shell.on("data", (data) => {
    ws.send(data.toString());
  });

  ws.on("message", (msg) => {
    shell.write(msg);
  });
});

const port = process.env.PORT || 3000;

app.use("/editor/:repo", express.static("static"));
app.use("/cdn", express.static("cdn"));
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
