
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HabitCard } from '@/components/HabitCard';
import { TaskCard } from '@/components/TaskCard';
import { Ranking } from '@/components/Ranking';
import { HabitCalendar } from '@/components/HabitCalendar';
import { WorkoutSchedule } from '@/components/WorkoutSchedule';
import { SeriesTracker } from '@/components/SeriesTracker';
import { GlobalChat } from '@/components/GlobalChat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogOut, Trophy, Calendar, Target, Flame } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <header className="border-b border-primary/20 bg-card/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <h1 className="text-3xl font-bold">
                <span className="bg-gradient-gold bg-clip-text text-transparent">
                  TX LIFE
                </span>
              </h1>
            </div>
            <div className="hidden sm:block">
              <p className="text-base font-medium">
                {getGreeting()}, <span className="text-primary font-bold">{user?.user_metadata?.full_name || 'OPERADOR'}</span>
              </p>
            </div>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="lg" className="gap-2">
            <LogOut className="w-4 h-4" />
            SAIR
          </Button>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="shadow-card bg-gradient-gold/10 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Target className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-3xl font-bold text-primary">{getHabitsProgress()}%</div>
                  <div className="text-sm font-medium">CONCLUSÃO DIÁRIA</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Calendar className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-3xl font-bold">{tasks.length}</div>
                  <div className="text-sm font-medium">TAREFAS ATIVAS</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Flame className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-3xl font-bold">
                    {Math.max(...habits.map(h => h.streak_days), 0)}
                  </div>
                  <div className="text-sm font-medium">SEQUÊNCIA ATUAL</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Trophy className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-3xl font-bold">
                    {habits.filter(h => h.current_value >= h.target_value || h.streak_days >= h.target_value).length}
                  </div>
                  <div className="text-sm font-medium">HÁBITOS CONCLUÍDOS</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 h-14 p-1 bg-card/50">
            <TabsTrigger value="dashboard" className="text-sm font-semibold">
              🏠 DASHBOARD
            </TabsTrigger>
            <TabsTrigger value="workouts" className="text-sm font-semibold">
              💪 TREINOS
            </TabsTrigger>
            <TabsTrigger value="series" className="text-sm font-semibold">
              📺 SÉRIES
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-sm font-semibold">
              💬 CHAT
            </TabsTrigger>
            <TabsTrigger value="ranking" className="text-sm font-semibold">  
              🏆 RANKING
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-sm font-semibold">
              📅 CALENDÁRIO
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-sm font-semibold">
              📊 RELATÓRIOS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="space-y-8">
              {/* Hábitos */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                    <span className="text-primary">🎯</span>
                    HÁBITOS ATIVOS
                  </h2>
                </div>
                
                {habits.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                      <CardTitle className="text-2xl">Sistema Inicializando</CardTitle>
                      <CardDescription className="text-base">
                        Configurando hábitos padrão para sua conta...
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="hero" onClick={fetchData} size="lg">
                        ATUALIZAR SISTEMA
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </section>

              {/* Tarefas */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                    <span className="text-primary">📋</span>
                    TAREFAS PRIORITÁRIAS
                  </h2>
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
                      <CardTitle className="text-2xl flex items-center gap-2">
                        ✅ Todas as Tarefas Concluídas
                      </CardTitle>
                      <CardDescription className="text-base">
                        Excelente trabalho! Nenhuma tarefa pendente no momento.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </section>
            </div>
          </TabsContent>

          <TabsContent value="workouts">
            <WorkoutSchedule />
          </TabsContent>

          <TabsContent value="series">
            <SeriesTracker />
          </TabsContent>

          <TabsContent value="chat">
            <GlobalChat />
          </TabsContent>

          <TabsContent value="ranking">
            <Ranking />
          </TabsContent>

          <TabsContent value="calendar">
            <HabitCalendar />
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  📊 RELATÓRIOS AVANÇADOS
                </CardTitle>
                <CardDescription className="text-base">
                  Análise detalhada de performance e tendências
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Performance Semanal</h3>
                    <div className="h-32 bg-card/50 rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground">Gráfico em desenvolvimento</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Comparativo Mensal</h3>
                    <div className="h-32 bg-card/50 rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground">Gráfico em desenvolvimento</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Status */}
        <footer className="text-center py-8 border-t border-primary/20">
          <div className="space-y-3">
            <p className="text-lg font-bold text-primary">
              TX LIFE SYSTEM - OPERACIONAL
            </p>
            <p className="text-sm text-muted-foreground">
              Sistema privado de alta performance • Última sincronização: {new Date().toLocaleTimeString('pt-BR')}
            </p>
            <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground">
              <span>🔒 Segurança Ativa</span>
              <span>📊 Dados Sincronizados</span>
              <span>⚡ Performance Otimizada</span>
            </div>
            <div className="pt-2 border-t border-primary/10">
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-bold">Site desenvolvido por TX</span> • Sistema exclusivo para alta performance
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
