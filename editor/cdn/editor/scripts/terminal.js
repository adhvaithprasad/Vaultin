const terminal = new Terminal();
const fitAddon = new FitAddon.FitAddon();
terminal.loadAddon(fitAddon);

let socket;
let reconnectTimeout;
let isReconnecting = false;


function connectWebSocket() {
  if (isReconnecting) return;
  isReconnecting = true;

  console.log("🔄 Connecting to WebSocket...");
  socket = new WebSocket(`ws://${window.location.host}/code/ws?repo=${repoName}`);

  socket.onopen = () => {
    console.log("✅ WebSocket connected");
    isReconnecting = false;
    clearTimeout(reconnectTimeout);
  };

  socket.onmessage = (event) => {
    terminal.write(event.data);
  };

  socket.onclose = () => {
    console.log("❌ WebSocket disconnected, attempting to reconnect...");
    if (!isReconnecting) {
      reconnectTimeout = setTimeout(connectWebSocket, 2000); // Retry after 2s
    }
  };

  socket.onerror = (error) => {
    console.error("⚠️ WebSocket error:", error);
    socket.close();
  };
}

// Open and fit the terminal
terminal.open(document.getElementById("terminal"));
fitAddon.fit();

// Resize terminal on window resize
window.addEventListener("resize", () => fitAddon.fit());

// Send terminal input to the WebSocket
terminal.onData((data) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(data);
  }
});

// **Reconnect WebSocket when the tab regains focus**
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && (!socket || socket.readyState !== WebSocket.OPEN)) {
    console.log("🔄 Reconnecting WebSocket...");
    connectWebSocket();
  }
});

// Initialize WebSocket connection
connectWebSocket();

// Clear terminal function
function clearTerminal() {
  terminal.clear();
}

// UI controls for showing/hiding the terminal
const myDiv = document.getElementById("terminal");
const x = document.getElementById("terminal-options");

function terminal_open() {
  myDiv.style.zIndex = 10;
  x.style.display = "flex";
}

function terminal_close() {
  myDiv.style.zIndex = -1;
  x.style.display = "none";
}
