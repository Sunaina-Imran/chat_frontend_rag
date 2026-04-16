import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = 'http://localhost:8000/api';

export const fetchSessions = createAsyncThunk('chat/fetchSessions', async () => {
  const response = await fetch(`${API_BASE}/sessions`);
  if (!response.ok) throw new Error('Failed to fetch sessions');
  return response.json();
});

export const createSession = createAsyncThunk('chat/createSession', async () => {
  const response = await fetch(`${API_BASE}/session`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to create session');
  return response.json();
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (sessionId) => {
  const response = await fetch(`${API_BASE}/messages/${sessionId}`);
  if (!response.ok) throw new Error('Failed to fetch messages');
  const data = await response.json();
  return { sessionId, messages: data };
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ sessionId, message }) => {
  const response = await fetch(`${API_BASE}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message })
  });
  if (!response.ok) throw new Error('Failed to send message');
  const data = await response.json();
  return { sessionId, userMessage: message, reply: data.reply };
});

export const deleteSession = createAsyncThunk('chat/deleteSession', async (sessionId) => {
  const response = await fetch(`${API_BASE}/session/${sessionId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete session');
  return sessionId;
});

const initialState = {
  chats: [],
  activeChatId: null,
  status: 'idle',
  error: null,
  isSending: false
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
    },
    // Optimistic user message insertion instantly
    addOptimisticMessage: (state, action) => {
      const { sessionId, content } = action.payload;
      const chat = state.chats.find(c => c._id === sessionId);
      if (chat) {
        if (!chat.messages) chat.messages = [];
        chat.messages.push({
          _id: Date.now().toString(),
          role: 'user',
          content
        });
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchSessions
      .addCase(fetchSessions.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.chats = action.payload.map(chat => ({ ...chat, messages: chat.messages || [] }));
        if (!state.activeChatId && action.payload.length > 0) {
          state.activeChatId = action.payload[0]._id;
        }
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      // createSession
      .addCase(createSession.fulfilled, (state, action) => {
        const newChat = { ...action.payload, messages: [] };
        // Place new chat at index 0 (recent)
        state.chats.unshift(newChat);
        state.activeChatId = newChat._id;
      })

      // fetchMessages
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { sessionId, messages } = action.payload;
        const chat = state.chats.find(c => c._id === sessionId);
        if (chat) {
          chat.messages = messages;
        }
      })

      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        const { sessionId, reply } = action.payload;
        const chat = state.chats.find(c => c._id === sessionId);
        if (chat) {
          if (!chat.messages) chat.messages = [];
          chat.messages.push({
            _id: Date.now().toString() + 'bot',
            role: 'assistant',
            content: reply
          });
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.error.message;
      })

      // deleteSession
      .addCase(deleteSession.fulfilled, (state, action) => {
        const sessionId = action.payload;
        state.chats = state.chats.filter(c => c._id !== sessionId);
        if (state.activeChatId === sessionId) {
          state.activeChatId = state.chats.length > 0 ? state.chats[0]._id : null;
        }
      });
  }
});

export const { setActiveChat, addOptimisticMessage } = chatSlice.actions;

export const selectActiveChat = (state) =>
  state.chat.chats.find(c => c._id === state.chat.activeChatId);

export default chatSlice.reducer;
