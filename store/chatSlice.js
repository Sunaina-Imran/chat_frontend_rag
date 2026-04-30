import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

export const fetchSessions = createAsyncThunk('chat/fetchSessions', async () => {
  const response = await api.get('/chat/sessions');
  return response.data;
});

export const createSession = createAsyncThunk('chat/createSession', async () => {
  const response = await api.post('/chat/session');
  return response.data;
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (sessionId) => {
  const response = await api.get(`/chat/history/${sessionId}`);
  return { sessionId, messages: response.data.messages || [] };
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ sessionId, message, doc_ids = [] }) => {
  const response = await api.post('/chat/message', {
    session_id: sessionId, message, doc_ids
  });
  return { sessionId, userMessage: message, reply: response.data.answer };
});

export const deleteSession = createAsyncThunk('chat/deleteSession', async (sessionId) => {
  await api.delete(`/chat/session/${sessionId}`);
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
        state.chats = action.payload.map(chat => ({ ...chat, _id: chat.session_id, messages: chat.messages || [] }));
        if (!state.activeChatId && action.payload.length > 0) {
          state.activeChatId = action.payload[0].session_id;
        }
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      // createSession
      .addCase(createSession.fulfilled, (state, action) => {
        const payload = action.payload;
        const newChat = { ...payload, _id: payload.session_id, messages: [] };
        // Place new chat at index 0 (recent)
        state.chats.unshift(newChat);
        state.activeChatId = newChat.session_id;
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
