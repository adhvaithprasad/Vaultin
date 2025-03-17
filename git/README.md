# Git API Server

This is a REST API for managing Git repositories using Node.js, Express, and Git CLI commands. It allows you to clone repositories, list files, view branches and commits, add files, and commit changes.

## ✨ Features
- Clone public repositories
- List repositories in the local `assets/` directory
- View repository files, branches, and commits
- Add and commit files to repositories
- Retrieve file contents

## 🛠️ Requirements
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Git](https://git-scm.com/) installed on the system
- [Docker](https://www.docker.com/) (optional for containerized deployment)

---

## 📦 Installation

Clone the repository:
```sh
git clone https://github.com/yourusername/git-api-server.git
cd git-api-server
```

Install dependencies:
```sh
npm install
```

Start the server:
```sh
node server.js
```

The API will be available at `http://localhost:8000`.

---

## 🐳 Docker Setup (Optional)

To run the API in a **Docker container**:

### 1️⃣ **Build the Docker Image**
```sh
docker build -t git-api .
```

### 2️⃣ **Run the Container**
```sh
docker run -p 8000:8000 -v $(pwd)/assets:/app/assets git-api
```
- `-p 8000:8000` → Maps the container's port 8000 to the host.
- `-v $(pwd)/assets:/app/assets` → Persists repositories outside the container.

---

## 📩 API Endpoints

### 🔹 **1. Clone a Repository**
**POST** `/clone`  
```json
{
  "url": "https://github.com/githubtraining/hellogitworld.git",
  "dir": "hellogitworld"
}
```

### 🔹 **2. List Repositories**
**GET** `/list-repos`

### 🔹 **3. List Files in a Repository**
**GET** `/files/{repo}`

### 🔹 **4. List Branches**
**GET** `/branch/{repo}`

### 🔹 **5. List Commits**
**GET** `/commits/{repo}`

### 🔹 **6. Add a File**
**POST** `/add`
```json
{
  "file": "test.txt",
  "dir": "hellogitworld",
  "content": "Hello Git!"
}
```

### 🔹 **7. Commit Changes**
**POST** `/commit`
```json
{
  "message": "Initial commit",
  "name": "John Doe",
  "email": "john@example.com",
  "dir": "hellogitworld"
}
```

### 🔹 **8. Get File Content**
**GET** `/content/{branch}/{dir}/{file}`  
Example: `/content/main/hellogitworld/dGVzdC50eHQ=`

---

## 📩 Postman Collection

To make API requests easily, import this Postman Collection:  

collection included

---

## 🤝 Contributing
1. Fork the repository  
2. Create a new branch: `git checkout -b feature-branch`  
3. Commit your changes: `git commit -m "Add new feature"`  
4. Push to the branch: `git push origin feature-branch`  
5. Open a pull request  

---

## 📜 License
This project is licensed under the MIT License.

---
🚀 **Happy Coding!**