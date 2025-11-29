import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearch } from 'wouter';
import { Send, Building2, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { Conversation, Message } from '@shared/schema';
import { apiRequest } from '@/lib/api';
import { useLanguage } from '@/lib/useLanguage';

export default function Messages() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const searchParams = useSearch();
  const conversationIdParam = new URLSearchParams(searchParams).get('conversation');
  const propertyIdParam = new URLSearchParams(searchParams).get('property');
  const ownerIdParam = new URLSearchParams(searchParams).get('owner');

  const [selectedConversation, setSelectedConversation] = useState<number | null>(
    conversationIdParam ? parseInt(conversationIdParam) : null
  );
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (!scrollAreaRef.current) return;
    
    // Try multiple methods to find the scrollable viewport
    let viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!viewport) {
      viewport = scrollAreaRef.current.querySelector('.h-full.w-full') as HTMLElement;
    }
    if (!viewport) {
      viewport = scrollAreaRef.current.firstElementChild as HTMLElement;
    }
    
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  };

  const createConversationMutation = useMutation({
    mutationFn: (data: { property_id: number; owner_id: number }) =>
      apiRequest('POST', '/conversations', data),
    onSuccess: (data) => {
      setSelectedConversation(data.id);
      queryClient.invalidateQueries({ queryKey: ['/conversations'] });
    },
  });

  // Créer une conversation si nécessaire (une seule fois)
  const hasTriedCreateConversation = useRef(false);
  useEffect(() => {
    if (
      !conversationIdParam &&
      propertyIdParam &&
      ownerIdParam &&
      !selectedConversation &&
      !createConversationMutation.isPending &&
      !createConversationMutation.isSuccess &&
      !hasTriedCreateConversation.current
    ) {
      hasTriedCreateConversation.current = true;
      createConversationMutation.mutate({
        property_id: parseInt(propertyIdParam),
        owner_id: parseInt(ownerIdParam),
      });
    }
    // Reset si les paramètres changent
    if (!propertyIdParam || !ownerIdParam) {
      hasTriedCreateConversation.current = false;
    }
  }, [conversationIdParam, propertyIdParam, ownerIdParam, selectedConversation, createConversationMutation]);

  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/conversations'],
    queryFn: async () => {
      return apiRequest<Conversation[]>('GET', '/conversations');
    },
    refetchInterval: 5000, // Poll for new conversations every 5 seconds
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/messages', selectedConversation],
    enabled: !!selectedConversation,
    queryFn: async () => {
      if (!selectedConversation) return [];
      return apiRequest<Message[]>('GET', `/messages/${selectedConversation}`);
    },
    refetchInterval: 3000, // Poll for new messages every 3 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: { conversation_id: number; content: string }) =>
      apiRequest('POST', '/messages', data),
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['/messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['/conversations'] });
      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    },
  });

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    // Only scroll if we have messages and the scroll area is mounted
    if (messages && messages.length > 0) {
      // Clear any pending scroll
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      // Use setTimeout to ensure DOM has updated
      scrollTimeoutRef.current = setTimeout(() => {
        scrollToBottom();
        scrollTimeoutRef.current = null;
      }, 100);
    }
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    sendMessageMutation.mutate({
      conversation_id: selectedConversation,
      content: messageText,
    });
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [messageText]);

  const selectedConvData = conversations?.find(c => c.id === selectedConversation);

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
        <div className="container mx-auto px-0 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-4 md:py-6 lg:py-8 flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="max-w-6xl mx-auto flex-1 flex flex-col overflow-hidden w-full min-h-0">
            {/* Header - hidden on mobile when in conversation */}
            <div className={selectedConversation ? 'mb-2 sm:mb-3 md:mb-4 lg:mb-6 px-3 sm:px-0 flex-shrink-0 hidden md:block' : 'mb-2 sm:mb-3 md:mb-4 lg:mb-6 px-3 sm:px-0 flex-shrink-0'}>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-0.5 sm:mb-1 md:mb-2" data-testid="text-page-title">{t('messages.title')}</h1>
              <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-muted-foreground">{t('messages.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-3 lg:gap-4 xl:gap-6 flex-1 min-h-0 overflow-hidden">
              {/* Conversations List - Full screen on mobile when no conversation selected */}
              <Card className={selectedConversation ? 'md:col-span-1 rounded-none md:rounded-lg h-full flex flex-col overflow-hidden hidden md:flex' : 'md:col-span-1 rounded-none md:rounded-lg h-full flex flex-col overflow-hidden flex'}>
                <CardHeader className="px-2.5 sm:px-4 md:px-6 pb-2 sm:pb-3 md:pb-4 flex-shrink-0">
                  <CardTitle className="text-sm sm:text-base md:text-lg">{t('messages.conversations')}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden min-h-0">
                  <ScrollArea className="h-full">
                    {conversationsLoading ? (
                      <div className="space-y-2 sm:space-y-3 p-2 sm:p-3 md:p-4">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 sm:h-20 w-full" />
                        ))}
                      </div>
                    ) : !conversations || conversations.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 md:py-12 px-2 sm:px-3 md:px-4">
                        <Building2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-2 sm:mb-3 md:mb-4" />
                        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{t('messages.no_conversations')}</p>
                        <Link href="/properties">
                          <Button variant="ghost" size="sm" className="mt-2 text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9" data-testid="link-browse-properties">
                            {t('messages.browse')}
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-0.5 sm:space-y-1 p-0.5 sm:p-1 md:p-2">
                        {conversations.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv.id)}
                            className={selectedConversation === conv.id ? 'w-full text-left p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-md transition-colors hover-elevate active:scale-[0.98] bg-accent touch-manipulation' : 'w-full text-left p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-md transition-colors hover-elevate active:scale-[0.98] touch-manipulation'}
                            data-testid={`button-conversation-${conv.id}`}
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                              <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <h4 className="font-semibold truncate text-[11px] sm:text-xs md:text-sm">
                                  {conv.property_title}
                                </h4>
                                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground truncate">
                                  {conv.other_user_name}
                                </p>
                                {conv.last_message && (
                                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1 break-all line-clamp-2 overflow-hidden" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                    {conv.last_message}
                                  </p>
                                )}
                              </div>
                              {conv.unread_count && conv.unread_count > 0 && (
                                <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold flex-shrink-0">
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

              {/* Messages View - Full screen on mobile when conversation selected */}
              <Card className={selectedConversation ? 'md:col-span-2 rounded-none md:rounded-lg h-full flex flex-col overflow-hidden flex' : 'md:col-span-2 rounded-none md:rounded-lg h-full flex flex-col overflow-hidden hidden md:flex'}>
                {!selectedConversation ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center py-6 sm:py-8 md:py-12 px-3 sm:px-4">
                      <Building2 className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-2 sm:mb-3 md:mb-4" />
                      <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 sm:mb-2">{t('messages.select_conversation')}</h3>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        {t('messages.select_conversation.desc')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <CardHeader className="border-b px-2.5 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex-shrink-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="md:hidden h-7 w-7 sm:h-8 sm:w-8 -ml-1 sm:-ml-2 touch-manipulation"
                          onClick={() => setSelectedConversation(null)}
                          data-testid="button-back"
                        >
                          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xs sm:text-sm md:text-base lg:text-lg truncate" data-testid="text-conversation-title">
                            {selectedConvData?.property_title}
                          </CardTitle>
                          <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-muted-foreground truncate">
                            {selectedConvData?.other_user_name}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0 flex flex-col flex-1 overflow-hidden min-h-0">
                      <ScrollArea ref={scrollAreaRef} className="flex-1 p-1.5 sm:p-2 md:p-3 lg:p-4">
                        {messagesLoading ? (
                          <div className="space-y-2 sm:space-y-3 md:space-y-4">
                            {[1, 2, 3].map((i) => (
                              <Skeleton key={i} className="h-12 sm:h-14 md:h-16 w-3/4" />
                            ))}
                          </div>
                        ) : !messages || messages.length === 0 ? (
                          <div className="text-center py-6 sm:py-8 md:py-12">
                            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{t('messages.no_messages')} {t('messages.start')}</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5 sm:space-y-2 md:space-y-3 lg:space-y-4">
                            {messages.map((msg) => {
                              const isOwn = msg.sender_id === user?.id;
                              return (
                                <div
                                  key={msg.id}
                                  className={isOwn ? 'flex justify-end w-full min-w-0' : 'flex justify-start w-full min-w-0'}
                                  data-testid={`message-${msg.id}`}
                                >
                                  <div
                                    className={isOwn ? 'max-w-[90%] xs:max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] rounded-lg p-2 sm:p-2.5 md:p-3 bg-primary text-primary-foreground overflow-hidden min-w-0' : 'max-w-[90%] xs:max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] rounded-lg p-2 sm:p-2.5 md:p-3 bg-muted overflow-hidden min-w-0'}
                                  >
                                    <p className="text-[11px] sm:text-xs md:text-sm whitespace-pre-wrap break-all leading-relaxed" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}>
                                      {msg.content}
                                    </p>
                                    <p
                                      className={isOwn ? 'text-[9px] sm:text-[10px] md:text-xs mt-0.5 sm:mt-1 text-primary-foreground/70' : 'text-[9px] sm:text-[10px] md:text-xs mt-0.5 sm:mt-1 text-muted-foreground'}
                                    >
                                      {new Date(msg.created_at).toLocaleString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </ScrollArea>

                      <div className="border-t p-1.5 sm:p-2 md:p-3 lg:p-4 bg-background flex-shrink-0">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSendMessage();
                          }}
                          className="flex gap-1 sm:gap-1.5 md:gap-2 items-end"
                        >
                          <Textarea
                            ref={textareaRef}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder={t('messages.type_message')}
                            disabled={sendMessageMutation.isPending}
                            data-testid="input-message"
                            className="text-[13px] sm:text-sm md:text-base min-h-[2.5rem] max-h-[8rem] resize-none flex-1 overflow-y-auto"
                            rows={1}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (messageText.trim() && !sendMessageMutation.isPending) {
                                  handleSendMessage();
                                }
                              }
                            }}
                          />
                          <Button
                            type="submit"
                            size="icon"
                            disabled={!messageText.trim() || sendMessageMutation.isPending}
                            data-testid="button-send"
                            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex-shrink-0 touch-manipulation"
                          >
                            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
      </div>
    </MainLayout>
  );
}
