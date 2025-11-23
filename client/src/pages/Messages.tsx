import { useState, useEffect, useRef } from 'react';
import { Link, useSearch } from 'wouter';
import { Send, Building2, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { Conversation, Message } from '@shared/schema';
import { apiRequest } from '@/lib/api';

export default function Messages() {
  const { user } = useAuth();
  const searchParams = useSearch();
  const conversationIdParam = new URLSearchParams(searchParams).get('conversation');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(
    conversationIdParam ? parseInt(conversationIdParam) : null
  );
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/messages/conversations'],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/messages', selectedConversation],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: { conversation_id: number; message: string }) =>
      apiRequest('POST', '/messages', data),
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['/messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['/messages/conversations'] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (conversationId: number) =>
      apiRequest('POST', `/messages/${conversationId}/mark-read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/messages/conversations'] });
    },
  });

  useEffect(() => {
    if (selectedConversation) {
      markAsReadMutation.mutate(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    sendMessageMutation.mutate({
      conversation_id: selectedConversation,
      message: messageText,
    });
  };

  const selectedConvData = conversations?.find(c => c.id === selectedConversation);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Messages</h1>
            <p className="text-muted-foreground">Communicate with property owners and potential tenants</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-22rem)]">
                  {conversationsLoading ? (
                    <div className="space-y-3 p-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : !conversations || conversations.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No conversations yet</p>
                      <Link href="/properties">
                        <Button variant="ghost" className="mt-2" data-testid="link-browse-properties">
                          Browse properties
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv.id)}
                          className={`w-full text-left p-4 rounded-md transition-colors hover-elevate ${
                            selectedConversation === conv.id ? 'bg-accent' : ''
                          }`}
                          data-testid={`button-conversation-${conv.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate text-sm">
                                {conv.property_title}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {conv.other_user_name}
                              </p>
                              {conv.last_message && (
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {conv.last_message}
                                </p>
                              )}
                            </div>
                            {conv.unread_count && conv.unread_count > 0 && (
                              <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                {conv.unread_count}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              {!selectedConversation ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">
                      Choose a conversation from the list to view messages
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setSelectedConversation(null)}
                        data-testid="button-back"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div>
                        <CardTitle className="text-lg" data-testid="text-conversation-title">
                          {selectedConvData?.property_title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {selectedConvData?.other_user_name}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 flex flex-col h-[calc(100vh-26rem)]">
                    <ScrollArea className="flex-1 p-4">
                      {messagesLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-3/4" />
                          ))}
                        </div>
                      ) : !messages || messages.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((msg) => {
                            const isOwn = msg.sender_id === user?.id;
                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                data-testid={`message-${msg.id}`}
                              >
                                <div
                                  className={`max-w-[70%] rounded-md p-3 ${
                                    isOwn
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted'
                                  }`}
                                >
                                  <p className="text-sm whitespace-pre-wrap break-words">
                                    {msg.content}
                                  </p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                    }`}
                                  >
                                    {new Date(msg.created_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>

                    <div className="border-t p-4">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendMessage();
                        }}
                        className="flex gap-2"
                      >
                        <Input
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Type your message..."
                          disabled={sendMessageMutation.isPending}
                          data-testid="input-message"
                        />
                        <Button
                          type="submit"
                          size="icon"
                          disabled={!messageText.trim() || sendMessageMutation.isPending}
                          data-testid="button-send"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
