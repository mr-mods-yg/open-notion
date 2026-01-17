# Open Notion

Open Notion is a powerful and flexible note-taking and workspace application. It provides a collaborative environment for organizing thoughts, projects, and information with a rich text editor, secure authentication, and a structured dashboard.

## Technologies

This project is built using the following modern web technologies:

-   **Next.js 16**: React framework for production.
-   **React 19**: Library for building user interfaces.
-   **Prisma**: Next-generation ORM for Node.js and TypeScript.
-   **PostgreSQL**: Robust relational database system.
-   **Better Auth**: Authentication library for secure user management.
-   **Tailwind CSS 4**: Utility-first CSS framework for styling.
-   **Tanstack Query**: Powerful asynchronous state management.
-   **Shadcn/ui**: styled, accessible components for building high-quality design systems.
-   **Lucide React**: Beautiful and consistent icon library.

## Features

-   **User Authentication**: Secure login and signup flows using Better Auth (includes Google OAuth support).
-   **Personal Workspaces**: Create and manage private workspaces for different contexts. Currently only one workspace is allowed.
-   **Responsive Design**: Optimized for various screen sizes.
-   **Database Integration**: Efficient data handling with Prisma and PostgreSQL.
-   **Modern UI**: Clean and accessible user interface built with shadcn/ui and Tailwind CSS.

## Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

Ensure you have the following installed:

-   Node.js (Latest LTS version recommended)
-   npm, yarn, pnpm, or bun
-   PostgreSQL

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/open-notion.git
    cd open-notion
    
2. Install dependencies:

    ```bash
    npm install
    ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add the following variables. You can reference `.env.example`.

    ```env
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret

    BETTER_AUTH_SECRET=your_generated_secret_string
    BETTER_AUTH_URL=http://localhost:3700

    DATABASE_URL="postgresql://user:password@localhost:5432/open_notion_db"
    ```

4. Setup Database:
   Generate the Prisma client and apply migrations to your database.

    ```bash
    npx prisma migrate dev
    ```

5. Run the Application:
   Start the development server.

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3700`.

## Contributing

Contributions are welcome. Please feel free to fork the repository, make changes, and submit a pull request.
