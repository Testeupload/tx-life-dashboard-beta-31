import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import heroImage from '@/assets/hero-dashboard.jpg';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Only allow specific hardcoded accounts
    const validAccounts = [
      { email: 'tx@gmail.com', password: 'tx' },
      { email: 'hx@gmail.com', password: 'hx' }
    ];

    const validAccount = validAccounts.find(
      acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
    );

    if (!validAccount) {
      toast({
        title: "Acesso Negado",
        description: "Credenciais inválidas. Sistema privado.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Erro no login",
        description: "Tente novamente em alguns segundos.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Acesso Autorizado",
        description: `Bem-vindo ${email.split('@')[0].toUpperCase()} 🔥`
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container flex min-h-screen items-center justify-center p-4">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Hero Section */}
          <div className="flex flex-col justify-center space-y-6 lg:pr-8">
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <div className="text-6xl mb-4">⚡</div>
                <h1 className="text-5xl font-bold tracking-tight lg:text-6xl">
                  <span className="bg-gradient-gold bg-clip-text text-transparent">
                    TX LIFE
                  </span>
                  <br />
                  <span className="text-2xl font-normal text-muted-foreground">
                    SISTEMA PRIVADO
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground mt-4">
                  Controle de hábitos profissional para alta performance.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                  🏆 <span>Ranking Competitivo</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                  📊 <span>Métricas Avançadas</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                  🎯 <span>Metas Inteligentes</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                  📅 <span>Calendário Integrado</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src={heroImage} 
                alt="TX Life Dashboard Preview" 
                className="w-full rounded-xl shadow-card border border-primary/20"
              />
            </div>
          </div>

          {/* Auth Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md shadow-card-hover border-primary/20">
              <CardHeader className="space-y-4 text-center">
                <div className="text-4xl">🔐</div>
                <CardTitle className="text-2xl">ACESSO RESTRITO</CardTitle>
                <CardDescription className="text-base">
                  Sistema privado - Apenas usuários autorizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-base font-medium">
                      Email Autorizado
                    </Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="tx@gmail.com"
                      required
                      disabled={loading}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-base font-medium">
                      Código de Acesso
                    </Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      className="h-12 text-base"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold" 
                    variant="hero"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        AUTENTICANDO...
                      </>
                    ) : (
                      'ACESSAR SISTEMA'
                    )}
                  </Button>
                  <div className="text-xs text-center text-muted-foreground space-y-1">
                    <p>🔒 Sistema de alta segurança</p>
                    <p>📈 Controle de performance profissional</p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}