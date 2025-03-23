import { useState } from "react";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import WelcomeScreen from "@/components/welcome-screen";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, BookCopy, PlusCircle, CoinsIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AddPortfolioDialog } from "../components/portfolio/add-portfolio-dialog";
import AddAssetDialog from "../components/portfolio/add-asset-dialog";
import PortfolioOverviewSummary from "../components/portfolio/portfolio-overview-summary";
import { TransferAssetDialog } from "../components/portfolio/transfer-asset-dialog";

// Define type with runtime properties
type ExtendedPortfolio = {
  id: number;
  name: string;
  userId: number | null;
  walletAddress: string | null;
  isEns: boolean | null;
  ensName: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  // Runtime properties added by API
  totalValue?: number;
  assetCount?: number;
};

const Portfolios = () => {
  const { portfolios, activePortfolio, setActivePortfolio, isLoading } = usePortfolio();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [_, navigate] = useLocation();
  
  // If no portfolios exist, show welcome screen
  if (portfolios.length === 0) {
    return <WelcomeScreen />;
  }
  
  const manualPortfolios = portfolios.filter(p => !p.isEns);
  const ensPortfolios = portfolios.filter(p => p.isEns);

  // Calculate total value across all portfolios - using a default value of 0 for missing data
  const totalPortfolioValue = portfolios.reduce((sum, portfolio) => {
    const extendedPortfolio = portfolio as ExtendedPortfolio;
    return sum + (extendedPortfolio.totalValue || 0);
  }, 0);

  // Funzione per visualizzare i dettagli del portfolio
  const handleViewPortfolio = (e: React.MouseEvent, portfolioId: number) => {
    e.stopPropagation();
    setActivePortfolio(portfolioId);
    // Se siamo già alla pagina del dettaglio del portfolio corretto, non fare nulla
    navigate(`/portfolios/${portfolioId}`);
  };
  
  const handleAddAsset = () => {
    if (activePortfolio) {
      setIsAddAssetDialogOpen(true);
    } else {
      toast({
        title: "Nessun portfolio attivo",
        description: "Seleziona prima un portfolio per aggiungere asset",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">I tuoi Portfolio</h1>
          <p className="text-muted-foreground">
            Gestisci e visualizza tutti i tuoi portfolio di criptovalute
          </p>
        </div>
        <div className="flex space-x-2">
          {activePortfolio && (
            <>
              <Button onClick={handleAddAsset} variant="outline">
                <CoinsIcon className="mr-2 h-4 w-4" />
                Aggiungi Asset
              </Button>
              
              {portfolios.length > 1 && (
                <Button 
                  variant="outline"
                  onClick={() => setIsTransferDialogOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M18 8L22 12L18 16" />
                    <path d="M2 12H22" />
                  </svg>
                  Trasferisci Asset
                </Button>
              )}
            </>
          )}
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuovo Portfolio
          </Button>
        </div>
      </div>
      
      {/* Riepilogo dettagliato */}
      <PortfolioOverviewSummary />
      
      {manualPortfolios.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Wallet className="mr-2 h-5 w-5" /> 
            Portfolio Manuali
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {manualPortfolios.map(portfolio => {
              const extendedPortfolio = portfolio as ExtendedPortfolio;
              return (
                <Card 
                  key={portfolio.id} 
                  className={`hover:shadow-md transition-all cursor-pointer ${
                    activePortfolio?.id === portfolio.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setActivePortfolio(portfolio.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{portfolio.name}</CardTitle>
                      {activePortfolio?.id === portfolio.id && (
                        <Badge variant="default" className="ml-2">Attivo</Badge>
                      )}
                    </div>
                    <CardDescription>
                      Creato il {portfolio.createdAt 
                        ? new Date(portfolio.createdAt).toLocaleDateString() 
                        : 'data non disponibile'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(extendedPortfolio.totalValue || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {extendedPortfolio.assetCount || 0} asset
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="ghost" 
                      className="w-full" 
                      onClick={(e) => handleViewPortfolio(e, portfolio.id)}
                    >
                      Visualizza Dettagli
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      
      {ensPortfolios.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BookCopy className="mr-2 h-5 w-5" /> 
            Wallet ENS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ensPortfolios.map(portfolio => {
              const extendedPortfolio = portfolio as ExtendedPortfolio;
              return (
                <Card 
                  key={portfolio.id} 
                  className={`hover:shadow-md transition-all cursor-pointer ${
                    activePortfolio?.id === portfolio.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setActivePortfolio(portfolio.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{portfolio.name}</CardTitle>
                      {activePortfolio?.id === portfolio.id && (
                        <Badge variant="default" className="ml-2">Attivo</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {portfolio.ensName || portfolio.walletAddress?.substring(0, 10) + '...'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(extendedPortfolio.totalValue || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {extendedPortfolio.assetCount || 0} asset
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="ghost" 
                      className="w-full" 
                      onClick={(e) => handleViewPortfolio(e, portfolio.id)}
                    >
                      Visualizza Dettagli
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      
      <AddPortfolioDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      
      <AddAssetDialog 
        open={isAddAssetDialogOpen}
        onOpenChange={setIsAddAssetDialogOpen}
      />
      
      <TransferAssetDialog 
        open={isTransferDialogOpen} 
        onOpenChange={setIsTransferDialogOpen} 
        initialAssetId={selectedAssetId || undefined}
      />
    </div>
  );
};

export default Portfolios;