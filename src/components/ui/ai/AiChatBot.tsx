"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import styles from './AiChatBot.module.css';

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    content: string;
}

export default function AiChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', content: '🌟 ¡Hola! Soy tu asistente AMIB IA. Estoy aquí para guiarte usando la Guía de Certificación del Mercado de Valores. ¿En qué te puedo ayudar hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageCountRef = useRef(1);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        messageCountRef.current += 1;
        const userMsgId = String(messageCountRef.current);
        const newHistory = [...messages, { id: userMsgId, role: 'user' as const, content: userMsg }];
        setMessages(newHistory);
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages
                })
            });

            if (!response.ok) {
                throw new Error('Error en el servidor');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            messageCountRef.current += 1;
            const modelMsgId = String(messageCountRef.current);
            setMessages(prev => [...prev, { id: modelMsgId, role: 'model', content: '' }]);

            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                fullResponse += chunk;

                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = fullResponse;
                    return updated;
                });
            }

        } catch (error: any) {
            messageCountRef.current += 1;
            setMessages(prev => [...prev, {
                id: String(messageCountRef.current),
                role: 'model',
                content: '❌ Lo siento, tuve un problema de conexión. Asegúrate de haber configurado tu API Key correctamente.'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const chatContent = (
        <>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <div className={styles.iconWrapper}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>AMIB IA</h3>
                        <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.8 }}>Guía de Certificación</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isExpanded && (
                        <button onClick={() => setIsExpanded(false)} className={styles.closeBtn} title="Contraer">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 4H5a2 2 0 00-2 2v4m0 0H3m2 0v14a2 2 0 002 2h4m0 0h4a2 2 0 002-2v-4m0 0h2m-2 0V6"></path>
                            </svg>
                        </button>
                    )}
                    <button onClick={() => setIsOpen(false)} className={styles.closeBtn} title="Cerrar">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
                {messages.map((msg) => (
                    <div key={msg.id} className={msg.role === 'user' ? styles.userMessageContainer : styles.modelMessageContainer} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
                        <div className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.modelMessage}`}>
                            {msg.role === 'model' ? (
                                <ReactMarkdown
                                    components={{
                                        strong: ({node, ...props}) => <strong style={{fontWeight: 600}} {...props} />,
                                        em: ({node, ...props}) => <em {...props} />,
                                        ul: ({node, ...props}) => <ul style={{marginLeft: '1.2em'}} {...props} />,
                                        li: ({node, ...props}) => <li style={{marginBottom: '0.25em'}} {...props} />,
                                        p: ({node, ...props}) => <p style={{marginBottom: '0.5em'}} {...props} />,
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className={styles.typingIndicator}>
                        <motion.div animate={{y:[0,-5,0]}} transition={{repeat:Infinity, duration:0.6}} className={styles.dot} />
                        <motion.div animate={{y:[0,-5,0]}} transition={{repeat:Infinity, duration:0.6, delay:0.1}} className={styles.dot} />
                        <motion.div animate={{y:[0,-5,0]}} transition={{repeat:Infinity, duration:0.6, delay:0.2}} className={styles.dot} />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputArea}>
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className={styles.inputForm}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pregunta sobre la guía..."
                        className={styles.inputField}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className={styles.sendBtn}
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'rotate(45deg)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                    </button>
                </form>
            </div>
        </>
    );

    return (
        <div className={styles.botContainer}>
            <AnimatePresence>
                {/* Versión Expandida (Fullscreen) */}
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.backdrop}
                    >
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className={styles.expandedWindow}
                        >
                            {chatContent}
                        </motion.div>
                    </motion.div>
                )}

                {/* Versión Bubble (Globo Flotante) */}
                {isOpen && !isExpanded && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, x: 20, y: 20 }}
                        animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, x: 20, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={styles.chatWindow}
                    >
                        {chatContent}
                        {/* Botón Expandir dentro del bubble */}
                        <button
                            onClick={() => setIsExpanded(true)}
                            className={styles.expandBtn}
                            title="Expandir a pantalla completa"
                        >
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-6h6m0 0v6m0-6l-9 9"></path>
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB (Floating Action Button) */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    if (isExpanded) {
                        setIsExpanded(false);
                        setIsOpen(false);
                    } else {
                        setIsOpen(!isOpen);
                    }
                }}
                className={`${styles.fab} ${isOpen || isExpanded ? styles.fabOpen : ''}`}
            >
                {isOpen || isExpanded ? (
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
                        <path d="M19 14L19.75 16.25L22 17L19.75 17.75L19 20L18.25 17.75L16 17L18.25 16.25L19 14Z" opacity="0.8" />
                        <path d="M5 3L5.6 4.8L7.4 5.4L5.6 6L5 7.8L4.4 6L2.6 5.4L4.4 4.8L5 3Z" opacity="0.7" />
                    </svg>
                )}
            </motion.button>
        </div>
    );
}
