
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

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

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const completeTask = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (error) throw error;

      onUpdate();
      
      toast({
        title: "Tarefa concluída! 🎉",
        description: `"${task.title}" foi marcada como concluída.`
      });
    } catch (error: any) {
      toast({
        title: "Erro ao completar tarefa",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: 'in_progress' | 'cancelled') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (error) throw error;

      onUpdate();
      
      toast({
        title: "Tarefa atualizada",
        description: `Status alterado para: ${newStatus === 'in_progress' ? 'Em Progresso' : 'Cancelada'}`
      });
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

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'urgent':
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDueDate = () => {
    if (!task.due_date) return null;
    const date = new Date(task.due_date);
    const today = new Date();
    const isOverdue = date < today && task.status !== 'completed';
    
    return (
      <div className={`text-sm ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
        {isOverdue ? '⚠️ Venceu em: ' : '📅 Vence em: '}
        {date.toLocaleDateString('pt-BR')}
      </div>
    );
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {task.title}
              {getPriorityIcon()}
            </CardTitle>
            {task.description && (
              <CardDescription className="mt-1">{task.description}</CardDescription>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge 
            variant="secondary" 
            className={`${getPriorityColor()} text-white`}
          >
            {task.priority === 'urgent' ? 'Urgente' : 
             task.priority === 'high' ? 'Alta' :
             task.priority === 'medium' ? 'Média' : 'Baixa'}
          </Badge>
          
          {task.category && (
            <Badge variant="outline">
              {task.category}
            </Badge>
          )}
          
          {task.estimated_duration && (
            <Badge variant="outline">
              {task.estimated_duration}min
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {formatDueDate()}
        
        <div className="flex gap-2">
          {task.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStatus('in_progress')}
              disabled={loading}
              className="flex-1"
            >
              Iniciar
            </Button>
          )}
          
          <Button
            variant="hero"
            size="sm"
            onClick={completeTask}
            disabled={loading}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Concluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
