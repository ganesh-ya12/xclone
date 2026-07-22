# Social Connection Platform

A full-stack social platform where users can register, authenticate, and share posts with likes and comments. I built it as a hands-on project to learn **TypeScript** and **PostgreSQL** end to end — modelling relational data with Drizzle ORM, writing a typed Express API, and wiring it up to a React frontend.

## What I set out to learn

- **TypeScript** on the backend — typed Express routes, controllers, and a typed data layer instead of plain JavaScript.
- **PostgreSQL** — relational schema design (users, posts, likes, comments), foreign keys, and migrations.
- **Drizzle ORM** — defining schema in code, generating SQL migrations, and running type-safe queries.
- **Auth** — issuing and verifying JSON Web Tokens (JWT) and hashing passwords.
- **Containerisation** — running the app and Redis with Docker Compose for dev and prod.

## Features

- User registration and JWT-based authentication
- Create, edit, and delete posts
- Like / unlike posts and see who liked a post ("liked by")
- Comment on posts
- Change password

## Tech stack

- **Backend**: [Node.js](https://nodejs.org/en), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Cache**: [Redis](https://redis.io/)
- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Auth**: JSON Web Tokens (JWT)
- **Infra**: [Docker Compose](https://docs.docker.com/compose/)

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/en)
- [PostgreSQL](https://www.postgresql.org/download/)
- (Optional) [Docker](https://www.docker.com/) if you prefer to run via Compose

### 1. Clone the repository

```bash
git clone https://github.com/ganesh-ya12/social-connection-platform.git
cd social-connection-platform
```

### 2. Run the backend

```bash
cd server
npm install
```

Create a `.env` file in `server/` with your database connection and JWT secret (see `.env.development` for the expected variables).

Generate and apply the database schema:

```bash
npm run db:generate   # generate SQL migrations from the Drizzle schema
npm run db:migrate    # apply migrations to your PostgreSQL database
```

Start the server:

```bash
npm start
```

### 3. Run the frontend

```bash
cd client
npm install
npm run dev
```

### Running with Docker (optional)

```bash
cd server
docker compose -f docker-compose.dev.yml up --build
```

## Contact

Questions or feedback? Find me on GitHub — [Ganesh](https://github.com/ganesh-ya12).
