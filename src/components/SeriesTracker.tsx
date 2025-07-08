import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Tv, Star, Play, Pause, CheckCircle, Edit } from 'lucide-react';

interface Series {
  id: string;
  series_name: string;
  current_season: number;
  current_episode: number;
  status: string;
  rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function SeriesTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  
  // Form states
  const [seriesName, setSeriesName] = useState('');
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [status, setStatus] = useState('watching');
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const fetchSeries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_series')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSeries(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar séries",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSeriesName('');
    setCurrentSeason(1);
    setCurrentEpisode(1);
    setStatus('watching');
    setRating(null);
    setNotes('');
    setEditingSeries(null);
  };

  const openEditDialog = (series: Series) => {
    setSeriesName(series.series_name);
    setCurrentSeason(series.current_season);
    setCurrentEpisode(series.current_episode);
    setStatus(series.status);
    setRating(series.rating);
    setNotes(series.notes || '');
    setEditingSeries(series);
    setDialogOpen(true);
  };

  const saveSeries = async () => {
    if (!user || !seriesName.trim()) return;

    try {
      const seriesData = {
        user_id: user.id,
        series_name: seriesName.trim(),
        current_season: currentSeason,
        current_episode: currentEpisode,
        status,
        rating,
        notes: notes.trim() || null
      };

      if (editingSeries) {
        const { error } = await supabase
          .from('user_series')
          .update(seriesData)
          .eq('id', editingSeries.id);

        if (error) throw error;

        toast({
          title: "📺 Série Atualizada!",
          description: `${seriesName} foi atualizada com sucesso.`
        });
      } else {
        const { error } = await supabase
          .from('user_series')
          .insert([seriesData]);

        if (error) throw error;

        toast({
          title: "📺 Série Adicionada!",
          description: `${seriesName} foi adicionada à sua lista.`
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchSeries();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar série",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteSeries = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_series')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "🗑️ Série Removida",
        description: "A série foi removida da sua lista."
      });

      fetchSeries();
    } catch (error: any) {
      toast({
        title: "Erro ao remover série",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchSeries();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'watching': return <Play className="w-4 h-4 text-primary" />;
      case 'paused': return <Pause className="w-4 h-4 text-warning" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-success" />;
      default: return <Tv className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'watching': return 'Assistindo';
      case 'paused': return 'Pausada';
      case 'completed': return 'Concluída';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watching': return 'default';
      case 'paused': return 'secondary';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Tv className="mx-auto h-8 w-8 animate-pulse text-primary" />
          <p className="text-muted-foreground">Carregando suas séries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Tv className="text-primary" />
            SÉRIES EM ACOMPANHAMENTO
          </h2>
          <p className="text-muted-foreground mt-1">
            Controle suas séries, temporadas e episódios
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              ADICIONAR SÉRIE
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSeries ? 'Editar Série' : 'Adicionar Nova Série'}
              </DialogTitle>
              <DialogDescription>
                {editingSeries ? 'Atualize as informações da série' : 'Adicione uma nova série à sua lista de acompanhamento'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome da Série</label>
                <Input
                  value={seriesName}
                  onChange={(e) => setSeriesName(e.target.value)}
                  placeholder="Ex: The Walking Dead, Breaking Bad..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Temporada</label>
                  <Input
                    type="number"
                    min="1"
                    value={currentSeason}
                    onChange={(e) => setCurrentSeason(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Episódio</label>
                  <Input
                    type="number"
                    min="1"
                    value={currentEpisode}
                    onChange={(e) => setCurrentEpisode(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="watching">Assistindo</SelectItem>
                    <SelectItem value="paused">Pausada</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Avaliação (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={rating || ''}
                  onChange={(e) => setRating(e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Suas impressões sobre a série..."
                  className="min-h-20"
                />
              </div>

              <Button 
                onClick={saveSeries}
                disabled={!seriesName.trim()}
                className="w-full"
              >
                {editingSeries ? 'Atualizar Série' : 'Adicionar Série'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Séries */}
      {series.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {series.map((item) => (
            <Card key={item.id} className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <CardTitle className="text-lg">{item.series_name}</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(item)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>
                  T{item.current_season} • E{item.current_episode}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={getStatusColor(item.status) as any}>
                    {getStatusLabel(item.status)}
                  </Badge>
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{item.rating}/10</span>
                    </div>
                  )}
                </div>

                {item.notes && (
                  <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded">
                    {item.notes}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(item)}
                    className="flex-1"
                  >
                    Atualizar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteSeries(item.id)}
                  >
                    Remover
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  Atualizado em {new Date(item.updated_at).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              📺 Nenhuma Série Adicionada
            </CardTitle>
            <CardDescription className="text-base">
              Comece adicionando suas séries favoritas para acompanhar o progresso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              ADICIONAR PRIMEIRA SÉRIE
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}