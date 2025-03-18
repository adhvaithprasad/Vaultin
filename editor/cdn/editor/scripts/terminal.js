const terminal = new Terminal();
const fitAddon = new FitAddon.FitAddon();
terminal.loadAddon(fitAddon);
 // Change this dynamically if needed
const socket = new WebSocket(`ws://localhost:3000/?repo=${repoName}`);

terminal.open(document.getElementById("terminal"));
fitAddon.fit();

window.addEventListener("resize", () => fitAddon.fit());

terminal.onData((data) => {
  socket.send(data);
});

socket.onmessage = (event) => {
  terminal.write(event.data);
};

function clearTerminal() {
  terminal.clear();
}

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
