# Lens

> Mini gallery app where users create albums, upload up to five images, and choose public or private visibility. Public pages let anyone explore albums and images, while the dashboard is for owners to manage their collections.

<p align="center">
  <a href="https://www.linkedin.com/in/bilalabdulhadii/"><img src="https://img.shields.io/badge/Chat-Let's%20chat-darkseagreen?labelColor=gray&style=flat" alt="Chat" /></a>
  <a href="https://www.buymeacoffee.com/bilalabdulhadii"><img src="https://img.shields.io/badge/Donate%20$-Buy%20me%20a%20coffee-darkkhaki?labelColor=gray&style=flat" alt="Donate $" /></a>
  <a href="https://github.com/bilalabdulhadii"><img src="https://img.shields.io/badge/Coding-Work%20Together-cornflowerblue?labelColor=gray&style=flat" alt="Coding" /></a>
</p>

<p align="center">
  <a href="#tech-choice">Tech Choice</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#live-demo">Live Demo</a> •
  <a href="#firebase-rules">Firebase Rules</a> •
  <a href="#installation--setup">Installation & Setup</a> •
  <a href="#email-me">Email Me</a> •
  <a href="#about-me">About Me</a> •
  <a href="#support">Support</a>
</p>

## Tech Choice

Firebase fits this project well: Auth for email sign‑in, Firestore for album data, and Storage for images, all under one SDK. Firestore’s real‑time listeners also make the UI feel instant without extra infrastructure.

---

## Key Features

- **Modern UI/UX:** Clean, glassy cards with smooth transitions and a focused layout.
- **Dark & Light Mode:** Theme toggle with system-aware styles.
- **Public Search:** Simple, real-time search by public album title.
- **Fully Responsive:** Responsive grids and layouts for mobile, tablet, and desktop.
- **Interactive Lightbox:** Zoom, pan, and keyboard navigation for images.
- **Upload Progress:** Per-file progress bars during uploads.
- **Public/Private Albums:** Owner‑only access for private albums, public feed for everyone.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling/UI:** Tailwind CSS + shadcn/ui
- **Backend:** Firebase (Auth, Firestore, Storage)

<a><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg" width="40" height="40"/></a>
<a><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" width="40" height="40"/></a>
<a><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="40" height="40"/></a>
<a><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" width="40" height="40"/></a>
<a><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/firebase/firebase-plain.svg" width="40" height="40"/></a>

---

## Live Demo

1.  **URL**
    - [https://lens.bilalabdulhadi.com](https://lens.bilalabdulhadi.com) You can browse public albums and images, or sign in with the demo user to create, edit, and manage albums.

2.  **Demo User**
    - Name: Lens Demo User
    - Email: demo@lens.app
    - Password: Demo123

---

## Firebase Rules

1. **Firestore (summary):**
    - Users can only read/write their own `users/{uid}` doc.
    - `usernames/{username}`: allow `get`, block `list`, only owner can create/delete.
    - `albums/{albumId}`:
        - Read: public albums for anyone, private only for owner.
        - Create/update: owner only, title required, privacy must be public/private, imagesCount ≤ 5.
        - Delete: owner only.

2. **Storage (summary):**
    - `albums/{albumId}/{fileName}`:
        - Read: public album images for anyone, private only for owner.
        - Write: owner only.

---

## Installation & Setup

Follow these steps to run the project locally:

1.  **Clone the repository**

    ```bash
    git clone https://github.com/bilalabdulhadii/lens-nextjs.git
    cd lens-nextjs
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Create `.env.local` and check `.env.example` for required keys**

    ```bash
    NEXT_PUBLIC_FIREBASE_API_KEY=
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
    NEXT_PUBLIC_FIREBASE_APP_ID=
    ```

4.  **Start the development server**

    ```bash
    npm run dev
    ```

    The app will run at `http://localhost:3000`

---

## Email me

If you liked using this project, or it has helped you in any way, I'd like you email me at <b><a href="bilalabdulhadi88@gmail.com">bilalabdulhadi88@gmail.com</a></b> about anything you'd want to say about this software. I'd really appreciate it!

---

## About me

#Crafting Unique Digital Experiences.

#Let's keep it simple and effective.

---

## Support

<p><a href="https://www.buymeacoffee.com/bilalabdulhadii"> <img align="left" src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="50" width="210" alt="https://www.buymeacoffee.com/bilalabdulhadii" /></a></p><br><br>

---

> WebSite [@bilalabdulhadi.com](https://bilalabdulhadi.com/) &nbsp;&middot;&nbsp;
> GitHub [@bilalabdulhadii](https://github.com/bilalabdulhadii) &nbsp;&middot;&nbsp;
> Linkedin [@bilalabdulhadii](https://www.linkedin.com/in/bilalabdulhadii/)
