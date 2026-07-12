"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../components/navbar";

export default function AssistantPage() {
    const Chatbot = () => {
        const [messages, setMessages] = useState([
            {
                id: 1,
                text: "👋 Hello! I'm your Minshuku assistant. How can I help you today?",
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString()
            }
        ]);
        const [inputText, setInputText] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const [isOpen, setIsOpen] = useState(false);
        const messagesEndRef = useRef<HTMLDivElement>(null);

        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        };

        useEffect(() => {
            scrollToBottom();
        }, [messages]);

        const handleSendMessage = async () => {
            if (!inputText.trim()) return;

            const userMessage = {
                id: messages.length + 1,
                text: inputText,
                sender: 'user',
                timestamp: new Date().toLocaleTimeString()
            };

            setMessages(prev => [...prev, userMessage]);
            setInputText('');
            setIsLoading(true);

            try {
                // Try to connect to the backend chatbot API
                const response = await fetch('http://localhost:8000/api/chatbot/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: inputText,
                        user_id: 'guest-user', // In production, use actual user ID
                        context: {}
                    })
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.success) {
                        const botMessage = {
                            id: messages.length + 2,
                            text: data.data.response,
                            sender: 'bot',
                            timestamp: new Date().toLocaleTimeString(),
                            queryType: data.data.query_type,
                            suggestedActions: data.data.suggested_actions
                        };

                        setMessages(prev => [...prev, botMessage]);
                    } else {
                        throw new Error(data.data?.error || 'Failed to get response');
                    }
                } else {
                    // If backend is not available, use fallback responses
                    const fallbackResponses = [
                        "I'd be happy to help you with that! What specific information are you looking for?",
                        "Great question! Let me check our available listings for you.",
                        "I can help you with booking information, pricing, or property details.",
                        "For immediate assistance, you can also contact our support team at support@minshuku.com"
                    ];

                    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

                    const botMessage = {
                        id: messages.length + 2,
                        text: randomResponse,
                        sender: 'bot',
                        timestamp: new Date().toLocaleTimeString()
                    };

                    setMessages(prev => [...prev, botMessage]);
                }
            } catch (error) {
                console.error('Chatbot error:', error);
                // Fallback response if everything fails
                const errorMessage = {
                    id: messages.length + 2,
                    text: "I'm here to help! What can I assist you with today?",
                    sender: 'bot',
                    timestamp: new Date().toLocaleTimeString()
                };
                setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        };

        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        };

        const quickActions = [
            { text: "🏠 Find available listings", query: "What listings are available this weekend?" },
            { text: "💰 Pricing information", query: "What are your pricing policies?" },
            { text: "📅 Booking process", query: "How do I make a booking?" },
            { text: "⭐ Review guidelines", query: "How do I leave a review?" }
        ];

        const handleQuickAction = (query: string) => {
            setInputText(query);
            setTimeout(() => handleSendMessage(), 100);
        };
        return (

            <>

                <Navbar />
                <div className="chatbot-container">
                    {/* Chatbot Toggle Button */}
                    <button
                        className="chatbot-toggle"
                        onClick={() => setIsOpen(!isOpen)}
                        style={{
                            position: 'fixed',
                            bottom: '20px',
                            right: '20px',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: '#3b82f6',
                            border: 'none',
                            color: 'white',
                            fontSize: '24px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                            zIndex: 1000,
                            transition: 'transform 0.3s'
                        }}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'scale(1)'}
                    >
                        💬
                    </button>

                    {/* Chatbot Window */}
                    {isOpen && (
                        <div className="chatbot-window" style={{
                            position: 'fixed',
                            bottom: '90px',
                            right: '20px',
                            width: '350px',
                            height: '500px',
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 1000,
                            border: '1px solid #e5e7eb'
                        }}>
                            {/* Header */}
                            <div style={{
                                padding: '16px',
                                background: '#3b82f6',
                                color: 'white',
                                borderRadius: '12px 12px 0 0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <strong>Minshuku Assistant</strong>
                                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Always here to help!</div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '18px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Messages Area */}
                            <div style={{
                                flex: 1,
                                padding: '16px',
                                overflowY: 'auto',
                                background: '#f8f9fa'
                            }}>
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                            marginBottom: '12px'
                                        }}
                                    >
                                        <div
                                            style={{
                                                maxWidth: '80%',
                                                padding: '10px 14px',
                                                borderRadius: message.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                background: message.sender === 'user' ? '#3b82f6' : '#e9ecef',
                                                color: message.sender === 'user' ? 'white' : '#333',
                                                fontSize: '14px',
                                                lineHeight: '1.4'
                                            }}
                                        >
                                            {message.text}
                                            <div style={{
                                                fontSize: '10px',
                                                opacity: 0.7,
                                                marginTop: '4px',
                                                textAlign: message.sender === 'user' ? 'right' : 'left'
                                            }}>
                                                {message.timestamp}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
                                        <div style={{
                                            padding: '10px 14px',
                                            borderRadius: '18px 18px 18px 4px',
                                            background: '#e9ecef',
                                            color: '#333',
                                            fontSize: '14px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    background: '#3b82f6',
                                                    animation: 'pulse 1.5s infinite'
                                                }}></div>
                                                Thinking...
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Actions */}
                            {messages.length === 1 && (
                                <div style={{
                                    padding: '12px 16px',
                                    borderTop: '1px solid #e0e0e0',
                                    background: '#f8f9fa'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Quick actions:</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {quickActions.map((action, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleQuickAction(action.query)}
                                                style={{
                                                    padding: '6px 10px',
                                                    background: 'white',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '16px',
                                                    fontSize: '11px',
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap',
                                                    transition: 'background 0.3s'
                                                }}
                                                onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#f0f0f0'}
                                                onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'white'}
                                            >
                                                {action.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Input Area */}
                            <div style={{
                                padding: '16px',
                                borderTop: '1px solid #e0e0e0',
                                background: 'white'
                            }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your message..."
                                        disabled={isLoading}
                                        style={{
                                            flex: 1,
                                            padding: '10px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '20px',
                                            outline: 'none',
                                            fontSize: '14px'
                                        }}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isLoading || !inputText.trim()}
                                        style={{
                                            padding: '10px 16px',
                                            background: '#3b82f6',
                                            border: 'none',
                                            borderRadius: '20px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            opacity: isLoading || !inputText.trim() ? 0.5 : 1,
                                            transition: 'background 0.3s'
                                        }}
                                        onMouseEnter={(e) => !isLoading && inputText.trim() && ((e.target as HTMLElement).style.background = '#2563eb')}
                                        onMouseLeave={(e) => !isLoading && inputText.trim() && ((e.target as HTMLElement).style.background = '#3b82f6')}
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}
      </style>
                </div>
                );

            </>

        );
    }

}


