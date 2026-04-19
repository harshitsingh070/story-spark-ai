<div align="center">
<h1>👩‍💻 StorySparkAI is an open-source platform designed for creative minds to generate and share multiple story variations from a single prompt. Perfect for writers, creators, and enthusiasts exploring AI-powered storytelling!</h1>
</div>

<p align="center">
   <a href="https://github.com/ronisarkarexe/story-spark-ai/blob/master/LICENSE" target="blank">
   <img src="https://img.shields.io/github/license/ronisarkarexe/story-spark-ai?style=for-the-badge&logo=appveyor" alt="License" />
   </a>
   <a href="https://github.com/ronisarkarexe/story-spark-ai/fork" target="blank">
   <img src="https://img.shields.io/github/forks/ronisarkarexe/story-spark-ai?style=for-the-badge&logo=appveyor" alt="Forks"/>
   </a>
   <a href="https://github.com/ronisarkarexe/story-spark-ai/stargazers" target="blank">
   <img src="https://img.shields.io/github/stars/ronisarkarexe/story-spark-ai?style=for-the-badge&logo=appveyor" alt="Star"/>
   </a>
   <a href="https://github.com/ronisarkarexe/story-spark-ai/issues" target="blank">
   <img src="https://img.shields.io/github/issues/ronisarkarexe/story-spark-ai.svg?style=for-the-badge&logo=appveyor" alt="Click Vote Issue"/>
   </a>
   <a href="https://github.com/ronisarkarexe/story-spark-ai/pulls" target="blank">
   <img src="https://img.shields.io/github/issues-pr/ronisarkarexe/story-spark-ai.svg?style=for-the-badge&logo=appveyor" alt="Click Vote Open Pull Request"/>
   </a>
</p>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [About 🚀](#about-)
- [Features 💪](#features-)
- [Prerequisites](#prerequisites)
- [How to Install Git](#how-to-install-git)
- [How to Install Node.js and npm](#how-to-install-nodejs-and-npm)
- [Local development (monorepo)](#local-development-monorepo)
- [Contributing 👨‍💻](#contributing-)
- [Contributors 🤝](#contributors-)
- [License](#license)
- [Support 🙏](#support-)

<a id="about"></a>

## About 🚀

- story-spark-ai - [Website](https://storysparkai.vercel.app/)
- **`StorySparkAi`** is an open-source project designed to generate and showcase AI-created stories based on user prompts in a simple, engaging way.
- With **`StorySparkAi`**, users can input a prompt and explore multiple story variations, edit them, and publish their favorites for others to read and enjoy.

<a id="features"></a>

## Features 💪

- One of the key features of **`StorySparkAi`** is its powerful search functionality.
- Users can search for developers based on specific skills, making it easy to find issues with expertise in a particular technology or programming language.
- This makes **`StorySparkAi`** a valuable resource for project managers, showcase and anyone looking to connect with skilled developers for collaboration or employment opportunities.

<a id="prerequisites"></a>

### Prerequisites

- A GitHub account
- Git installed on your local development environment
- Node Package Manager (npm) installed on your local development environment

### How to Install Git

Git is a version control system that is used to manage the source code of your project.

To install Git, follow these steps:

1. Download and install Git from the [Official Website](https://git-scm.com/downloads)
2. Open the terminal or command prompt on your local development environment
3. Verify the installation of Git by running the following command:

   ```bash
   git --version
   ```

### How to Install Node.js and npm

Node.js is a JavaScript runtime environment that allows you to run JavaScript code outside of a web browser. npm (Node Package Manager) is a package manager for JavaScript, essential for managing dependencies in Node.js projects. Here's how to install Node.js and npm:

1. **Download Node.js:**

   - Visit the [official Node.js website](https://nodejs.org/en/download/) and download the appropriate installer for your operating system (Windows, macOS, or Linux).
   - Choose the LTS (Long Term Support) version for stable releases or the latest version for cutting-edge features.
   - Follow the installation instructions provided by the installer.

2. **Verify Node.js Installation:**

   - After the installation is complete, open your terminal or command prompt.
   - To verify that Node.js has been installed successfully, type the following command and press Enter:

     ```
     node -v
     ```

   - This command should display the version of Node.js installed on your system. If it does, Node.js installation was successful.

3. **Verify npm Installation:**

   - npm comes bundled with Node.js, so once Node.js is installed, npm is automatically installed as well.
   - To confirm that npm is installed, in your terminal or command prompt, type:

     ```
     npm -v
     ```

   - Press Enter. This command should display the version of npm installed on your system. If it does, npm installation was successful.

4. **Optional: Update npm (recommended):**

   - It's recommended to keep npm up to date to access the latest features and bug fixes.
   - To update npm to the latest version, type the following command and press Enter:

     ```
     npm install -g npm@latest
     ```

   - This command will update npm to the latest stable version globally (-g flag).

By following these steps, you have successfully installed Node.js and npm on your system. You are now ready to start building JavaScript applications and managing dependencies with npm.

### Local development (monorepo)

**Prerequisites:** Node.js **18.18+** (see `.nvmrc` for a suggested major version), npm **9+**, MongoDB URI for the API.

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your-github-username>/story-spark-ai.git
   cd story-spark-ai
   ```

2. **Install dependencies** (single install at the repo root — npm workspaces)

   ```bash
   npm install
   ```

3. **Environment files**

   - Copy `backend/.env.example` → `backend/.env` and fill all values your deployment needs (database, JWT secrets, AI keys, email, etc.).
   - Copy `frontend/.env.example` → `frontend/.env` and set `VITE_BASE_URL` to your API base URL (e.g. `http://localhost:5000/api/v1` when the backend runs on port 5000). Optionally set `VITE_SOCKET_URL` for notifications.

4. **Run apps**

   - **Both** (two terminals or one combined process):

     ```bash
     npm run dev
     ```

   - **Backend only:** `npm run dev:backend` — API (default port **5000** if `PORT` is unset).
   - **Frontend only:** `npm run dev:frontend` — Vite dev server on **http://localhost:4001**

5. **Production builds**

   ```bash
   npm run build
   npm run start:backend    # requires `npm run build:backend` first
   npm run start:frontend   # serves built static app (preview)
   ```

**Git:** Use a **single** repository root (one `.git` folder). Do not nest another `.git` inside `frontend/` or `backend/`.

### Contributing workflow

1. Fork the repository and clone your fork.
2. Create a branch: `git checkout -b your-feature-branch`
3. Install with `npm install` at the repo root, make changes, then `git add`, `git commit`, `git push`, and open a pull request.


<a id="contributing"></a>

## Contributing 👨‍💻

Contributions make the open source community such an amazing place to learn, inspire, and create. <br>
**Any contributions you make are truly appreciated!**

<a id="contributors"></a>

## Contributors 🤝

<a href="https://github.com/ronisarkarexe/story-spark-ai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ronisarkarexe/story-spark-ai" />
</a>

<a id="license"></a>

## License

<table>
  <tr>
     <td>
       <p align="center"> <img src="https://github.com/malivinayak/malivinayak/blob/main/LICENSE-Logo/MIT.png?raw=true" width="80%"></img>
    </td>
    <td> 
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg"/> <br> 
         This project is licensed under <a href="./LICENSE">MIT</a>. <img width=2300/>
    </td>
  </tr>
</table>

<a id="support"></a>

## Support 🙏

Thank you for contributing to our open-source project! We appreciate your support 🚀 <br>
Don't forget to leave a star ⭐
