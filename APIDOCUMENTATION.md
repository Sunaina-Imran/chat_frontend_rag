# Chat Backend API Documentation

Welcome to the API Documentation for the Chat Backend! This document is designed to help you quickly set up your Postman or frontend code to communicate with the local server.

The server currently runs natively on: \`http://localhost:5000\`

---

## 1. Server Health Check

Quickly test if your server is running and returning responses.

- **URL:** \`/api/health\`
- **Method:** \`GET\`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
  \`\`\`json
  {
    "status": "ok",
    "message": "Server is healthy"
  }
  \`\`\`

---

## 2. Create a New Chat Session

Creates a new empty chat session to track message history.

- **URL:** \`/api/session\`
- **Method:** \`POST\`
- **Headers:** \`Content-Type: application/json\`
- **Body:** None required
- **Expected Response:**
  \`\`\`json
  {
    "title": "New Chat",
    "_id": "<UNIQUE_SESSION_ID>",
    "createdAt": "2026-03-18T16:07:28.403Z",
    "updatedAt": "2026-03-18T16:07:28.403Z",
    "__v": 0
  }
  \`\`\`
  *(Save the \`_id\` returned here; it will be your \`sessionId\` for further requests)*

---

## 3. Get All Chat Sessions

Retrieve a compiled list of all chat sessions, sorted by recent activity.

- **URL:** \`/api/sessions\`
- **Method:** \`GET\`
- **Headers:** None required
- **Body:** None
- **Expected Response:** Array of Session Objects
  \`\`\`json
  [
    {
      "title": "New Chat",
      "_id": "<UNIQUE_SESSION_ID>",
      "createdAt": "...",
      "updatedAt": "...",
      "__v": 0
    }
  ]
  \`\`\`

---

## 4. Get Messages for a Session

Fetch the full message log (both user and AI messages) belonging to a specific session.

- **URL:** \`/api/messages/:sessionId\` *(e.g. \`/api/messages/69bacdc00c9444091cbb6f15\`)*
- **Method:** \`GET\`
- **Headers:** None required
- **Body:** None
- **Expected Response:** Array of Message Objects
  \`\`\`json
  [
    {
      "_id": "...",
      "sessionId": "<UNIQUE_SESSION_ID>",
      "role": "user",
      "content": "Hello, are you working?",
      "createdAt": "...",
      "updatedAt": "...",
      "__v": 0
    },
    {
      "_id": "...",
      "sessionId": "<UNIQUE_SESSION_ID>",
      "role": "assistant",
      "content": "Yes, I'm working and ready to assist you.",
      "createdAt": "...",
      "updatedAt": "...",
      "__v": 0
    }
  ]
  \`\`\`

---

## 5. Send a Message

Send a message from the user to the AI for a specific chat session, which will trigger an AI reply and return the string content.

- **URL:** \`/api/message\`
- **Method:** \`POST\`
- **Headers:** \`Content-Type: application/json\`
- **Body Example:**
  \`\`\`json
  {
    "sessionId": "<UNIQUE_SESSION_ID>",
    "message": "Hello, this is a test message!"
  }
  \`\`\`
- **Expected Response:**
  \`\`\`json
  {
    "reply": "Hello! How can I help you today?"
  }
  \`\`\`

---

## 6. Delete a Chat Session

Deletes a chat session completely, including all persistent messages associated with that session in the database.

- **URL:** \`/api/session/:sessionId\` *(e.g. \`/api/session/69bacdc00c9444091cbb6f15\`)*
- **Method:** \`DELETE\`
- **Headers:** None required
- **Body:** None
- **Expected Response:**
  \`\`\`json
  {
    "message": "Session and associated messages deleted successfully"
  }
  \`\`\`
