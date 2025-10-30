import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, FileText, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpenseCard } from '@/components/ExpenseCard';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { EmptyState } from '@/components/EmptyState';
import { Chart } from '@/components/Chart';
import { useExpenseEvents } from '@/hooks/useEvents';
import type { Expense } from '@/types/expense';

export default function Dashboard() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const { data: events = [], isLoading } = useExpenseEvents();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Convert events to expenses
  useEffect(() => {
    const convertedExpenses: Expense[] = events.map(event => ({
      id: event.submissionHash,
      amount: 0, // encrypted, not visible
      currency: 'USD',
      category: 'misc',
      timestamp: event.timestamp,
      cid: event.cid,
      txHash: event.txHash,
      submissionHash: event.submissionHash,
      encrypted: true,
      status: 'attested',
    }));
    setExpenses(convertedExpenses);
  }, [events]);

  const handleAddExpense = (newExpense: Expense) => {
    setExpenses(prev => [newExpense, ...prev]);
  };

  // Generate mock chart data
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    total: Math.floor(Math.random() * 1000) + 500,
  }));

  const stats = [
    {
      title: t('dashboard.totalExpenses'),
      value: '••••',
      icon: Wallet,
      description: t('dashboard.encrypted'),
      gradient: 'from-purple-500 to-blue-500',
    },
    {
      title: t('dashboard.monthlyTotal'),
      value: '••••',
      icon: TrendingUp,
      description: t('dashboard.encrypted'),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: t('dashboard.recordCount'),
      value: expenses.length.toString(),
      icon: FileText,
      description: t('dashboard.attested'),
      gradient: 'from-cyan-500 to-teal-500',
    },
  ];

  if (!isConnected) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <EmptyState
          icon={Wallet}
          title={t('wallet.connect')}
          description="Connect your wallet to view and manage your encrypted expenses"
          action={{
            label: t('wallet.connect'),
            onClick: () => {}, // RainbowKit handles this
          }}
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
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground">
            Track your private expenses with homomorphic encryption
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <div className="mb-8">
          <Chart data={chartData} />
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{t('dashboard.recentTransactions')}</h2>
          </div>

          {expenses.length === 0 && !isLoading ? (
            <EmptyState
              icon={FileText}
              title={t('dashboard.noData')}
              description={t('dashboard.noDataDesc')}
              action={{
                label: t('dashboard.addExpense'),
                onClick: () => setShowAddModal(true),
              }}
            />
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 10).map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <AddExpenseModal onSuccess={handleAddExpense} />
    </div>
  );
}
