const path = require("path");
const git = require("isomorphic-git");
const cors = require("cors");
const fs = require("fs");
const express = require("express");
const http = require("http");
const { exec } = require("child_process");
const { Git: Server } = require("node-git-server");
const app = express();
const server = http.createServer(app);



const corsOptions = {
  origin: "*",
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
async function list(rdir) {
  const dir = path.join(process.cwd(), "assets", rdir);
  const files = await git.listFiles({ fs, dir });
  return files;
}
app.get("/files/:repo", async (req, res) => {
  const repo = req.params.repo;
  try {
    const r = await list(repo);
    res.send({ files: r });
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
async function branchlist(rdir) {
  const dir = path.join(process.cwd(), "assets", rdir);
  const branches = await git.listBranches({ fs, dir });
  return branches;
}
app.get("/branch/:repo", async (req, res) => {
  const repo = req.params.repo;
  try {
    const r = await branchlist(repo);
    res.send({ branches: r });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get commit history
async function commitlist(rdir) {
  const dir = path.join(process.cwd(), "assets", rdir);
  const commits = await git.log({ fs, dir, ref: "HEAD" });
  return commits;
}
app.get("/commits/:repo", async (req, res) => {
  
  const repo = req.params.repo;
  console.log(repo);
  try {
    const r = await commitlist(repo);
    res.send({ commits: r });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
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
async function commit(message, name, email, rdir) {
  const dir = path.join(process.cwd(), "assets", rdir);
  console.log(message, name, email, dir);
  let sha = await git.commit({
    fs,
    dir: dir,
    author: {
      name: name,
      email: email,
    },
    message: message,
  });
  return sha;
}
app.post("/commit", async (req, res) => {
  
  const message = req.body.message;
  const name = req.body.name;
  const email = req.body.email;
  const dir = req.body.dir;
  try {
    const r = await commit(message, name, email, dir);
    res.send({ sha: r });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
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

app.use("/", express.static("static"));
// Git server endpoint
app.use("/git", function (req, res) {
  repos.handle(req, res);
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});