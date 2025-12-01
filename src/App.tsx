import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from './config/wagmi';
import './i18n/config';
import { Header } from './components/Header';
import { LeftNav } from './components/LeftNav';
import { BottomNav } from './components/BottomNav';
import Index from "./pages/Index";
import Records from "./pages/Records";
import Verify from "./pages/Verify";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider theme={darkTheme()}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col w-full">
              <Header />
              <div className="flex flex-1 w-full">
                <LeftNav />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/records" element={<Records />} />
                    <Route path="/verify" element={<Verify />} />
                    <Route path="/verify/:cid" element={<Verify />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/admin" element={<Admin />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
              <BottomNav />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
