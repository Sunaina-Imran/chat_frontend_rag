# 🤖 Chatbot Frontend Guide (React + Tailwind + Redux + shadcn/ui)

## 📌 Overview

This guide explains how to structure and build a **ChatGPT-like
frontend** using:

-   React (JavaScript only, NO TypeScript)
-   Tailwind CSS
-   Redux (State Management)
-   shadcn/ui (UI Components)

------------------------------------------------------------------------

## 🎯 Tech Stack

-   ⚛️ React (Frontend framework)
-   🎨 Tailwind CSS (Styling)
-   🧠 Redux Toolkit (State management)
-   🧩 shadcn/ui (Reusable UI components)

------------------------------------------------------------------------

## 📁 Frontend Folder Structure (Clean & Professional)

    frontend/
    │
    ├── public/
    │   └── index.html
    │
    ├── src/
    │   ├── app/                     # Redux store setup
    │   │   └── store.js
    │
    │   ├── features/                # Redux slices
    │   │   └── chat/
    │   │       └── chatSlice.js
    │
    │   ├── components/              # Reusable components
    │   │   ├── ui/                  # shadcn components
    │   │   ├── Sidebar.jsx
    │   │   ├── ChatWindow.jsx
    │   │   ├── Message.jsx
    │   │   └── InputBox.jsx
    │
    │   ├── pages/                   # Pages
    │   │   └── Home.jsx
    │
    │   ├── hooks/                   # Custom hooks
    │   │   └── useChat.js
    │
    │   ├── utils/                   # Helper functions
    │   │   └── helpers.js
    │
    │   ├── App.js
    │   ├── main.jsx
    │   └── index.css
    │
    ├── package.json
    └── tailwind.config.js

------------------------------------------------------------------------

## 🧠 How Data Flows

1.  User clicks **New Chat**
2.  Redux updates state
3.  UI re-renders
4.  Chat appears in center

------------------------------------------------------------------------

## 🔥 Redux Example (chatSlice.js)

``` js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [],
  activeChat: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    newChat: (state) => {
      const newChat = {
        id: Date.now(),
        title: "New Chat",
        messages: [],
      };
      state.chats.push(newChat);
      state.activeChat = newChat;
    },
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
  },
});

export const { newChat, setActiveChat } = chatSlice.actions;
export default chatSlice.reducer;
```

------------------------------------------------------------------------

## 🎨 UI Layout (Like ChatGPT)

    -------------------------------------
    | Sidebar        |   Chat Window    |
    |----------------|------------------|
    | + New Chat     |   Chat Title     |
    | Previous Chats |   Messages       |
    |                |   Input Box      |
    -------------------------------------

------------------------------------------------------------------------

## 🚀 Setup Steps

### 1. Create React App

    npx create-react-app frontend
    cd frontend

### 2. Install Dependencies

    npm install @reduxjs/toolkit react-redux
    npm install tailwindcss

### 3. Setup Tailwind

    npx tailwindcss init

### 4. Install shadcn/ui

Follow official steps:

    npx shadcn-ui@latest init

------------------------------------------------------------------------

## 🔜 Next Features to Build

-   Chat input + send button
-   API integration (Node backend)
-   Typing animation
-   Save chats in database

------------------------------------------------------------------------

## 💡 Best Practices

-   Keep components small
-   Use Redux only for global state
-   Use Tailwind for fast styling
-   Use shadcn for clean UI

------------------------------------------------------------------------

## 🎉 Conclusion

You now have a **scalable frontend structure** for your chatbot.

Next step → connect it with backend 🚀
