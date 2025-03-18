# Vaultin  

Vaultin is a web-based, lightweight code editor designed for efficiency and simplicity. Built for developers who need a minimal yet powerful coding environment, Vaultin supports multiple programming languages, syntax highlighting, and real-time collaboration.  

## Features  

- **Multi-Language Support** – Write and edit code in various languages.  
- **Real-Time Collaboration** – Work with multiple users on the same file.  
- **Syntax Highlighting** – Enhanced readability with intelligent formatting.  
- **Auto-Save & Versioning** – Never lose progress with automatic saving.  
- **Minimalist UI** – Focused coding experience with a clean interface.  
- **Containerized Deployment** – Easy setup and scaling with Docker Compose.  

## Prerequisites  

Before running Vaultin, ensure you have:  

- **Docker** (Latest version recommended)  
- **Docker Compose** (For managing multi-container applications)  

## Installation & Setup  

1. **Clone the Repository:**  

   ```bash
   git clone https://github.com/adhvaithprasad/Vaultin.git
   cd Vaultin
   ```

2. **Set Up Environment Variables:**  

   Create a `.env` file in the root directory and define necessary environment variables. Use `.env.example` as a reference.  

3. **Start the Application:**  

   ```bash
   docker-compose up --build
   ```

4. **Access the Editor:**  

   Open `http://localhost:3000` in your browser.  

## Deployment  

For production deployment, use:  

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

## Usage  

- **Create and Open Files** – Start coding instantly in a supported language.  
- **Collaborate in Real-Time** – Work with teammates seamlessly.  
- **Save and Export** – Download your files or sync them with external repositories.  

## Contributing  

We welcome contributions! To contribute:  

1. **Fork the repository.**  
2. **Create a new branch** (`feature-name` or `fix-bug`).  
3. **Make your changes** and commit.  
4. **Submit a pull request** with a detailed description.  

## License  

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.  

