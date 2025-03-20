const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const http = require("http");
const WebSocket = require("ws");
const pty = require("node-pty");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
app.use(cors());
app.use(express.json());
const BASE_DIR = path.resolve("/app/code"); // 🔥 Always start inside `/code`

if (!fs.existsSync(BASE_DIR)) {
  fs.mkdirSync(BASE_DIR, { recursive: true });
  console.log(`📂 Created base directory: ${BASE_DIR}`);
}

// Serve static files
app.use("/cdn", express.static(path.join(__dirname, "cdn")));
app.use("/editor", express.static(path.join(__dirname, "static")));
app.get("/editor/*", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});


/* ================================
   🔹 WebSocket Interactive Terminal
   ================================= */
wss.on("connection", async (ws, req) => {
  const queryParams = new URLSearchParams(req.url.replace(/^\/ws\?/, ""));
  const repoName = queryParams.get("repo");

  console.log(`🔍 New WebSocket connection: ${req.url}`);
  console.log(`📌 Extracted repo name: ${repoName}`);

  if (!repoName) {
    console.error(`❌ ERROR: No repository name provided.`);
    ws.send("Error: No repository specified.");
    ws.close();
    return;
  }

  const repoPath = path.join(BASE_DIR, repoName);
  try{
    await setupRepoFiles(repoName, repoPath);
    console.log(`✅ Files for ${repoName} downloaded successfully.`);
  }catch(error){
    console.error(`❌ Failed to fetch repo files: ${error.message}`);
      ws.send(`Error: Failed to fetch repo ${repoName}`);
      ws.close();
      return;
  }
  // if (!fs.existsSync(repoPath)) {
  //   console.log(`🛠️ Cloning files for repo: ${repoName}`);
  //   try {
  //     await setupRepoFiles(repoName, repoPath);
  //     console.log(`✅ Files for ${repoName} downloaded successfully.`);
  //   } catch (error) {
  //     console.error(`❌ Failed to fetch repo files: ${error.message}`);
  //     ws.send(`Error: Failed to fetch repo ${repoName}`);
  //     ws.close();
  //     return;
  //   }
  // } else {
  //   console.log(`✅ Repo files already exist: ${repoPath}`);
  // }

  console.log(`🖥️ Starting terminal inside: ${repoPath}`);

  const shell = pty.spawn("bash", ["-c", `cd "${repoPath}" && exec bash --login`], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: repoPath,
    env: {
      ...process.env,
      PWD: repoPath,
      HOME: repoPath,
    },
  });

  shell.on("data", (data) => ws.send(data.toString()));
  ws.on("message", (msg) => shell.write(msg));
  ws.on("close", () => console.log(`❌ Terminal session closed for: ${repoName}`));
});

/* ================================
   🔹 Fetch Repo Files & Save Locally
   ================================= */
   async function setupRepoFiles(repoDir) {
    try {
        const repoPath = path.join("/app/code", repoDir);

        // Ensure the repo directory exists
        fs.mkdirSync(repoPath, { recursive: true });

        // Fetch the list of files
        const filesResponse = await axios.get(`http://git-server-container1:8000/files/${repoDir}`);

        if (!filesResponse.data || !Array.isArray(filesResponse.data.files)) {
            console.error("❌ Invalid response for file list:", filesResponse.data);
            return;
        }

        const files = filesResponse.data.files;

        console.log(`📂 Found ${files.length} files for ${repoDir}. Downloading...`);

        for (const file of files) {
            try {
                // Encode filename in Base64
                const encodedFile = Buffer.from(file).toString("base64");

                // Fetch file content
                const fileResponse = await axios.get(`http://git-server-container1:8000/content/main/${repoDir}/${encodedFile}`);

                // Ensure response contains the expected data
                if (!fileResponse.data || typeof fileResponse.data.value !== "string") {
                    console.error(`❌ Invalid response for file: ${file}`);
                    continue;
                }

                const filePath = path.join(repoPath, file);

                // Ensure the directory exists before writing the file
                fs.mkdirSync(path.dirname(filePath), { recursive: true });

                // Write the file
                fs.writeFileSync(filePath, fileResponse.data.value);
                console.log(`✅ Downloaded: ${file}`);
            } catch (fileError) {
                console.error(`❌ Failed to download file: ${file}`, fileError.message);
            }
        }

        console.log(`✅ Files for ${repoDir} downloaded successfully.`);
    } catch (error) {
        console.error(`❌ Failed to fetch repo files:`, error.message);
    }
}
  
app.get("/content/:repoDir/:file", async (req, res) => {
  try {
      
      const repoDir = req.params.repoDir;
      const dirPath = path.join("/app/code", repoDir);
      const file  = atob(req.params.file);
      const filePath = path.join(dirPath, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      res.send({ value: fileContent });
  } catch (err) {
      console.error(err);
      res.status(400).send("Invalid Request");
  }
});

app.post("/content/:repoDir/:file", async (req, res) => {
  try {
      const repoDir = req.params.repoDir;
      const dirPath = path.join("/app/code", repoDir);

      console.log("repoDir:", repoDir);
      console.log("Raw file param:", req.params.file);

      // Decode Base64 file name
      let file;
      try {
          file = Buffer.from(req.params.file, 'base64').toString('utf8');
      } catch (decodeErr) {
          console.error("Base64 decoding failed:", decodeErr);
          return res.status(400).send("Invalid file encoding");
      }

      console.log("Decoded file name:", file);
      const filePath = path.join(dirPath, file);
      console.log("Final file path:", filePath);

      // ✅ FIX: Use fs.mkdir with a callback
      fs.mkdir(dirPath, { recursive: true }, (err) => {
          if (err) {
              console.error("Directory creation failed:", err);
              return res.status(500).send("Failed to create directory");
          }

          // Check if request body has valid content
          if (!req.body || typeof req.body.content !== 'string') {
              console.error("Invalid request body:", req.body);
              return res.status(400).send("Invalid request body");
          }

          // Write content to file
          fs.writeFile(filePath, req.body.content, 'utf8', (writeErr) => {
              if (writeErr) {
                  console.error("File writing failed:", writeErr);
                  return res.status(500).send("Failed to write file");
              }

              console.log('File written successfully');
              res.status(200).send("File written successfully");
          });
      });

  } catch (err) {
      console.error("Unhandled error:", err);
      res.status(400).send("Invalid Request");
  }
});




const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`🚀 Server running on port ${port}`));
