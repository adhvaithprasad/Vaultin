const terminal = new Terminal();
const socket = new WebSocket('ws://localhost:3000');
terminal.open(document.getElementById('terminal'));
const fitAddon = new FitAddon.FitAddon();
terminal.loadAddon(fitAddon);
 // Set theme

fitAddon.fit();
 // Adjust terminal size when the window is resized
window.addEventListener('resize', () => {
  fitAddon.fit();
});


terminal.onData(data => {
  socket.send(data);
});

socket.onmessage = (event) => {
  terminal.write(event.data);
};
function clearTerminal() {
    terminal.clear();
  }
const myDiv = document.getElementById('terminal');
const x = document.getElementById("terminal-options");
function terminal_open(){
    myDiv.style.zIndex = 10;
    x.style.display = "flex"; 
}
function terminal_close(){
  myDiv.style.zIndex = -1;
      x.style.display = "none";
}