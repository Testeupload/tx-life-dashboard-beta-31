
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  // Redirecionar usuários autenticados para o dashboard
  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/dashboard';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se usuário está logado, mostra loading enquanto redireciona
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecionando para o dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Hero Section */}
      <div className="container py-16 space-y-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight lg:text-6xl">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                TX Life
              </span>{' '}
              Dashboard
            </h1>
            <p className="text-xl text-muted-foreground lg:text-2xl max-w-3xl mx-auto">
              Controle seus hábitos, organize suas tarefas e alcance suas metas pessoais com um sistema inteligente e personalizado.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="hero" asChild>
              <a href="/auth">Começar Agora</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/auth">Já tenho conta</a>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          <Card className="shadow-card text-center">
            <CardHeader>
              <div className="text-4xl mb-2">🎯</div>
              <CardTitle>Metas Inteligentes</CardTitle>
              <CardDescription>
                Defina e acompanhe suas metas com sistema de streaks e progresso visual
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card text-center">
            <CardHeader>
              <div className="text-4xl mb-2">💧</div>
              <CardTitle>Lembretes Automáticos</CardTitle>
              <CardDescription>
                Receba lembretes personalizados para beber água e manter seus hábitos
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card text-center">
            <CardHeader>
              <div className="text-4xl mb-2">📚</div>
              <CardTitle>Controle de Estudos</CardTitle>
              <CardDescription>
                Monitore suas horas de estudo e mantenha a consistência
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card text-center">
            <CardHeader>
              <div className="text-4xl mb-2">🏆</div>
              <CardTitle>Sistema de Conquistas</CardTitle>
              <CardDescription>
                Comemore seus sucessos e mantenha a motivação alta
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center">Por que TX Life Dashboard?</h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="text-2xl">⚡</div>
              <h3 className="font-semibold">Rápido e Simples</h3>
              <p className="text-sm text-muted-foreground">
                Interface intuitiva para acompanhar seus hábitos em segundos
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-2xl">🔒</div>
              <h3 className="font-semibold">Privado e Seguro</h3>
              <p className="text-sm text-muted-foreground">
                Seus dados pessoais ficam protegidos e são apenas seus
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-2xl">📱</div>
              <h3 className="font-semibold">Sempre Atualizado</h3>
              <p className="text-sm text-muted-foreground">
                Sincronização em tempo real e acesso de qualquer dispositivo
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Pronto para transformar sua rotina?</h2>
          <Button size="lg" variant="hero" asChild>
            <a href="/auth">Criar Conta Gratuita</a>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container py-8 text-center">
          <p className="text-sm text-muted-foreground">
            TX Life Dashboard - Sistema privado de controle de hábitos e produtividade
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Desenvolvido com 💜 para ajudar você a alcançar seus objetivos
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
