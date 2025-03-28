import { useState, useEffect } from "react";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import WelcomeScreen from "@/components/welcome-screen";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  BookCopy, 
  PlusCircle, 
  CoinsIcon,
  MoreVertical, 
  Trash, 
  PlusSquare, 
  LogOut,
  AlertTriangle,
  Network
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AddPortfolioDialog } from "../components/portfolio/add-portfolio-dialog";
import AddAssetDialog from "../components/portfolio/add-asset-dialog";
import PortfolioOverviewSummary from "../components/portfolio/portfolio-overview-summary";
import { TransferAssetDialog } from "../components/portfolio/transfer-asset-dialog";
import { ConnectEnsWalletDialog } from "../components/portfolio/connect-ens-wallet-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const { 
    portfolios, 
    activePortfolio, 
    setActivePortfolio, 
    isLoading, 
    deletePortfolio, 
    disconnect 
  } = usePortfolio();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [portfoliosWithData, setPortfoliosWithData] = useState<ExtendedPortfolio[]>([]);
  const [isLoadingPortfolios, setIsLoadingPortfolios] = useState(true);
  const [_, navigate] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isEnsDialogOpen, setIsEnsDialogOpen] = useState(false);
  const [portfolioToAction, setPortfolioToAction] = useState<ExtendedPortfolio | null>(null);
  
  // Function to load portfolio overview data
  const loadPortfolioData = async () => {
    if (portfolios.length === 0) return;
    
    setIsLoadingPortfolios(true);
    try {
      const updatedPortfolios = await Promise.all(
        portfolios.map(async (portfolio) => {
          try {
            const response = await fetch(`/api/portfolios/${portfolio.id}/overview`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const overview = await response.json();
            const assetsResponse = await fetch(`/api/portfolios/${portfolio.id}/assets`);
            let assetCount = 0;
            
            if (assetsResponse.ok) {
              const assets = await assetsResponse.json();
              assetCount = assets.length;
            }
            
            return {
              ...portfolio,
              totalValue: overview.totalValue || 0,
              assetCount: assetCount || 0
            } as ExtendedPortfolio;
          } catch (error) {
            console.error(`Error loading data for portfolio ${portfolio.id}:`, error);
            return {
              ...portfolio,
              totalValue: 0,
              assetCount: 0
            } as ExtendedPortfolio;
          }
        })
      );
      
      setPortfoliosWithData(updatedPortfolios);
    } catch (error) {
      console.error("Error loading portfolio data:", error);
    } finally {
      setIsLoadingPortfolios(false);
    }
  };
  
  // Load data when portfolios change
  useEffect(() => {
    if (portfolios.length > 0) {
      loadPortfolioData();
    }
  }, [portfolios]);
  
  // If no portfolios exist, show welcome screen
  if (portfolios.length === 0) {
    return <WelcomeScreen />;
  }

  const manualPortfolios = portfoliosWithData.filter(p => !p.isEns);
  const ensPortfolios = portfoliosWithData.filter(p => p.isEns);

  // Calculate total value across all portfolios
  const totalPortfolioValue = portfoliosWithData.reduce((sum, portfolio) => {
    return sum + (portfolio.totalValue || 0);
  }, 0);

  // Function to view portfolio details
  const handleViewPortfolio = (e: React.MouseEvent, portfolioId: number) => {
    e.stopPropagation();
    setActivePortfolio(portfolioId);
    // If we're already on the correct portfolio detail page, don't do anything
    navigate(`/portfolios/${portfolioId}`);
  };
  
  const handleAddAsset = (portfolioId?: number) => {
    if (portfolioId) {
      // Impostiamo il portfolio attivo e attendiamo un breve timeout prima di aprire il dialogo
      setActivePortfolio(portfolioId);
      setTimeout(() => {
        setIsAddAssetDialogOpen(true);
      }, 100); // Piccolo ritardo per garantire che il portfolio attivo sia impostato
    } else if (activePortfolio) {
      // Se c'è già un portfolio attivo, assicuriamoci che sia correttamente impostato
      setActivePortfolio(activePortfolio.id);
      setTimeout(() => {
        setIsAddAssetDialogOpen(true);
      }, 100); // Piccolo ritardo per garantire che il portfolio attivo sia impostato
    } else {
      toast({
        title: "No active portfolio",
        description: "Select a portfolio first to add assets",
        variant: "destructive",
      });
    }
  };
  
  // Gestisce il click sul menu a tre puntini per evitare propagazione al card
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  // Apre il dialogo di conferma per l'eliminazione
  const handleDeleteClick = (e: React.MouseEvent, portfolio: ExtendedPortfolio) => {
    e.stopPropagation();
    setPortfolioToAction(portfolio);
    setShowDeleteDialog(true);
  };
  
  // Apre il dialogo di conferma per la disconnessione
  const handleDisconnectClick = (e: React.MouseEvent, portfolio: ExtendedPortfolio) => {
    e.stopPropagation();
    setPortfolioToAction(portfolio);
    setShowDisconnectDialog(true);
  };
  
  // Delete effettivamente il portfolio
  const confirmDelete = async () => {
    if (!portfolioToAction) return;
    
    try {
      await deletePortfolio(portfolioToAction.id);
      toast({
        title: "Portfolio deleted",
        description: `The portfolio "${portfolioToAction.name}" has been successfully deleted.`
      });
    } catch (error) {
      console.error("Error during portfolio deletion:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the portfolio.",
        variant: "destructive"
      });
    } finally {
      setShowDeleteDialog(false);
      setPortfolioToAction(null);
    }
  };
  
  // Disconnette effettivamente il wallet ENS
  const confirmDisconnect = async () => {
    if (!portfolioToAction) return;
    
    try {
      // Prima elimina il portfolio, poi disconnetti
      await deletePortfolio(portfolioToAction.id);
      
      // Aggiorna anche lo stato locale
      disconnect();
      
      toast({
        title: "Wallet disconnected",
        description: `The wallet "${portfolioToAction.name}" has been successfully disconnected.`
      });
    } catch (error) {
      console.error("Error during wallet disconnection:", error);
      toast({
        title: "Error",
        description: "An error occurred while disconnecting the wallet.",
        variant: "destructive"
      });
    } finally {
      setShowDisconnectDialog(false);
      setPortfolioToAction(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Portfolios</h1>
          <p className="text-muted-foreground">
            Manage and view all your cryptocurrency portfolios
          </p>
        </div>
        <div className="flex space-x-2">
          {activePortfolio && (
            <>
              <Button onClick={() => handleAddAsset()} variant="outline">
                <CoinsIcon className="mr-2 h-4 w-4" />
                Add Asset
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
                  Transfer Asset
                </Button>
              )}
            </>
          )}
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Portfolio
          </Button>
          <Button onClick={() => setIsEnsDialogOpen(true)} variant="outline">
            <Network className="mr-2 h-4 w-4" />
            Connect ENS Wallet
          </Button>
        </div>
      </div>
      
      {/* Riepilogo dettagliato */}
      <PortfolioOverviewSummary />
      
      {manualPortfolios.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Wallet className="mr-2 h-5 w-5" /> 
            Manual Portfolios
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
                      <div>
                        <CardTitle>{portfolio.name}</CardTitle>
                        <CardDescription>
                          Created on {portfolio.createdAt 
                            ? new Date(portfolio.createdAt).toLocaleDateString() 
                            : 'date not available'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {activePortfolio?.id === portfolio.id && (
                          <Badge variant="default">Active</Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                handleMenuClick(e);
                                handleAddAsset(portfolio.id);
                              }}
                            >
                              <PlusSquare className="mr-2 h-4 w-4" />
                              <span>Add Asset</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => handleDeleteClick(e, portfolio)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete Portfolio</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPortfolios ? (
                      <>
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-4 w-16" />
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          {formatCurrency(extendedPortfolio.totalValue || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {extendedPortfolio.assetCount || 0} asset
                        </p>
                      </>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="ghost" 
                      className="w-full" 
                      onClick={(e) => handleViewPortfolio(e, portfolio.id)}
                    >
                      View Details
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
            ENS Wallets
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
                      <div>
                        <CardTitle>{portfolio.name}</CardTitle>
                        <CardDescription>
                          {portfolio.ensName || portfolio.walletAddress?.substring(0, 10) + '...'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {activePortfolio?.id === portfolio.id && (
                          <Badge variant="default">Active</Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => handleDisconnectClick(e, portfolio)}
                              className="text-red-600"
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>Disconnect Wallet</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPortfolios ? (
                      <>
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-4 w-16" />
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          {formatCurrency(extendedPortfolio.totalValue || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {extendedPortfolio.assetCount || 0} asset
                        </p>
                      </>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="ghost" 
                      className="w-full" 
                      onClick={(e) => handleViewPortfolio(e, portfolio.id)}
                    >
                      View Details
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
      
      {/* Dialogo di conferma per eliminare il portfolio */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this portfolio?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the portfolio "{portfolioToAction?.name}" 
              and all its assets and transactions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Confirmation dialog for disconnecting ENS wallet */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect this wallet?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to disconnect the wallet "{portfolioToAction?.name}". 
              You can reconnect it at any time. Your data will be removed from the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDisconnect}
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Dialog for connecting ENS wallet with includeInSummary option */}
      <ConnectEnsWalletDialog
        open={isEnsDialogOpen}
        onOpenChange={setIsEnsDialogOpen}
      />
    </div>
  );
};

export default Portfolios;