# Apna Khata - Server 🛠️

The robust, modular backend for **Apna Khata**, an advanced personal expense tracker and financial management platform. Built with **Node.js**, **Express**, **TypeScript**, and **Prisma ORM**.

## ✨ Key Features

- **Modular Architecture**: Built using a clean, tiered structure with Controllers, Services, and the Repository Pattern for maximum scalability.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Admin and User roles.
- **Robust Authentication**: Secure JWT-based auth with OTP-based password recovery and email verification.
- **Database Management**: High-performance PostgreSQL database management using **Prisma ORM**.
- **Admin Analytics**: Sophisticated server-side logic for calculating system-wide metrics and user registration trends.
- **Recurring Transactions**: Background processing (Cron) for automated recurring expense management.
- **Production Ready**: Structured logging (Winston), security headers (Helmet), and error tracking (Sentry) integration.
- **Email System**: Transactional email support for welcomes, OTPs, and alerts.

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Security**: [Bcrypt](https://github.com/kelektiv/node.bcrypt.js), [JWT](https://jwt.io/), [Helmet](https://helmetjs.github.io/)
- **Logging**: [Winston](https://github.com/winstonjs/winston)
- **Validation**: [Zod](https://zod.dev/)

## 🚀 Getting Started

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/apnakhata-server.git
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
    npx prisma migrate dev --name init
    npx prisma generate
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🔗 Related Repositories

- [Apna Khata - Frontend Client](https://github.com/your-username/apnakhata-client)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ for human beings.
