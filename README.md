# ⚡️ sk_remult_turso ⚡️

Everything you need to build a great `remult` project, powered by [`create-remult`](https://github.com/remult/remult/tree/main/projects/create-remult).

### What's Included?

- 🚀 [Remult](https://remult.dev/): Fullstack Type-safe CRUD & Realtime 
- 🌟 [SvelteKit](https://kit.svelte.dev/): Your favorite framework/library 
- 💾 [Turso/libSQL](https://www.npmjs.com/package/@libsql/client): Powerful, database system 
- 🔒 [Better-Auth](https://www.better-auth.com/): The most comprehensive authentication framework for TypeScript. 

### 🛠 Prerequisites

Before diving in, make sure you have the following tools installed:

- **Bun (v1.3+ 🚨)**

### 🎯 Installation

Clone the repo:

```bash
git clone [YOUR REPO URL ONCE PUSHED]
```

and install dependencies:

```bash
bun install
```

### 🛠 Configuration & Environment Variables

You'll need to set up some **environment variables** in your `.env` file. 
You can use [.env.example](./.env.example) as an example.


### 🧑‍💻 Running the Dev Environment

Simply run the development server:

```bash
bun run dev
```

### 🚢 Production-Ready

When you're ready to go live, here's how to prepare:

#### Build for production:

```bash
bun --bun run build
```


# TODO

1. Move health endpoint out of api to /healthcheck
2. Protect API so it wont be available from outside the app
3. Reorganize folder structure
4. Add Module to upload files to R2 via Bun's S3 binding
5. Add ability for background jobs/queues
6. Add Module for payments (use Polar.sh SDK)