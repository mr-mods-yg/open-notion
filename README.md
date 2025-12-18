# Open Notion

Open Notion is a powerful and flexible note-taking and workspace application, inspired by Notion. It provides a collaborative environment for organizing your thoughts, projects, and information with a rich text editor, user authentication, and a structured dashboard.

## ✨ Features

*   **User Authentication**: Secure user login and registration powered by NextAuth.js.
*   **Personal Workspaces**: Create and manage your own private workspaces.
*   **Rich Text Editor**: A custom text editor for creating detailed and organized notes.
*   **Dashboard**: A personalized dashboard to manage your notes and projects.
*   **Database Integration**: Robust data management using Prisma and PostgreSQL.

## 🚀 Getting Started

Follow these instructions to set up and run Open Notion on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
*   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/) or [Bun](https://bun.sh/)
*   [PostgreSQL](https://www.postgresql.org/) database

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/open-notion.git
    cd open-notion
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Environment Variables**:

    Create a `.env` file in the root of the project based on `.env.example` (if available, otherwise create it with the following):

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/open_notion_db"
    NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET"
    NEXTAUTH_URL="http://localhost:3000"
    ```

    *   Replace `"postgresql://user:password@localhost:5432/open_notion_db"` with your PostgreSQL connection string.
    *   Generate a strong secret for `NEXTAUTH_SECRET`. You can use `openssl rand -base64 32` in your terminal.

4.  **Database Setup**:

    Run Prisma migrations to set up your database schema:

    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Run the development server**:

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The page auto-updates as you edit the files.


## 🛠 Technologies Used

*   [Next.js](https://nextjs.org/) - React framework for production
*   [React](https://react.dev/) - Frontend library
*   [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
*   [Prisma](https://www.prisma.io/) - Next-generation ORM
*   [PostgreSQL](https://www.postgresql.org/) - Relational database
*   [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
*   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
*   [Shadcn UI](https://ui.shadcn.com/) - Reusable components

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
