# 🧠 ChatGPT Clone – Galaxy AI Trial Task

This project is a ChatGPT clone built as a **trial task for Galaxy AI**.  
It features user authentication, AI chat, persistent message history, message regeneration, file attachments, memory integration, and streaming responses — all in a full-stack app built with **Next.js**, **MongoDB**, **Clerk**, **Cloudinary**, and **Docker**.

---

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router)
- **Database**: MongoDB
- **Authentication**: Clerk
- **AI Integration**: OpenAI
- **Memory**: Mem0 API
- **File Uploads**: Cloudinary
- **DevOps**: Docker,  Docker Compose

---

##  Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/your-username/gpt-clone-app.git
cd gpt-clone-app

# 2. Install dependencies
pnpm install
```
##  Env

 ```bash
MONGODB_URI=
OPENAI_API_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=
MEM0_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

```

## Running with Docker 

 ```bash
docker compose up -d

```
## Fs
.
├── app/                # Next.js App Router
├── components/         # Reusable UI components
├── lib/                # Helpers: OpenAI, Mem0, etc.
├── models/             # Mongoose schemas
├── public/             # Static assets
├── types/             # Types
├── docker-compose.yml
├── Dockerfile
├── .env
└── hooks ...




