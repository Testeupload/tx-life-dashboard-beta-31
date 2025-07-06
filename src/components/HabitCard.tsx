
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus } from 'lucide-react';

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
}

interface HabitCardProps {
  habit: Habit;
  onUpdate: () => void;
}

export function HabitCard({ habit, onUpdate }: HabitCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateHabitValue = async (increment: boolean) => {
    setLoading(true);
    try {
      let newValue = habit.current_value;
      let newStreak = habit.streak_days;
      
      if (increment) {
        newValue = Math.min(habit.current_value + 1, habit.target_value);
        if (habit.type === 'streak' && newValue > habit.current_value) {
          newStreak = habit.streak_days + 1;
        }
      } else {
        newValue = Math.max(habit.current_value - 1, 0);
      }

      const { error } = await supabase
        .from('habits')
        .update({ 
          current_value: newValue,
          streak_days: newStreak,
          best_streak: Math.max(newStreak, habit.best_streak)
        })
        .eq('id', habit.id);

      if (error) throw error;

      // Log the habit update
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('habit_logs')
          .insert({
            habit_id: habit.id,
            user_id: user.id,
            value: increment ? 1 : -1,
            logged_date: new Date().toISOString().split('T')[0]
          });
      }

      onUpdate();
      
      toast({
        title: "Hábito atualizado!",
        description: `${habit.name}: ${newValue}/${habit.target_value} ${habit.unit}`
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar hábito",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (habit.type === 'streak') {
      return Math.min((habit.streak_days / habit.target_value) * 100, 100);
    }
    return Math.min((habit.current_value / habit.target_value) * 100, 100);
  };

  const isCompleted = () => {
    if (habit.type === 'streak') {
      return habit.streak_days >= habit.target_value;
    }
    return habit.current_value >= habit.target_value;
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{habit.icon}</span>
            <div>
              <CardTitle className="text-lg">{habit.name}</CardTitle>
              <CardDescription className="text-sm">{habit.description}</CardDescription>
            </div>
          </div>
          {isCompleted() && (
            <span className="text-2xl">🏆</span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>
              {habit.type === 'streak' ? 
                `${habit.streak_days}/${habit.target_value} ${habit.unit}` :
                `${habit.current_value}/${habit.target_value} ${habit.unit}`
              }
            </span>
          </div>
          <Progress 
            value={getProgressPercentage()} 
            className="h-2"
            style={{ 
              backgroundColor: `${habit.color}20`,
            }}
          />
        </div>

        {habit.type === 'streak' && (
          <div className="text-center text-sm text-muted-foreground">
            <p>Sequência atual: <span className="font-medium text-foreground">{habit.streak_days} dias</span></p>
            <p>Melhor sequência: <span className="font-medium text-foreground">{habit.best_streak} dias</span></p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateHabitValue(false)}
            disabled={loading || habit.current_value <= 0}
            className="flex-1"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            variant="hero"
            size="sm"
            onClick={() => updateHabitValue(true)}
            disabled={loading || isCompleted()}
            className="flex-1"
            style={{ backgroundColor: habit.color }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
