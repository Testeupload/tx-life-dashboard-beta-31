import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageCircle, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

export function GlobalChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      // Buscar mensagens
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;

      // Buscar profiles dos usuários
      const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combinar dados
      const data = messagesData?.map(message => ({
        ...message,
        profiles: profilesData?.find(p => p.user_id === message.user_id) || { full_name: null }
      })) || [];

      setMessages(data);
      setTimeout(scrollToBottom, 100);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      if (error.message?.includes('permission')) {
        toast({
          title: "Acesso Restrito",
          description: "Este chat é exclusivo para TX e HX.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao carregar mensagens",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          user_id: user.id,
          message: newMessage.trim()
        }]);

      if (error) throw error;

      setNewMessage('');
      // As mensagens serão atualizadas automaticamente via realtime
    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error.message?.includes('permission')) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para enviar mensagens neste chat.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao enviar mensagem",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    fetchMessages();

    // Configurar realtime para chat
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          fetchMessages(); // Recarregar mensagens quando houver mudanças
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getUserInitials = (fullName: string | null | undefined) => {
    if (!fullName) return 'U';
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUserColor = (userId: string) => {
    // Gerar cor baseada no user_id para consistência
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500'];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <MessageCircle className="mx-auto h-8 w-8 animate-pulse text-primary" />
          <p className="text-muted-foreground">Carregando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <MessageCircle className="text-primary" />
            CHAT PRIVADO TX • HX
          </h2>
          <p className="text-muted-foreground mt-1">
            Comunicação direta e privada entre operadores
          </p>
        </div>
      </div>

      <Card className="shadow-card h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Chat Ao Vivo
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-success font-medium">ONLINE</span>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4 p-4">
          {/* Área de Mensagens */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhuma mensagem ainda.</p>
                  <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.user_id === user?.id;
                  const userName = message.profiles?.full_name || 'Usuário';
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwnMessage && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={getUserColor(message.user_id)}>
                            {getUserInitials(userName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-[70%] ${isOwnMessage ? 'order-first' : ''}`}>
                        <div className={`p-3 rounded-lg ${
                          isOwnMessage 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'bg-muted'
                        }`}>
                          {!isOwnMessage && (
                            <div className="text-xs font-medium mb-1 opacity-70">
                              {userName}
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.message}
                          </p>
                        </div>
                        <div className={`text-xs text-muted-foreground mt-1 ${
                          isOwnMessage ? 'text-right' : 'text-left'
                        }`}>
                          {formatTime(message.created_at)}
                        </div>
                      </div>

                      {isOwnMessage && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getUserInitials(userName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input de Mensagem */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={sending}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              size="sm"
              className="gap-2"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}