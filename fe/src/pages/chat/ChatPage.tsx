import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth';
import {
  Send,
  Paperclip,
  Loader2,
  AlertCircle,
  ArrowLeft,
  FileText,
  Circle,
} from 'lucide-react';

/* ---------- Types ---------- */

interface Message {
  id: string;
  consultation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
}

interface ConsultationDetail {
  id: string;
  consultant: {
    id: string;
    name: string;
    avatar_url?: string;
    is_online?: boolean;
  };
  status: string;
}

/* ---------- Helper ---------- */

function formatMessageTime(iso: string, t: (k: string) => string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `${t('chat.today')}, ${time}`;
  if (isYesterday) return `${t('chat.yesterday')}, ${time}`;
  return `${d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}, ${time}`;
}

/* ---------- Main Component ---------- */

export function ChatPage() {
  const { t } = useTranslation();
  const { consultationId } = useParams<{ consultationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [message, setMessage] = useState('');
  const [consultantTyping, setConsultantTyping] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  /* Fetch consultation details */
  const {
    data: consultation,
    isLoading: loadingConsultation,
    isError: consultationError,
  } = useQuery({
    queryKey: ['consultation', consultationId],
    queryFn: () =>
      api.get<{ data: ConsultationDetail }>(`/consultations/${consultationId}`).then((r) => r.data),
    enabled: !!consultationId,
  });

  /* Fetch message history */
  const {
    data: messages = [],
    isLoading: loadingMessages,
    isError: messagesError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['messages', consultationId],
    queryFn: () =>
      api
        .get<{ data: Message[] }>(`/consultations/${consultationId}/messages`)
        .then((r) => r.data),
    enabled: !!consultationId,
  });

  /* Scroll to bottom helper */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /* ---- WebSocket Connection ---- */
  useEffect(() => {
    if (!consultationId) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket: Socket = io('http://localhost:3000/chat', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setWsConnected(true);
      socket.emit('join-room', { consultationId });
    });

    socket.on('disconnect', () => {
      setWsConnected(false);
    });

    socket.on('connect_error', () => {
      setWsConnected(false);
    });

    socket.on('new-message', (msg: Message) => {
      if (msg.consultation_id === consultationId) {
        queryClient.setQueryData<Message[]>(['messages', consultationId], (old = []) => [
          ...old,
          msg,
        ]);
      }
    });

    socket.on('user-typing', (data: { user_id: string; consultation_id: string }) => {
      if (data.consultation_id === consultationId && data.user_id !== user?.id) {
        setConsultantTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setConsultantTyping(false), 3000);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [consultationId, user?.id, queryClient]);

  /* ---- Send message (WebSocket + REST fallback) ---- */
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      /* Try WebSocket first */
      const socket = socketRef.current;
      if (socket && socket.connected) {
        socket.emit('send-message', { consultationId, content });
        return;
      }
      /* Fallback to REST */
      await api.post(`/consultations/${consultationId}/message`, { content });
      await refetchMessages();
    },
  });

  /* Send file */
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const socket = socketRef.current;
      if (socket && socket.connected) {
        /* Upload via REST then notify via socket */
        const result = await api.upload<{ data: Message }>(
          `/consultations/${consultationId}/upload`,
          formData,
        );
        socket.emit('send-message', {
          consultationId,
          content: '',
          file_url: result.data.file_url,
          file_name: result.data.file_name,
        });
        return result;
      }
      /* Fallback to REST */
      return api.upload<{ data: Message }>(
        `/consultations/${consultationId}/upload`,
        formData,
      ).then(() => refetchMessages());
    },
  });

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(trimmed);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit('typing', { consultationId });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFileMutation.mutate(file);
    /* Reset input so same file can be re-selected */
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ---- Render ---- */

  if (loadingConsultation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex items-center justify-center text-text-secondary">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        {t('common.loading')}
      </div>
    );
  }

  if (consultationError || !consultation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center gap-2 text-text-secondary">
        <AlertCircle className="w-8 h-8 text-primary" />
        <p>{t('common.error')}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-primary hover:underline mt-1"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-1.5 rounded-md hover:bg-background-gray text-text-secondary"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-sm">
          {consultation.consultant.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">
            {consultation.consultant.name}
          </p>
          <div className="flex items-center gap-1.5">
            <Circle
              className={`w-2 h-2 fill-current ${
                consultation.consultant.is_online ? 'text-success' : 'text-text-disabled'
              }`}
            />
            <span className="text-xs text-text-secondary">
              {consultation.consultant.is_online ? t('chat.online') : t('chat.offline')}
            </span>
          </div>
        </div>

        {wsConnected ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-success-bg text-success">
            Live
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full bg-warning-bg text-warning">
            Offline
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full text-text-secondary">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {t('common.loading')}
          </div>
        ) : messagesError ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-text-secondary">
            <AlertCircle className="w-8 h-8 text-primary" />
            <p>{t('common.error')}</p>
            <button
              onClick={() => refetchMessages()}
              className="text-sm text-primary hover:underline"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-text-secondary">
            <MessageEmptyIcon />
            <p className="text-sm">{t('chat.startConversation')}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                    isOwn
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-background-gray text-text-primary rounded-bl-sm'
                  }`}
                >
                  {msg.file_url ? (
                    <a
                      href={msg.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 underline-offset-2 hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{msg.file_name ?? t('chat.fileSent')}</span>
                    </a>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-white/70' : 'text-text-disabled'
                    }`}
                  >
                    {formatMessageTime(msg.created_at, t)}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {consultantTyping && (
          <div className="flex justify-start">
            <div className="bg-background-gray rounded-xl px-4 py-2.5 rounded-bl-sm">
              <span className="text-xs text-text-secondary italic">
                {consultation.consultant.name} {t('chat.typing')}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadFileMutation.isPending}
            className="p-2.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-gray disabled:opacity-50"
            aria-label={t('chat.uploadFile')}
          >
            {uploadFileMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.typeMessage')}
              rows={1}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-text-disabled"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="p-2.5 rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={t('chat.send')}
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Simple SVG placeholder for empty chat state */
function MessageEmptyIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-text-disabled"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
