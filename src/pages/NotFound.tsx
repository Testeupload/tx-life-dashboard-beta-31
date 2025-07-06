
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center">
      <div className="container max-w-md">
        <Card className="shadow-card text-center">
          <CardHeader className="space-y-4">
            <div className="text-6xl">🤔</div>
            <CardTitle className="text-2xl">Página não encontrada</CardTitle>
            <CardDescription>
              A página que você está procurando não existe ou foi movida.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Erro 404 - Página não encontrada
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="hero" onClick={() => window.history.back()} className="flex-1">
                Voltar
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <a href="/">Início</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
