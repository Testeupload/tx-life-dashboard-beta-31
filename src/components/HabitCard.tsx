import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
  const { user } = useAuth();
  const { toast } = useToast();

  const getProgressPercentage = () => {
    if (habit.type === 'streak') {
      return Math.min((habit.streak_days / habit.target_value) * 100, 100);
    }
    return Math.min((habit.current_value / habit.target_value) * 100, 100);
  };

  const handleIncrement = async () => {
    if (!user || loading) return;
    
    setLoading(true);
    try {
      // Registrar log do hábito para hoje
      const { error: logError } = await supabase
        .from('habit_logs')
        .upsert({
          habit_id: habit.id,
          user_id: user.id,
          value: 1,
          logged_date: new Date().toISOString().split('T')[0]
        }, {
          onConflict: 'habit_id,logged_date'
        });

      if (logError) throw logError;

      // Atualizar o hábito
      let updateData: any = {};
      
      if (habit.type === 'daily_goal') {
        updateData.current_value = habit.current_value + 1;
      } else if (habit.type === 'streak') {
        const newStreak = habit.streak_days + 1;
        updateData.streak_days = newStreak;
        updateData.best_streak = Math.max(newStreak, habit.best_streak);
      } else if (habit.type === 'counter') {
        updateData.current_value = habit.current_value + 1;
      }

      const { error: updateError } = await supabase
        .from('habits')
        .update(updateData)
        .eq('id', habit.id);

      if (updateError) throw updateError;

      toast({
        title: "Progresso registrado! 🎉",
        description: `${habit.icon} ${habit.name} atualizado com sucesso.`
      });
      
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao registrar progresso",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetDaily = async () => {
    if (!user || loading || habit.type !== 'daily_goal') return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('habits')
        .update({ current_value: 0 })
        .eq('id', habit.id);

      if (error) throw error;

      toast({
        title: "Meta diária resetada",
        description: `${habit.icon} ${habit.name} foi resetado para amanhã.`
      });
      
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao resetar meta",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl" role="img" aria-label={habit.name}>
              {habit.icon}
            </span>
            {habit.name}
          </CardTitle>
          {habit.type === 'streak' && (
            <Badge variant="secondary" className="font-mono">
              {habit.streak_days} dias
            </Badge>
          )}
        </div>
        {habit.description && (
          <p className="text-sm text-muted-foreground">{habit.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progresso</span>
            <span>
              {habit.type === 'streak' 
                ? `${habit.streak_days}/${habit.target_value} ${habit.unit}`
                : `${habit.current_value}/${habit.target_value} ${habit.unit}`
              }
            </span>
          </div>
          <Progress 
            value={getProgressPercentage()} 
            className="h-2"
            style={{ 
              background: `linear-gradient(to right, ${habit.color}20, transparent)` 
            }}
          />
        </div>

        {habit.type === 'streak' && habit.best_streak > 0 && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Melhor sequência:</span> {habit.best_streak} dias 🏆
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleIncrement}
            disabled={loading}
            variant={getProgressPercentage() >= 100 ? "success" : "default"}
            className="flex-1"
          >
            {loading ? "..." : habit.type === 'streak' ? '+1 Dia' : `+1 ${habit.unit}`}
          </Button>
          
          {habit.type === 'daily_goal' && habit.current_value > 0 && (
            <Button 
              onClick={resetDaily}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}