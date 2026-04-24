'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function LiveQA({ eventoId }: { eventoId: string }) {
    const supabase = createClient();
    const [preguntas, setPreguntas] = useState<any[]>([]);
    const [nuevaPregunta, setNuevaPregunta] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [nombre, setNombre] = useState(''); // If anonymous or not logged in

    useEffect(() => {
        if (!isOpen) return;
        
        fetchPreguntas();

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`preguntas_${eventoId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'evento_preguntas', filter: `evento_id=eq.${eventoId}` }, (payload) => {
                fetchPreguntas(); // Simple refetch for now
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [eventoId, isOpen]);

    const fetchPreguntas = async () => {
        const { data } = await supabase
            .from('evento_preguntas')
            .select('*')
            .eq('evento_id', eventoId)
            .order('votos', { ascending: false })
            .order('created_at', { ascending: false });
        if (data) setPreguntas(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevaPregunta.trim()) return;

        const { error } = await supabase
            .from('evento_preguntas')
            .insert([{
                evento_id: eventoId,
                pregunta: nuevaPregunta,
                autor_nombre: nombre || 'Anónimo',
            }]);
        
        if (!error) {
            setNuevaPregunta('');
        } else {
            console.error(error);
            alert('Error al enviar pregunta');
        }
    };

    const handleUpvote = async (id: string, currentVotos: number) => {
        await supabase
            .from('evento_preguntas')
            .update({ votos: currentVotos + 1 })
            .eq('id', id);
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    background: '#001F3F', color: 'white', border: 'none',
                    padding: '1rem 2rem', borderRadius: '30px', fontWeight: 700,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', cursor: 'pointer', zIndex: 50,
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
            >
                💬 Preguntas en Vivo
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed', bottom: '2rem', right: '2rem', width: '380px', height: '550px',
            background: 'white', borderRadius: '16px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
            display: 'flex', flexDirection: 'column', zIndex: 50, overflow: 'hidden',
            border: '1px solid #e2e8f0'
        }}>
            <div style={{ background: '#001F3F', color: 'white', padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Preguntas en Vivo (Q&A)</h3>
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {preguntas.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem' }}>Sé el primero en hacer una pregunta</div>
                ) : (
                    preguntas.map(p => (
                        <div key={p.id} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', opacity: p.respondida ? 0.6 : 1 }}>
                            {p.destacada && <div style={{ fontSize: '0.7rem', background: '#fef08a', color: '#854d0e', display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '10px', marginBottom: '0.5rem', fontWeight: 700 }}>Destacada por el moderador</div>}
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: 500 }}>{p.pregunta}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.autor_nombre}</span>
                                <button onClick={() => handleUpvote(p.id, p.votos)} style={{ background: '#f1f5f9', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                    👍 {p.votos}
                                </button>
                            </div>
                            {p.respondida && <div style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '0.5rem', fontWeight: 600 }}>✓ Respondida</div>}
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                <input 
                    placeholder="Tu nombre (opcional)" 
                    value={nombre} onChange={e => setNombre(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.5rem', fontSize: '0.85rem' }} 
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                        placeholder="Escribe tu pregunta..." 
                        value={nuevaPregunta} onChange={e => setNuevaPregunta(e.target.value)}
                        style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
                        required
                    />
                    <button type="submit" style={{ background: '#001F3F', color: 'white', border: 'none', padding: '0 1.2rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                        Enviar
                    </button>
                </div>
            </form>
        </div>
    );
}
