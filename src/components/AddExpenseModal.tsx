import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Loader2, Plus, Lock, Upload, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { keccak256, toBytes } from 'viem';
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
import { CONTRACT_ADDRESS, CONTRACT_ABI, computeSubmissionHash } from '@/lib/contract';
import type { Expense } from '@/types/expense';

interface AddExpenseModalProps {
  onSuccess?: (expense: Expense) => void;
}

export function AddExpenseModal({ onSuccess }: AddExpenseModalProps) {
  const { t } = useTranslation();
  const { address } = useAccount();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'encrypting' | 'uploading' | 'attesting'>('form');

  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD' as 'INR' | 'USD' | 'EUR',
    category: 'misc' as Expense['category'],
    note: '',
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error(t('wallet.connect'));
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

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

      const { ciphertextBlob, ciphertextPreviewHash } = await encryptExpenseWithFHE(payload);
      toast.success(t('expense.encrypting'));

      // Step 2: Upload to IPFS
      setStep('uploading');
      const cid = await uploadToIPFS(ciphertextBlob);
      toast.success(t('expense.uploading'));

      // Step 3: Compute submission hash
      const submissionHash = computeSubmissionHash(cid);

      // Step 4: Attest on-chain
      setStep('attesting');
      
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'attestExpense',
        args: [submissionHash, cid],
      } as any);

      // Wait a moment for hash to be set
      setTimeout(() => {
        toast.success(t('expense.success'));
        
        // Create expense object for optimistic UI update
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
          txHash: hash || '0x...',
        };

        onSuccess?.(newExpense);

        // Reset form
        setFormData({
          amount: '',
          currency: 'USD',
          category: 'misc',
          note: '',
        });
        setOpen(false);
        setStep('form');
        setLoading(false);
      }, 1000);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-20 right-6 md:bottom-6 h-14 w-14 rounded-full bg-gradient-primary shadow-glow hover:scale-105 transition-transform z-40"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('expense.add')}</DialogTitle>
          <DialogDescription>
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
                onValueChange={(value: any) => setFormData({ ...formData, currency: value })}
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
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
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
            className="w-full bg-gradient-primary shadow-glow"
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
