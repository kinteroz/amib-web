-- Migration: Fix images for extra news
-- Date: 2026-04-22

UPDATE public.noticias 
SET imagen_url = '/assets/news/reforma.png'
WHERE slug = 'reforma-marco-normativo-fondos-inversion-2026';

UPDATE public.noticias 
SET imagen_url = '/assets/news/blockchain.png'
WHERE slug = 'blockchain-mercado-valores-mexicano-oportunidades-retos';
