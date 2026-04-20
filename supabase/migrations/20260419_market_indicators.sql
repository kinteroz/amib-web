-- Tabla para gestionar los indicadores de la Market Bar
CREATE TABLE public.market_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL, -- Ej: S&P/BMV IPC
    symbol TEXT NOT NULL UNIQUE, -- Ej: ^MXX
    value TEXT NOT NULL, -- Valor actual
    trend NUMERIC DEFAULT 0, -- Porcentaje de cambio
    manual_override BOOLEAN DEFAULT TRUE, -- Si se actualiza manualmente o por API
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.market_indicators ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura (Público)
CREATE POLICY "Market indicators are viewable by everyone" 
ON public.market_indicators FOR SELECT USING (true);

-- Políticas de escritura (Solo admins autenticados)
CREATE POLICY "Only authenticated users can modify market indicators" 
ON public.market_indicators FOR ALL 
USING (auth.role() = 'authenticated');

-- Insertar datos iniciales
INSERT INTO public.market_indicators (label, symbol, value, trend, orden) VALUES
('S&P/BMV IPC', '^MXX', '55,420.12', 0.45, 1),
('USD/MXN', 'USDMXN=X', '17.12', -0.12, 2),
('BIVA', 'BIVA.MX', '1,142.30', 0.32, 3),
('CETES 28d', 'CETES', '11.25%', 0.00, 4);
