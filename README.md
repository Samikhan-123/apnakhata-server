# Apna Khata - Server 🛠️

The robust, enterprise-grade backend for **Apna Khata**, configured for high-security financial tracking and autonomous system maintenance. Built with **Node.js**, **Express**, **TypeScript**, and **Prisma ORM**.

**Live Platform**: [apnakhata.online](https://apnakhata.online)

## ✨ Key Features

- **Zero-Trust Administrative Hardening**: Comprehensive security guards preventing administrative self-lockout, self-deletion, and unauthorized role elevation. 
- **Tiered Role-Based Access Control (RBAC)**:
  - **ADMIN**: Full system control, infrastructure management, and secure auditing.
  - **MODERATOR**: Staff-level access for user verification and account status management.
  - **USER**: Individual financial management and secure data ownership.
- **30-Day Account Deletion Lifecycle**: Implements a secure "Soft-Delete" observation period for account removals, allowing users to cancel deletion requests within a 30-day grace period before permanent erasure.
- **Autonomous Maintenance Engine**: Serverless-compatible background task architecture for daily automated cleanup of expired accounts and 90-day-old administrative logs.
- **Strategic Auditing**: A high-fidelity `AdminLog` system tracking every administrative action, from status changes to bulk operations, with humanized action identifiers.
- **Modular Data Architecture**: Built with the **Service Pattern** and **Prisma ORM** for Type-Safe database operations and high-performance querying.
- **Modern Authentication**: Secure session management featuring Google OAuth integration, JWT-based security, and OTP-led password recovery.
- **Financial Intelligence API**: Specialized endpoints for calculating platform-wide interaction metrics and financial liquidity trends.

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL (Supabase)](https://www.postgresql.org/)
- **Security Logic**: [Zod](https://zod.dev/) Validation & Custom RBAC Middleware
- **Deployment**: Optimized for **Vercel Serverless Functions**
- **Logging**: Structured Winston logging with Sentry integration

## 🚀 Getting Started

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Samikhan-123/apnakhata-server.git
    cd apnakhata-server
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**:
    Create a `.env` file based on `.env.example`:
    ```bash
    cp .env.example .env
    ```

4.  **Database Migration**:
    ```bash
    npx prisma migrate dev
    npx prisma generate
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🔗 Ecosystem

- [Apna Khata - Frontend Client](https://github.com/Samikhan-123/apnakhata-client)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ for human beings.
