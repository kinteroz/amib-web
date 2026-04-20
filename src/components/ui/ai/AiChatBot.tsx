"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import styles from './AiChatBot.module.css';

export default function AiChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([
        { role: 'model', content: '🌟 ¡Hola! Soy tu asistente AMIB IA. Estoy aquí para guiarte usando la Guía de Certificación del Mercado de Valores. ¿En qué te puedo ayudar hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

        // Add user message
        const newHistory = [...messages, { role: 'user' as const, content: userMsg }];
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

            // Consumir stream de texto
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            // Agregar mensaje vacío para el modelo
            setMessages(prev => [...prev, { role: 'model', content: '' }]);

            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                fullResponse += chunk;

                // Actualizar último mensaje con el contenido acumulado
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = fullResponse;
                    return updated;
                });
            }

        } catch (error: any) {
            setMessages(prev => [...prev, {
                role: 'model',
                content: '❌ Lo siento, tuve un problema de conexión. Asegúrate de haber configurado tu API Key correctamente.'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // UI Variants for Framer Motion
    const drawerVariants = {
        closed: { scale: 0.8, opacity: 0, x: 20, y: 20, transition: { type: "spring", stiffness: 300, damping: 25 } },
        open: { scale: 1, opacity: 1, x: 0, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
    };

    return (
        <div className={styles.botContainer}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={drawerVariants}
                        className={styles.chatWindow}
                    >
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
                            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className={styles.messages}>
                            {messages.map((msg, idx) => (
                                <div key={idx} className={msg.role === 'user' ? styles.userMessageContainer : styles.modelMessageContainer} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
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

                        {/* Input Area */}
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
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`}
            >
                {isOpen ? (
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                ) : (
                    <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                )}
            </motion.button>
        </div>
    );
}
