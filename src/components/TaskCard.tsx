import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

const priorityConfig = {
  low: { label: 'Baixa', variant: 'secondary' as const, color: '#6B7280' },
  medium: { label: 'Média', variant: 'outline' as const, color: '#F59E0B' },
  high: { label: 'Alta', variant: 'destructive' as const, color: '#EF4444' },
  urgent: { label: 'Urgente', variant: 'destructive' as const, color: '#DC2626' }
};

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleStatusChange = async (completed: boolean) => {
    if (!user || loading) return;
    
    setLoading(true);
    try {
      const newStatus = completed ? 'completed' : 'pending';
      const completedAt = completed ? new Date().toISOString() : null;
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          completed_at: completedAt
        })
        .eq('id', task.id);

      if (error) throw error;

      toast({
        title: completed ? "✅ Tarefa concluída!" : "📝 Tarefa reaberta",
        description: task.title
      });
      
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar tarefa",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const isOverdue = () => {
    if (!task.due_date || task.status === 'completed') return false;
    return new Date(task.due_date) < new Date();
  };

  const isCompleted = task.status === 'completed';
  const priorityInfo = priorityConfig[task.priority];

  return (
    <Card className={`shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in ${
      isCompleted ? 'bg-success-light border-success/20' : ''
    } ${isOverdue() ? 'border-destructive/40' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleStatusChange}
            disabled={loading}
            className="mt-1"
          />
          <div className="flex-1 space-y-2">
            <CardTitle className={`text-lg leading-tight ${
              isCompleted ? 'line-through text-muted-foreground' : ''
            }`}>
              {task.title}
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={priorityInfo.variant} className="text-xs">
                {priorityInfo.label}
              </Badge>
              
              {task.category && (
                <Badge variant="outline" className="text-xs">
                  {task.category}
                </Badge>
              )}
              
              {task.estimated_duration && (
                <Badge variant="secondary" className="text-xs">
                  ⏱️ {formatDuration(task.estimated_duration)}
                </Badge>
              )}
              
              {isOverdue() && (
                <Badge variant="destructive" className="text-xs">
                  ⚠️ Atrasada
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {task.description && (
          <p className={`text-sm mb-3 ${
            isCompleted ? 'text-muted-foreground' : 'text-foreground'
          }`}>
            {task.description}
          </p>
        )}
        
        {task.due_date && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Prazo:</span>{' '}
            {format(new Date(task.due_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}