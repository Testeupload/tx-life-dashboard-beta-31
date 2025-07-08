import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Calendar, Check, Clock, Edit } from 'lucide-react';

interface Workout {
  id: string;
  name: string;
  scheduled_days: string[];
  completed_at: string | null;
  workout_date: string;
  notes: string | null;
  user_id: string;
}

interface WorkoutCardProps {
  workout: Workout;
  onUpdate: () => void;
}

export function WorkoutCard({ workout, onUpdate }: WorkoutCardProps) {
  const { toast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);
  const [notes, setNotes] = useState(workout.notes || '');
  const [editingNotes, setEditingNotes] = useState(false);

  const isCompleted = !!workout.completed_at;
  const isToday = new Date(workout.workout_date).toDateString() === new Date().toDateString();

  const getDayName = (dayCode: string) => {
    const days = {
      'tuesday': 'TER',
      'thursday': 'QUI',
      'saturday': 'SÁB',
      'sunday': 'DOM'
    };
    return days[dayCode as keyof typeof days] || dayCode.toUpperCase();
  };

  const completeWorkout = async () => {
    setIsCompleting(true);
    try {
      const { error } = await supabase
        .from('workouts')
        .update({ 
          completed_at: new Date().toISOString(),
          notes: notes || null
        })
        .eq('id', workout.id);

      if (error) throw error;

      toast({
        title: "💪 Treino Concluído!",
        description: `${workout.name} foi marcado como concluído.`
      });
      
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao concluir treino",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const updateNotes = async () => {
    try {
      const { error } = await supabase
        .from('workouts')
        .update({ notes })
        .eq('id', workout.id);

      if (error) throw error;

      toast({
        title: "📝 Notas atualizadas",
        description: "Suas observações foram salvas."
      });
      
      setEditingNotes(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar notas",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className={`shadow-card transition-all duration-300 ${isCompleted ? 'bg-success-light border-success' : isToday ? 'border-primary bg-primary/5' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dumbbell className={`w-6 h-6 ${isCompleted ? 'text-success' : 'text-primary'}`} />
            <div>
              <CardTitle className="text-lg">{workout.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {new Date(workout.workout_date).toLocaleDateString('pt-BR')}
                {isToday && <Badge variant="secondary" className="text-xs">HOJE</Badge>}
              </CardDescription>
            </div>
          </div>
          {isCompleted && <Check className="w-6 h-6 text-success" />}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1">
          {workout.scheduled_days.map((day) => (
            <Badge key={day} variant="outline" className="text-xs">
              {getDayName(day)}
            </Badge>
          ))}
        </div>

        {(notes || editingNotes) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Observações:</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingNotes(!editingNotes)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione suas observações sobre o treino..."
                  className="min-h-20"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={updateNotes}>Salvar</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingNotes(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded">
                {notes || "Nenhuma observação"}
              </p>
            )}
          </div>
        )}

        {!isCompleted && (
          <Button 
            onClick={completeWorkout}
            disabled={isCompleting}
            className="w-full gap-2"
            variant={isToday ? "default" : "outline"}
          >
            {isCompleting ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isCompleting ? 'Concluindo...' : 'Marcar como Concluído'}
          </Button>
        )}

        {isCompleted && (
          <div className="text-center text-sm text-success font-medium">
            ✅ Concluído em {new Date(workout.completed_at!).toLocaleString('pt-BR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}