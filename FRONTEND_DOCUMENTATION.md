# Sortix AI Frontend Documentation

Welcome to the frontend documentation for **Sortix AI**, a premium RAG-powered chat application. This documentation provides a comprehensive overview of the architecture, technology stack, and component structure.

## 🚀 Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: 
  - [Tailwind CSS 4](https://tailwindcss.com/)
  - [Lucide React](https://lucide.dev/) (Icons)
  - Custom Typography: *Playfair Display* (Serif) & *DM Sans* (Sans-serif)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **API Communication**: [Axios](https://axios-http.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Customized)
- **Markdown Rendering**: [React Markdown](https://github.com/remarkjs/react-markdown) with [Remark GFM](https://github.com/remarkjs/remark-gfm)

---

## 📂 Project Structure

```text
chat_frontend_rag/
├── app/                # Next.js App Router (Routes & Layouts)
│   ├── chat/           # Chat interface routes
│   ├── login/          # Authentication pages
│   ├── persona/        # Persona management pages
│   ├── globals.css     # Global styles & Tailwind directives
│   ├── layout.jsx      # Root layout (Fonts & Redux Provider)
│   └── page.jsx        # Landing / Bootstrap logic
├── components/         # Reusable UI components
│   ├── ui/             # Shadcn base components
│   ├── ChatWindow.jsx  # Main chat thread display
│   ├── Sidebar.jsx     # Navigation and session list
│   └── Message.jsx     # Individual message bubble
├── store/              # Redux State Management
│   ├── chatSlice.js    # Chat, Session, and Persona state
│   └── store.js        # Redux store configuration
├── lib/                # Utilities & API
│   ├── api.js          # Axios instance with auth interceptors
│   └── utils.ts        # Tailwind merge & helper functions
└── public/             # Static assets (images, logos)
```

---

## 🛠️ Core Architecture

### 1. Authentication Flow
Authentication is handled via JWT tokens stored in `localStorage`.
- The root `page.jsx` acts as a guard. If no token is found, it redirects to `/login`.
- If authenticated, it checks for existing personas. If none, it redirects to `/persona` to ensure the user has an AI identity configured.
- Finally, it loads the most recent chat session or creates a new one.

### 2. State Management (Redux)
We use Redux Toolkit to maintain a single source of truth for:
- **Active Session**: The currently viewed chat.
- **Sessions List**: History of user conversations.
- **Personas**: Available AI personalities.
- **Loading States**: Managing UI feedback during API calls.

### 3. Styling & Design System
Sortix AI features a premium "Sora-inspired" aesthetic:
- **Color Palette**: Dark mode base (`#0e0d0c`) with a vibrant "Sora Orange" accent (`#e8734a`).
- **Typography**: A mix of elegant serifs for headings and clean sans-serif for content.
- **Glassmorphism**: Subtle blurs and translucent backgrounds on sidebars and cards.

---

## 🧭 Routes & Pages

### Home (`/`)
Bootstrap page that performs initial auth checks and redirects the user to the appropriate destination.

### Login (`/login`)
A clean, minimalist authentication page. Handles user login and stores the JWT.

### Chat (`/chat/[sessionId]`)
The core experience.
- **Sidebar**: Displays chat history and persona selection.
- **ChatWindow**: Renders messages using `react-markdown` to support formatting, code blocks, and tables.
- **InputBox**: Supports multi-line input and file uploads for RAG context.

### Persona (`/persona`)
A dedicated area to create and manage "Personas"—custom AI configurations that define how the bot responds and what knowledge it prioritizes.

---

## 📡 API Integration

API calls are centralized in `lib/api.js`.
- **Base URL**: Configured via `.env` (usually `http://localhost:8000/api`).
- **Interceptors**: Automatically attaches the `Authorization: Bearer <token>` header to every request.

---

## 🎨 Component Highlights

- **`SortixLogo`**: A custom SVG component used for branding across the Sortix AI app.
- **`Message`**: Handles complex rendering of AI responses, including streaming animations and markdown parsing.
- **`Sidebar`**: Features dynamic session management (renaming, deleting) and persona switching.

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configuration**:
   Ensure `.env` contains the correct `NEXT_PUBLIC_API_URL`.

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
