import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Shield, Database, TrendingUp, Lock, Unlock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { useBackendRecords } from '@/hooks/useBackendRecords';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function Admin() {
  const { t } = useTranslation();
  const { address } = useAccount();
  const { data: backendRecords = [], isLoading } = useBackendRecords();
  const [encryptedTotal, setEncryptedTotal] = useState<string | null>(null);
  const [decryptedTotal, setDecryptedTotal] = useState<number | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // In production, check if address is contract deployer
  const isAdmin = true; // Mock for demo

  const handleComputeAggregate = async () => {
    setIsComputing(true);
    toast.info('Computing homomorphic aggregate...');
    
    try {
      // Call backend coprocessor endpoint
      const response = await fetch(`${BACKEND_URL}/api/coproc/aggregate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cids: backendRecords.map(r => r.cid)
        }),
      });

      const result = await response.json();
      
      console.log('📊 [ADMIN] Coprocessor result:', result);
      console.log('📊 [ADMIN] Result keys:', Object.keys(result));
      
      if (result.success) {
        // Store the encrypted total - check all possible field names
        // Backend returns: { success: true, outputCiphertext: "...", meta: {...} }
        const totalDisplay = result.outputCiphertext || result.encryptedTotal || result.resultCiphertext || result.encryptedSum || null;
        
        console.log('📊 [ADMIN] Extracted totalDisplay:', totalDisplay ? totalDisplay.substring(0, 50) + '...' : 'null');
        
        if (totalDisplay) {
          setEncryptedTotal(totalDisplay);
          console.log('✅ [ADMIN] Encrypted total set successfully');
          toast.success(`Aggregate computed: ${totalDisplay.length} chars encrypted`);
        } else {
          console.warn('⚠️ [ADMIN] No encrypted total found in result');
          console.warn('⚠️ [ADMIN] Available keys:', Object.keys(result));
          // Try to show meta info if available
          if (result.meta) {
            setEncryptedTotal(`Computed (${result.meta.itemsCount} items)`);
            toast.success(`Aggregate computed: ${result.meta.itemsCount} items processed`);
          } else {
            toast.warning('Computed but no encrypted value returned');
          }
        }
      } else {
        throw new Error(result.error || 'Aggregation failed');
      }
    } catch (error: any) {
      console.error('Aggregation error:', error);
      toast.error(`Failed to compute aggregate: ${error.message || 'Unknown error'}`);
    } finally {
      setIsComputing(false);
    }
  };

  const handleDecryptTotal = async () => {
    if (!encryptedTotal) {
      toast.error('No encrypted total to decrypt. Compute encrypted total first.');
      return;
    }

    setIsDecrypting(true);
    toast.info('Decrypting total...');

    try {
      // The encrypted total from coprocessor is base64-encoded JSON
      // For mock coprocessor: {"value":6072,"type":"euint64"}
      // For real FHE: would need to use Zama SDK to decrypt
      
      try {
        // Try to decode as base64 JSON (mock coprocessor format)
        const decoded = atob(encryptedTotal);
        const parsed = JSON.parse(decoded);
        
        if (parsed.value !== undefined && typeof parsed.value === 'number') {
          setDecryptedTotal(parsed.value);
          toast.success(`Decrypted total: ${parsed.value.toLocaleString()}`);
          return;
        }
      } catch (e) {
        console.log('Not base64 JSON, trying FHE decryption...');
      }

      // If not base64 JSON, try FHE decryption
      // Convert base64 string to Uint8Array
      const ciphertextBytes = Uint8Array.from(atob(encryptedTotal), c => c.charCodeAt(0));
      
      // For real FHE decryption, you would use:
      // const decrypted = await decryptWithFHE(ciphertextBytes);
      // But for now, if it's not the mock format, show an error
      
      toast.warning('Real FHE decryption requires Zama SDK. Mock coprocessor returns plain values.');
      
    } catch (error: any) {
      console.error('Decryption error:', error);
      toast.error(`Failed to decrypt: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDecrypting(false);
    }
  };

  if (!address) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <EmptyState
          icon={Shield}
          title="Access Restricted"
          description="Connect your wallet to access admin functions"
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <EmptyState
          icon={Shield}
          title="Unauthorized"
          description="Only the contract deployer can access this page"
        />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 bg-clip-text text-transparent">
            {t('nav.admin')}
          </h1>
          <p className="text-muted-foreground">
            Administrative functions and system overview
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="border-yellow-500/20 bg-card/90 backdrop-blur glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-500/90">
                <Database className="h-4 w-4 text-yellow-500" />
                Total Attestations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{backendRecords.length}</div>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20 bg-card/90 backdrop-blur glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-500/90">
                <TrendingUp className="h-4 w-4 text-yellow-500" />
                Encrypted Sum
              </CardTitle>
            </CardHeader>
            <CardContent>
              {encryptedTotal ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
                      <Lock className="h-5 w-5 flex-shrink-0" />
                      <span className="font-mono break-all text-sm">
                        {typeof encryptedTotal === 'string' && encryptedTotal.length > 30 
                          ? `${encryptedTotal.slice(0, 20)}...${encryptedTotal.slice(-10)}`
                          : encryptedTotal}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Encrypted total (FHE) • {typeof encryptedTotal === 'string' ? `${encryptedTotal.length} chars` : 'Computed'}
                    </p>
                  </div>
                  
                  {decryptedTotal !== null && (
                    <div className="pt-3 border-t border-yellow-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Unlock className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-500">Decrypted Total:</span>
                      </div>
                      <div className="text-3xl font-bold text-green-500">
                        {decryptedTotal.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-yellow-500/60">••••</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Compute Encrypted Total" to calculate
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20 bg-card/90 backdrop-blur glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-500/90">
                <Shield className="h-4 w-4 text-yellow-500" />
                Unique Submitters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">
                {new Set(backendRecords.map(r => r.userAddress)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="border-yellow-500/20 bg-card/90 backdrop-blur glass mb-8">
          <CardHeader>
            <CardTitle className="text-yellow-500/90">Homomorphic Computation</CardTitle>
            <CardDescription>
              Compute aggregate statistics over encrypted data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button
                onClick={handleComputeAggregate}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold shadow-gold hover:shadow-gold border border-yellow-400/30"
                disabled={backendRecords.length === 0 || isLoading || isComputing}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                {isComputing ? 'Computing...' : 'Compute Encrypted Total'}
              </Button>
              
              <Button
                onClick={handleDecryptTotal}
                variant="outline"
                className="flex-1 border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500/50"
                disabled={!encryptedTotal || isDecrypting}
              >
                <Unlock className="mr-2 h-4 w-4" />
                {isDecrypting ? 'Decrypting...' : 'Decrypt Total'}
              </Button>
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-semibold mb-2">Coprocessor Integration</h4>
              <p className="text-sm text-muted-foreground mb-4">
                To enable real homomorphic computation, deploy a coprocessor endpoint that:
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Accepts an array of encrypted values (ciphertexts)</li>
                <li>Performs homomorphic addition using Zama FHE SDK</li>
                <li>Returns the encrypted sum without decryption</li>
              </ol>
              <p className="text-sm text-muted-foreground mt-4">
                Backend endpoint: <code className="bg-muted px-1 rounded">/api/coproc/aggregate</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* All CIDs */}
        <Card className="border-yellow-500/20 bg-card/90 backdrop-blur glass">
          <CardHeader>
            <CardTitle className="text-yellow-500/90">All Attestations</CardTitle>
            <CardDescription>
              Complete list of attested CIDs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading attestations...
                </div>
              ) : backendRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No attestations found
                </div>
              ) : (
                backendRecords.map((record, i) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <code className="text-sm font-mono truncate block">
                        {record.cid}
                      </code>
                      <p className="text-xs text-muted-foreground mt-1">
                        {record.blockNumber ? `Block ${record.blockNumber} • ` : ''}
                        {new Date(record.timestamp).toLocaleString()} • {record.userAddress.slice(0, 10)}...
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      #{i + 1}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
