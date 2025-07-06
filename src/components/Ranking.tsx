import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface UserRanking {
  user_id: string;
  full_name: string;
  total_points: number;
  completed_habits: number;
  streak_count: number;
  completed_tasks: number;
}

export function Ranking() {
  const [ranking, setRanking] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = async () => {
    try {
      // Get all users with their performance data
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name');

      if (!profiles) return;

      const rankingData: UserRanking[] = [];

      for (const profile of profiles) {
        // Get habits data
        const { data: habits } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', profile.user_id)
          .eq('is_active', true);

        // Get completed tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', profile.user_id)
          .eq('status', 'completed');

        const completedHabits = habits?.filter(h => 
          h.type === 'streak' ? h.streak_days >= h.target_value : h.current_value >= h.target_value
        ).length || 0;

        const totalStreak = habits?.reduce((sum, h) => sum + (h.streak_days || 0), 0) || 0;
        const completedTasks = tasks?.length || 0;

        // Calculate total points (custom scoring system)
        const totalPoints = (completedHabits * 50) + (totalStreak * 10) + (completedTasks * 25);

        rankingData.push({
          user_id: profile.user_id,
          full_name: profile.full_name || 'Usuário',
          total_points: totalPoints,
          completed_habits: completedHabits,
          streak_count: totalStreak,
          completed_tasks: completedTasks
        });
      }

      // Sort by total points
      rankingData.sort((a, b) => b.total_points - a.total_points);
      setRanking(rankingData);
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-primary" />;
      case 2:
        return <Medal className="w-6 h-6 text-primary/80" />;
      case 3:
        return <Award className="w-6 h-6 text-primary/60" />;
      default:
        return <TrendingUp className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getRankBadge = (position: number) => {
    switch (position) {
      case 1:
        return <Badge className="bg-gradient-gold text-primary-foreground font-bold">🏆 CAMPEÃO</Badge>;
      case 2:
        return <Badge variant="secondary" className="font-semibold">🥈 VICE</Badge>;
      case 3:
        return <Badge variant="outline" className="font-semibold">🥉 TERCEIRO</Badge>;
      default:
        return <Badge variant="outline">#{position}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            RANKING COMPETITIVO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Calculando ranking...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="w-6 h-6 text-primary" />
          RANKING COMPETITIVO
        </CardTitle>
        <CardDescription>
          Sistema de pontuação baseado em hábitos, sequências e tarefas concluídas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ranking.map((user, index) => (
          <div
            key={user.user_id}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
              index === 0 
                ? 'bg-gradient-gold/10 border-primary/30 shadow-gold' 
                : 'bg-card/50 border-border hover:bg-card/80'
            }`}
          >
            <div className="flex items-center gap-4">
              {getRankIcon(index + 1)}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{user.full_name}</h3>
                  {getRankBadge(index + 1)}
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>🎯 {user.completed_habits} hábitos</span>
                  <span>🔥 {user.streak_count} sequência</span>
                  <span>✅ {user.completed_tasks} tarefas</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {user.total_points}
              </div>
              <div className="text-xs text-muted-foreground">
                pontos
              </div>
            </div>
          </div>
        ))}
        
        {ranking.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado de ranking disponível ainda.</p>
            <p className="text-sm">Complete alguns hábitos para aparecer no ranking!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}