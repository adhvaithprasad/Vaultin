const path = require("path");
const cors = require("cors");
const fs = require("fs");
const express = require("express");
const http = require("http");
const { exec } = require("child_process");
const { Git: Server } = require("node-git-server");

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: "http://localhost:8000/",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

const repos = new Server(path.resolve(__dirname, "assets"), {
  autoCreate: true,
});

const port = process.env.PORT || 8000;

// Clone repository using child_process.exec
async function cloneRepo(dir, url) {
  return new Promise((resolve, reject) => {
    const repoPath = path.join(process.cwd(), "assets", dir);
    console.log(`Cloning ${url} into ${repoPath}...`);

    exec(`git clone ${url} ${repoPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Clone failed: ${stderr}`);
        return reject(stderr);
      }
      console.log(`Clone completed: ${stdout}`);
      resolve(stdout);
    });
  });
}

// API route to clone a repo
app.post("/clone", async (req, res) => {
  const { url, dir } = req.body;
  if (!url || !dir) {
    return res.status(400).json({ error: "Missing required parameters: url, dir" });
  }
  try {
    const output = await cloneRepo(dir, url);
    res.json({ message: `Cloned to assets/${dir}`, output });
  } catch (error) {
    res.status(500).json({ error: `Clone failed: ${error}` });
  }
});

// List files in a repository
app.get("/files/:repo", async (req, res) => {
  const repo = req.params.repo;
  try {
    const dir = path.join(process.cwd(), "assets", repo);
    const files = fs.readdirSync(dir);
    res.send({ files });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// List repositories inside 'assets' directory
app.get("/list-repos", async (req, res) => {
  try {
    const repoDir = path.join(process.cwd(), "assets");
    const repoList = fs.readdirSync(repoDir).filter((repo) => fs.statSync(path.join(repoDir, repo)).isDirectory());
    res.json({ repos: repoList });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get repository branches
app.get("/branch/:repo", async (req, res) => {
  const repo = req.params.repo;
  const repoPath = path.join(process.cwd(), "assets", repo);
  exec(`git -C ${repoPath} branch`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error fetching branches: ${stderr}`);
      return res.status(500).json({ error: "Error fetching branches" });
    }
    res.json({ branches: stdout.trim().split("\n").map((b) => b.trim()) });
  });
});

// Get commit history
app.get("/commits/:repo", async (req, res) => {
  const repo = req.params.repo;
  const repoPath = path.join(process.cwd(), "assets", repo);
  exec(`git -C ${repoPath} log --oneline`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error fetching commits: ${stderr}`);
      return res.status(500).json({ error: "Error fetching commits" });
    }
    res.json({ commits: stdout.trim().split("\n") });
  });
});

// Add a file to the repository
app.post("/add", async (req, res) => {
  const { file, dir, content } = req.body;
  if (!file || !dir || !content) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const filePath = path.join(process.cwd(), "assets", dir, file);
  fs.writeFileSync(filePath, content, "utf-8");

  exec(`git -C ${path.join(process.cwd(), "assets", dir)} add ${file}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error adding file: ${stderr}`);
      return res.status(500).json({ error: "Error adding file" });
    }
    res.json({ message: `File ${file} added` });
  });
});

// Commit changes
app.post("/commit", async (req, res) => {
  const { message, name, email, dir } = req.body;
  if (!message || !name || !email || !dir) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const repoPath = path.join(process.cwd(), "assets", dir);
  exec(
    `git -C ${repoPath} commit -m "${message}" --author="${name} <${email}>"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error committing: ${stderr}`);
        return res.status(500).json({ error: "Error committing" });
      }
      res.json({ message: `Committed changes: ${message}`, output: stdout });
    }
  );
});

// Get file content from a repository
app.get("/content/:branch/:dir/:file", async (req, res) => {
  const file = atob(req.params.file);
  const rdir = req.params.dir;
  const repoPath = path.join(process.cwd(), "assets", rdir);

  fs.readFile(path.join(repoPath, file), "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
    res.send({ value: data });
  });
});

// Git server endpoint
app.use("/git", function (req, res) {
  repos.handle(req, res);
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});