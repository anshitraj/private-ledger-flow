import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, Filter } from 'lucide-react';
import { ExpenseCard } from '@/components/ExpenseCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExpenseEvents } from '@/hooks/useEvents';
import { decryptWithFHE } from '@/lib/fhe';
import { downloadFromIPFS } from '@/lib/ipfs';
import { toast } from 'sonner';
import type { Expense } from '@/types/expense';

export default function Records() {
  const { t } = useTranslation();
  const { data: events = [], isLoading } = useExpenseEvents();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const expenses: Expense[] = events.map(event => ({
    id: event.submissionHash,
    amount: 0,
    currency: 'USD',
    category: 'misc',
    timestamp: event.timestamp,
    cid: event.cid,
    txHash: event.txHash,
    submissionHash: event.submissionHash,
    encrypted: true,
    status: 'attested',
  }));

  const filteredExpenses = categoryFilter === 'all'
    ? expenses
    : expenses.filter(e => e.category === categoryFilter);

  const handleDecrypt = async (expense: Expense) => {
    if (!expense.cid) return;

    try {
      toast.info('Decrypting expense...');
      
      // Download from IPFS
      const ciphertext = await downloadFromIPFS(expense.cid);
      
      // Decrypt with FHE (mock)
      const privateKey = 'mock_private_key'; // In production, get from keystore
      const decrypted = await decryptWithFHE(ciphertext, privateKey);
      
      toast.success(`Decrypted: ${decrypted.amount} ${decrypted.currency}`);
    } catch (error) {
      console.error('Decryption error:', error);
      toast.error('Failed to decrypt expense');
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('records.title')}
          </h1>
          <p className="text-muted-foreground">
            View all attested expenses on the blockchain
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t('records.filterCategory')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('records.allCategories')}</SelectItem>
              <SelectItem value="food">{t('expense.categories.food')}</SelectItem>
              <SelectItem value="travel">{t('expense.categories.travel')}</SelectItem>
              <SelectItem value="salary">{t('expense.categories.salary')}</SelectItem>
              <SelectItem value="shopping">{t('expense.categories.shopping')}</SelectItem>
              <SelectItem value="utilities">{t('expense.categories.utilities')}</SelectItem>
              <SelectItem value="misc">{t('expense.categories.misc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Records List */}
        {filteredExpenses.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t('records.noRecords')}
            description="No attested expenses found with the selected filters"
          />
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                showDecrypt
                onDecrypt={() => handleDecrypt(expense)}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
