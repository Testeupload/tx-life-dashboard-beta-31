import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import heroImage from '@/assets/hero-dashboard.jpg';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se já estiver logado, não mostrar esta página (será redirecionado)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="container flex min-h-screen items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Hero Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  TX Life
                </span>{' '}
                Dashboard
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Sistema privado e completo para controle de hábitos, metas pessoais e organização de tarefas
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <div className="text-3xl">🎯</div>
                <p className="text-sm font-medium">Metas Inteligentes</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">💧</div>
                <p className="text-sm font-medium">Lembretes de Água</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">📚</div>
                <p className="text-sm font-medium">Controle de Estudos</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">🏆</div>
                <p className="text-sm font-medium">Sistema de Conquistas</p>
              </div>
            </div>

            {/* Hero Image */}
            <div className="max-w-3xl mx-auto">
              <img 
                src={heroImage} 
                alt="TX Life Dashboard Preview" 
                className="w-full rounded-xl shadow-card-hover animate-fade-in"
              />
            </div>
          </div>

          {/* CTA Section */}
          <Card className="max-w-md mx-auto shadow-card-hover">
            <CardHeader>
              <CardTitle className="text-2xl">Acesso Privado</CardTitle>
              <CardDescription>
                Sistema exclusivo para controle pessoal de hábitos e produtividade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button 
                  variant="hero" 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="w-full"
                >
                  Acessar Dashboard
                </Button>
                <p className="text-xs text-muted-foreground">
                  Controle total sobre seus dados • Sistema 100% privado
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl">🔒</span>
              </div>
              <h3 className="font-semibold">100% Privado</h3>
              <p className="text-sm text-muted-foreground">
                Seus dados ficam seguros e apenas você tem acesso
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="font-semibold">Tempo Real</h3>
              <p className="text-sm text-muted-foreground">
                Atualizações instantâneas e sincronização automática
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="font-semibold">Metas Precisas</h3>
              <p className="text-sm text-muted-foreground">
                Controle detalhado de hábitos e progresso pessoal
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              TX Life Dashboard - By TX • Sistema privado de produtividade
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Index;