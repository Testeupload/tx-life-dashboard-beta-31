import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Target, Flame } from 'lucide-react';

interface HabitLog {
  id: string;
  habit_id: string;
  logged_date: string;
  value: number;
  habits: {
    name: string;
    icon: string;
    color: string;
  };
}

export function HabitCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [selectedDateLogs, setSelectedDateLogs] = useState<HabitLog[]>([]);
  const { user } = useAuth();

  const fetchHabitLogs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .select(`
          id,
          habit_id,
          logged_date,
          value,
          habits:habit_id (
            name,
            icon,
            color
          )
        `)
        .eq('user_id', user.id)
        .order('logged_date', { ascending: false })
        .limit(365);

      if (error) throw error;
      setHabitLogs(data || []);
    } catch (error) {
      console.error('Error fetching habit logs:', error);
    }
  };

  useEffect(() => {
    fetchHabitLogs();
  }, [user]);

  useEffect(() => {
    if (!date) {
      setSelectedDateLogs([]);
      return;
    }

    const dateString = format(date, 'yyyy-MM-dd');
    const logsForDate = habitLogs.filter(log => log.logged_date === dateString);
    setSelectedDateLogs(logsForDate);
  }, [date, habitLogs]);

  // Get unique dates with habit activities
  const getActivityDates = () => {
    const dates = new Set<string>();
    habitLogs.forEach(log => {
      if (log.value > 0) {
        dates.add(log.logged_date);
      }
    });
    return Array.from(dates).map(dateStr => parseISO(dateStr));
  };

  const activityDates = getActivityDates();

  // Custom day content to show activity indicators
  const dayContent = (day: Date) => {
    const dayString = format(day, 'yyyy-MM-dd');
    const dayLogs = habitLogs.filter(log => 
      log.logged_date === dayString && log.value > 0
    );
    
    const hasActivity = dayLogs.length > 0;
    const isCurrentDay = isToday(day);

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span className={`${isCurrentDay ? 'font-bold text-primary' : ''}`}>
          {day.getDate()}
        </span>
        {hasActivity && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
          </div>
        )}
      </div>
    );
  };

  const getActivitySummary = () => {
    const totalActiveDays = activityDates.length;
    const currentStreak = calculateCurrentStreak();
    const thisMonthActivity = activityDates.filter(date => 
      date.getMonth() === new Date().getMonth() && 
      date.getFullYear() === new Date().getFullYear()
    ).length;

    return { totalActiveDays, currentStreak, thisMonthActivity };
  };

  const calculateCurrentStreak = () => {
    if (activityDates.length === 0) return 0;
    
    const sortedDates = [...activityDates].sort((a, b) => b.getTime() - a.getTime());
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const { totalActiveDays, currentStreak, thisMonthActivity } = getActivitySummary();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{totalActiveDays}</div>
                <div className="text-sm text-muted-foreground">Dias Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{currentStreak}</div>
                <div className="text-sm text-muted-foreground">Sequência Atual</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{thisMonthActivity}</div>
                <div className="text-sm text-muted-foreground">Este Mês</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              CALENDÁRIO DE HÁBITOS
            </CardTitle>
            <CardDescription>
              Clique em uma data para ver os hábitos realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full"
              components={{
                DayContent: ({ date }) => dayContent(date)
              }}
              locale={ptBR}
            />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>
              {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione uma data'}
            </CardTitle>
            <CardDescription>
              {selectedDateLogs.length > 0 
                ? `${selectedDateLogs.length} atividade(s) registrada(s)`
                : 'Nenhuma atividade registrada'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateLogs.length > 0 ? (
              <div className="space-y-3">
                {selectedDateLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                    <span className="text-xl">{log.habits.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{log.habits.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.value > 0 ? 'Completado' : 'Não completado'}
                      </div>
                    </div>
                    <Badge 
                      variant={log.value > 0 ? "default" : "secondary"}
                      className={log.value > 0 ? "bg-gradient-gold" : ""}
                    >
                      {log.value > 0 ? '✓' : '✗'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma atividade registrada</p>
                <p className="text-sm">para esta data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}