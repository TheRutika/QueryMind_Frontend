# QueryMind

## Project Info

**Local URL:** http://localhost:8080  
*(Replace with your deployed URL if hosted online)*

QueryMind is a web application that allows users to manage multiple workspaces, connect to databases, and generate SQL queries from natural language inputs.

---

## How to Edit and Run Locally

### Using Your IDE

1. **Clone the repository**  
```sh
git clone <YOUR_GIT_URL>
Navigate to the project directory

sh
Copy code
cd <YOUR_PROJECT_NAME>
Install dependencies

sh
Copy code
npm install
# or
yarn install
Start the development server with hot reload

sh
Copy code
npm run dev
# or
yarn dev
Open your browser at http://localhost:8080 (or the URL Vite provides).

Editing Files Directly on GitHub
Navigate to the file you want to edit.

Click the "Edit" button (pencil icon) at the top right.

Make your changes and commit them directly.

Using GitHub Codespaces
Go to the main page of your repository.

Click the green Code button → Codespaces tab.

Click New codespace to launch a development environment.

Edit files, commit, and push changes directly from Codespaces.

Technologies Used
Vite – Frontend build tool

React – UI library

Tailwind CSS – Styling framework

shadcn-ui – Prebuilt UI components

TypeScript – Optional type safety

Project Structure
bash
Copy code
/src          – Source code
  /pages      – React pages (Index, Auth, Workspace)
  /components – Reusable components (Sidebar, Toasts, Modals)
/public       – Static assets (index.html)
Deployment
You can deploy QueryMind to any static hosting service like Vercel, Netlify, or your own server.

Build the project

sh
Copy code
npm run build
# or
yarn build
Deploy the dist/ folder to your hosting service.

Custom Domain
Follow your hosting provider's documentation to configure a custom domain if needed.
