
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HabitCard } from '@/components/HabitCard';
import { TaskCard } from '@/components/TaskCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  description: string;
  type: 'counter' | 'streak' | 'daily_goal';
  target_value: number;
  current_value: number;
  streak_days: number;
  best_streak: number;
  unit: string;
  icon: string;
  color: string;
  user_id: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string;
  estimated_duration: number;
}

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Proteção de rota - redirecionar para auth se não estiver logado
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/auth';
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching data for user:', user.id);
      
      // Buscar hábitos
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (habitsError) {
        console.error('Habits error:', habitsError);
        throw habitsError;
      }

      // Buscar tarefas pendentes e em progresso
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'in_progress'])
        .order('due_date', { ascending: true });

      if (tasksError) {
        console.error('Tasks error:', tasksError);
        throw tasksError;
      }

      console.log('Fetched habits:', habitsData?.length || 0);
      console.log('Fetched tasks:', tasksData?.length || 0);
      
      setHabits((habitsData as Habit[]) || []);
      setTasks((tasksData as Task[]) || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo! 👋"
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getHabitsProgress = () => {
    if (habits.length === 0) return 0;
    const completed = habits.filter(habit => {
      if (habit.type === 'streak') {
        return habit.streak_days >= habit.target_value;
      }
      return habit.current_value >= habit.target_value;
    }).length;
    return Math.round((completed / habits.length) * 100);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                TX Life
              </span>
            </h1>
            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground">
                {getGreeting()}, <span className="font-medium">{user?.user_metadata?.full_name || 'Usuário'}</span>!
              </p>
            </div>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            Sair
          </Button>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {/* Resumo Geral */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hábitos de Hoje</CardTitle>
              <span className="text-2xl">🎯</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getHabitsProgress()}%</div>
              <p className="text-xs text-muted-foreground">
                {habits.filter(h => h.current_value >= h.target_value || h.streak_days >= h.target_value).length} de {habits.length} completos
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
              <span className="text-2xl">📝</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length} alta prioridade
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sequência Atual</CardTitle>
              <span className="text-2xl">🔥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.max(...habits.map(h => h.streak_days), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                dias consecutivos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hábitos */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Meus Hábitos</h2>
          </div>
          
          {habits.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {habits.map((habit) => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  onUpdate={fetchData}
                />
              ))}
            </div>
          ) : (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Seus hábitos estão sendo criados!</CardTitle>
                <CardDescription>
                  Estamos configurando seus hábitos padrão. Recarregue a página em alguns segundos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="hero" onClick={fetchData}>
                  Atualizar Dados
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Tarefas */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Tarefas de Hoje</h2>
          </div>
          
          {tasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {tasks.slice(0, 6).map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onUpdate={fetchData}
                />
              ))}
            </div>
          ) : (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Nenhuma tarefa pendente</CardTitle>
                <CardDescription>
                  Ótimo! Você não tem tarefas pendentes no momento. 🎉
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </section>

        {/* Lembretes */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Lembretes Ativos</h2>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💧 Lembrete de Água
              </CardTitle>
              <CardDescription>
                Você será lembrado de beber água a cada hora durante o dia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sistema de lembretes configurado e ativo para seus hábitos!
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Rodapé */}
        <footer className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            TX Life Dashboard - Sistema privado de controle de hábitos e produtividade
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Dados atualizados em tempo real • Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </p>
        </footer>
      </div>
    </div>
  );
}
