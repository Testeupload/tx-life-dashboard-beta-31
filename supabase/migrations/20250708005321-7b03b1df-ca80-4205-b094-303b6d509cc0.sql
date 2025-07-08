-- Criar tabela de treinos
CREATE TABLE public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  scheduled_days TEXT[] NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  workout_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para workouts
CREATE POLICY "Users can view their own workouts" 
ON public.workouts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workouts" 
ON public.workouts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" 
ON public.workouts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" 
ON public.workouts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at nos workouts
CREATE TRIGGER update_workouts_updated_at
BEFORE UPDATE ON public.workouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela de séries
CREATE TABLE public.user_series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  series_name TEXT NOT NULL,
  current_season INTEGER NOT NULL DEFAULT 1,
  current_episode INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'watching',
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela user_series
ALTER TABLE public.user_series ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_series
CREATE POLICY "Users can view their own series" 
ON public.user_series 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own series" 
ON public.user_series 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own series" 
ON public.user_series 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own series" 
ON public.user_series 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at nas séries
CREATE TRIGGER update_user_series_updated_at
BEFORE UPDATE ON public.user_series
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela de chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para chat (apenas TX e HX podem acessar)
CREATE POLICY "Only TX and HX can view chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND full_name IN ('TX', 'HX')
  )
);

CREATE POLICY "Only TX and HX can create chat messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND full_name IN ('TX', 'HX')
  )
);

-- Criar índices para performance
CREATE INDEX idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX idx_workouts_workout_date ON public.workouts(workout_date);
CREATE INDEX idx_user_series_user_id ON public.user_series(user_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);