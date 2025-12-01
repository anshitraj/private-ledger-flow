import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Lock, Upload, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { keccak256, toBytes, hexToBytes } from 'viem';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { encryptExpenseWithFHE } from '@/lib/fhe';
import { uploadToIPFS } from '@/lib/ipfs';
import { CONTRACT_ADDRESS, CONTRACT_ABI, computeSubmissionHash, SEPOLIA_CHAIN_ID } from '@/lib/contract';
import type { Expense } from '@/types/expense';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface AddExpenseModalProps {
  onSuccess?: (expense: Expense) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddExpenseModal({ onSuccess, open: controlledOpen, onOpenChange }: AddExpenseModalProps) {
  const { t } = useTranslation();
  const { address } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'encrypting' | 'uploading' | 'attesting'>('form');
  const [pendingExpense, setPendingExpense] = useState<Expense | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD' as 'INR' | 'USD' | 'EUR',
    category: 'misc' as Expense['category'],
    note: '',
  });

  const { writeContract, data: hash, isPending: isWriting } = useWriteContract();
  const { isLoading: isConfirming, data: receipt } = useWaitForTransactionReceipt({ hash });
  
  // Track when hash becomes available and update pending expense
  // Use refs to prevent duplicate processing and avoid dependency loops
  const hashProcessedRef = useRef<string | null>(null);
  const pendingExpenseRef = useRef<Expense | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    pendingExpenseRef.current = pendingExpense;
  }, [pendingExpense]);
  
  useEffect(() => {
    if (hash && pendingExpenseRef.current && hash !== hashProcessedRef.current) {
      console.log('📝 [CONTRACT] Transaction hash received:', hash);
      hashProcessedRef.current = hash;
      const updatedExpense = { ...pendingExpenseRef.current, txHash: hash };
      setPendingExpense(updatedExpense);
      onSuccess?.(updatedExpense);
    }
  }, [hash]); // Only depend on hash
  
  // Update UI when transaction is confirmed
  const receiptProcessedRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (receipt && receipt.transactionHash !== receiptProcessedRef.current) {
      console.log('✅ [CONTRACT] Transaction confirmed:', receipt.transactionHash);
      receiptProcessedRef.current = receipt.transactionHash;
      
      // Use ref to get latest pendingExpense without dependency
      const currentPending = pendingExpenseRef.current;
      if (currentPending && hash === receipt.transactionHash) {
        const confirmedExpense = { 
          ...currentPending, 
          txHash: receipt.transactionHash,
          status: 'attested' as const
        };
        
        // Save to backend database
        const saveToBackend = async () => {
          try {
            console.log('💾 [BACKEND] Saving expense to database:', confirmedExpense.cid);
            console.log('💾 [BACKEND] Backend URL:', BACKEND_URL);
            console.log('💾 [BACKEND] Request payload:', {
              userAddress: address,
              cid: confirmedExpense.cid,
              submissionHash: confirmedExpense.submissionHash,
              txHash: receipt.transactionHash,
              blockNumber: receipt.blockNumber?.toString() || null,
              category: confirmedExpense.category,
              note: confirmedExpense.note || null,
              timestamp: confirmedExpense.timestamp,
            });
            
            const response = await fetch(`${BACKEND_URL}/api/records`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userAddress: address,
                cid: confirmedExpense.cid,
                submissionHash: confirmedExpense.submissionHash,
                txHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber?.toString() || null,
                category: confirmedExpense.category,
                note: confirmedExpense.note || null,
                timestamp: confirmedExpense.timestamp,
              }),
            });
            
            console.log('💾 [BACKEND] Response status:', response.status);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('❌ [BACKEND] Error response:', errorText);
              throw new Error(`Backend error: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log('✅ [BACKEND] Expense saved to database:', result);
            
            // Invalidate and refetch records to show new expense immediately
            await queryClient.invalidateQueries({ queryKey: ['backend-records'] });
            
            toast.success('Transaction confirmed and saved!');
          } catch (error: any) {
            console.error('❌ [BACKEND] Failed to save expense:', error);
            console.error('❌ [BACKEND] Error details:', {
              message: error.message,
              stack: error.stack,
              backendUrl: BACKEND_URL,
            });
            
            // Show error to user so they know something went wrong
            toast.error(`Failed to save to database: ${error.message}. Check console for details.`);
            
            // Still invalidate to refetch in case it was saved
            queryClient.invalidateQueries({ queryKey: ['backend-records'] });
          }
        };
        
        saveToBackend();
        onSuccess?.(confirmedExpense);
      }
      
      // Clear pending expense (refs will be reset when modal closes or new transaction starts)
      setPendingExpense(null);
      
      setStep('form');
      setLoading(false);
      setOpen(false);
    }
  }, [receipt, hash, address]); // Only depend on receipt, hash, and address

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error(t('wallet.connect'));
      return;
    }

    // Verify chain ID is Sepolia
    if (chainId !== SEPOLIA_CHAIN_ID) {
      toast.error(`Please switch to Sepolia network (Chain ID: ${SEPOLIA_CHAIN_ID}). Current chain: ${chainId}`);
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    
    // Reset refs for new transaction
    hashProcessedRef.current = null;
    receiptProcessedRef.current = null;

    try {
      // Step 1: Encrypt expense
      setStep('encrypting');
      const payload = {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        category: formData.category,
        note: formData.note,
        timestamp: Date.now(),
      };

      const { ciphertextBlob, ciphertextPreviewHash, fheHandle, inputProof, usesFHE } = await encryptExpenseWithFHE(
        payload,
        CONTRACT_ADDRESS,
        address
      );
      toast.success(t('expense.encrypting'));

      // Step 2: Upload to IPFS
      setStep('uploading');
      const cid = await uploadToIPFS(ciphertextBlob);
      toast.success(t('expense.uploading'));

      // Step 3: Compute submission hash
      const submissionHash = computeSubmissionHash(cid);

      // Step 4: Attest on-chain
      setStep('attesting');
      
      // If we have FHE handle and inputProof, use storeEncryptedAmount (real FHE)
      // Otherwise, use attestExpense (fallback for mock encryption)
      if (usesFHE && fheHandle && inputProof) {
        console.log('📝 [CONTRACT] Using FHE: Calling storeEncryptedAmount with handle and inputProof');
        console.log('📝 [CONTRACT] Handle type:', typeof fheHandle);
        console.log('📝 [CONTRACT] InputProof length:', inputProof.length);
        
        // Convert handle to bytes format for contract
        // The handle can be string, Uint8Array, or object - convert to hex string bytes
        let handleBytes: `0x${string}`;
        if (typeof fheHandle === 'string') {
          // If it's already a hex string, use it; otherwise encode it
          if (fheHandle.startsWith('0x')) {
            handleBytes = fheHandle as `0x${string}`;
          } else {
            handleBytes = `0x${Buffer.from(fheHandle, 'utf-8').toString('hex')}` as `0x${string}`;
          }
        } else if (fheHandle instanceof Uint8Array) {
          handleBytes = `0x${Buffer.from(fheHandle).toString('hex')}` as `0x${string}`;
        } else if (typeof fheHandle === 'object') {
          // Convert object to JSON string, then to bytes
          const jsonStr = JSON.stringify(fheHandle);
          handleBytes = `0x${Buffer.from(jsonStr, 'utf-8').toString('hex')}` as `0x${string}`;
        } else {
          handleBytes = `0x${Buffer.from(String(fheHandle), 'utf-8').toString('hex')}` as `0x${string}`;
        }
        
        // Convert inputProof to bytes (it should already be a string/hex)
        const attestationBytes: `0x${string}` = inputProof.startsWith('0x') 
          ? inputProof as `0x${string}`
          : `0x${Buffer.from(inputProof, 'utf-8').toString('hex')}` as `0x${string}`;
        
        console.log('📝 [CONTRACT] Calling storeEncryptedAmount:', {
          handleBytesLength: handleBytes.length,
          attestationBytesLength: attestationBytes.length,
        });
        
        // Call storeEncryptedAmount with handle and attestation
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'storeEncryptedAmount',
          args: [handleBytes, attestationBytes],
          gas: BigInt(1000000), // FHE operations need more gas
        } as Parameters<typeof writeContract>[0]);
        
        toast.success('FHE transaction submitted! Storing encrypted amount on-chain...');
      } else {
        // Fallback: Use attestExpense for mock encryption or when FHE fails
        console.log('📝 [CONTRACT] Using fallback: Calling attestExpense (mock encryption)');
        
        // Prepare metadata (empty bytes as hex)
        const txMeta = '0x' as `0x${string}`;
        
        console.log('📝 [CONTRACT] Submitting attestation:', {
          cid,
          submissionHash,
        });
        
        // Call writeContract (fires async, hash comes via hook)
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'attestExpense',
          args: [submissionHash, cid, txMeta],
          gas: BigInt(500000),
        } as Parameters<typeof writeContract>[0]);
        
        toast.success('Transaction submitted! Waiting for confirmation...');
      }
      
      toast.success('Transaction submitted! Waiting for confirmation...');
      
      // Create expense object for optimistic UI update (hash will be updated via useEffect)
      const newExpense: Expense = {
        id: Date.now().toString(),
        amount: payload.amount,
        currency: payload.currency,
        category: payload.category,
        note: payload.note,
        timestamp: payload.timestamp,
        cid,
        submissionHash,
        encrypted: true,
        status: 'pending',
        txHash: 'pending', // Will be updated when hash is available
      };

      // Store pending expense, will be updated with hash via useEffect
      setPendingExpense(newExpense);
      
      // Call onSuccess immediately for optimistic update
      onSuccess?.(newExpense);

      // Reset form
      setFormData({
        amount: '',
        currency: 'USD',
        category: 'misc',
        note: '',
      });
      
      setLoading(false);

    } catch (error) {
      console.error('Error submitting expense:', error);
      toast.error(t('expense.error'));
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'encrypting':
        return <Lock className="h-5 w-5 animate-pulse" />;
      case 'uploading':
        return <Upload className="h-5 w-5 animate-pulse" />;
      case 'attesting':
        return <CheckCircle2 className="h-5 w-5 animate-pulse" />;
      default:
        return <Plus className="h-5 w-5" />;
    }
  };

  const getStepLabel = () => {
    switch (step) {
      case 'encrypting':
        return t('expense.encrypting');
      case 'uploading':
        return t('expense.uploading');
      case 'attesting':
        return t('expense.attesting');
      default:
        return t('expense.submit');
    }
  };

  // Reset refs when modal closes
  useEffect(() => {
    if (!open) {
      hashProcessedRef.current = null;
      receiptProcessedRef.current = null;
      pendingExpenseRef.current = null;
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Floating action button removed - now controlled from Dashboard */}
      <DialogContent className="sm:max-w-[500px] border-yellow-500/20 bg-card/95 backdrop-blur glass">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-yellow-500 to-amber-400 bg-clip-text text-transparent">{t('expense.add')}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Your expense will be encrypted with FHE and attested on Sepolia
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t('expense.amount')}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">{t('expense.currency')}</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: string) => setFormData({ ...formData, currency: value })}
                disabled={loading}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t('expense.category')}</Label>
              <Select
                value={formData.category}
                onValueChange={(value: string) => setFormData({ ...formData, category: value })}
                disabled={loading}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">{t('expense.categories.food')}</SelectItem>
                  <SelectItem value="travel">{t('expense.categories.travel')}</SelectItem>
                  <SelectItem value="salary">{t('expense.categories.salary')}</SelectItem>
                  <SelectItem value="shopping">{t('expense.categories.shopping')}</SelectItem>
                  <SelectItem value="utilities">{t('expense.categories.utilities')}</SelectItem>
                  <SelectItem value="misc">{t('expense.categories.misc')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">{t('expense.note')}</Label>
            <Textarea
              id="note"
              placeholder="Add a note..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold shadow-gold hover:shadow-gold hover:scale-[1.02] transition-all border border-yellow-400/30"
            disabled={loading || isConfirming}
            size="lg"
          >
            {loading || isConfirming ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {getStepLabel()}
              </>
            ) : (
              <>
                {getStepIcon()}
                <span className="ml-2">{getStepLabel()}</span>
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
