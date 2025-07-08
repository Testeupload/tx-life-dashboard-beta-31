import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { WorkoutCard } from './WorkoutCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Dumbbell, Calendar } from 'lucide-react';

interface Workout {
  id: string;
  name: string;
  scheduled_days: string[];
  completed_at: string | null;
  workout_date: string;
  notes: string | null;
  user_id: string;
}

const WORKOUT_DAYS = [
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' }
];

export function WorkoutSchedule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['tuesday', 'thursday', 'saturday', 'sunday']);

  const fetchWorkouts = async () => {
    if (!user) return;

    try {
      // Buscar treinos da semana atual
      const startOfWeek = new Date();
      const dayOfWeek = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajustar para segunda-feira
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .gte('workout_date', startOfWeek.toISOString().split('T')[0])
        .lte('workout_date', endOfWeek.toISOString().split('T')[0])
        .order('workout_date', { ascending: true });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar treinos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createWeeklyWorkouts = async () => {
    if (!user || !newWorkoutName.trim() || selectedDays.length === 0) return;

    try {
      // Criar treinos para a semana atual
      const today = new Date();
      const currentWeekStart = new Date(today);
      const dayOfWeek = currentWeekStart.getDay();
      const diff = currentWeekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      currentWeekStart.setDate(diff);

      const dayMap = {
        'tuesday': 2,
        'thursday': 4,
        'saturday': 6,
        'sunday': 0
      };

      const workoutsToCreate = selectedDays.map(day => {
        const workoutDate = new Date(currentWeekStart);
        const targetDay = dayMap[day as keyof typeof dayMap];
        
        if (targetDay === 0) { // Domingo
          workoutDate.setDate(currentWeekStart.getDate() + 6);
        } else {
          workoutDate.setDate(currentWeekStart.getDate() + targetDay - 1);
        }

        return {
          user_id: user.id,
          name: newWorkoutName.trim(),
          scheduled_days: selectedDays,
          workout_date: workoutDate.toISOString().split('T')[0]
        };
      });

      const { error } = await supabase
        .from('workouts')
        .insert(workoutsToCreate);

      if (error) throw error;

      toast({
        title: "💪 Treinos Criados!",
        description: `${newWorkoutName} foi agendado para ${selectedDays.length} dias da semana.`
      });

      setNewWorkoutName('');
      setDialogOpen(false);
      fetchWorkouts();
    } catch (error: any) {
      toast({
        title: "Erro ao criar treinos",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user]);

  const getWeekStats = () => {
    const completed = workouts.filter(w => w.completed_at).length;
    const total = workouts.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const stats = getWeekStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Dumbbell className="mx-auto h-8 w-8 animate-pulse text-primary" />
          <p className="text-muted-foreground">Carregando treinos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Dumbbell className="text-primary" />
            TREINOS DA SEMANA
          </h2>
          <p className="text-muted-foreground mt-1">
            Ter • Qui • Sáb • Dom - Mantenha a disciplina em dia
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              NOVO TREINO
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Treino</DialogTitle>
              <DialogDescription>
                Configure um novo treino semanal para os dias programados
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Treino</label>
                <Input
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  placeholder="Ex: Treino de Força, Cardio, etc..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-3 block">Dias da Semana</label>
                <div className="space-y-2">
                  {WORKOUT_DAYS.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.value}
                        checked={selectedDays.includes(day.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDays([...selectedDays, day.value]);
                          } else {
                            setSelectedDays(selectedDays.filter(d => d !== day.value));
                          }
                        }}
                      />
                      <label htmlFor={day.value} className="text-sm font-medium">
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={createWeeklyWorkouts}
                disabled={!newWorkoutName.trim() || selectedDays.length === 0}
                className="w-full"
              >
                Criar Treinos da Semana
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats da Semana */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">TREINOS PROGRAMADOS</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-6 h-6 text-success" />
              <div>
                <div className="text-2xl font-bold text-success">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">CONCLUÍDOS</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-gold flex items-center justify-center text-black font-bold text-sm">
                %
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{stats.percentage}%</div>
                <div className="text-sm text-muted-foreground">CONCLUSÃO</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Treinos */}
      {workouts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {workouts.map((workout) => (
            <WorkoutCard 
              key={workout.id} 
              workout={workout} 
              onUpdate={fetchWorkouts}
            />
          ))}
        </div>
      ) : (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              🏋️ Nenhum Treino Programado
            </CardTitle>
            <CardDescription className="text-base">
              Crie seu primeiro treino semanal para começar a treinar com disciplina.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              CRIAR PRIMEIRO TREINO
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}