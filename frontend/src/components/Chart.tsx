import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ChartProps {
  data: Array<{ date: string; total: number }>;
  title?: string;
}

export function Chart({ data, title }: ChartProps) {
  const { t } = useTranslation();

  // Custom tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{ payload: { date: string; total: number } }>;
  }
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-yellow-500/30 bg-card/95 backdrop-blur p-3 shadow-gold">
          <p className="text-sm text-yellow-500/70">{payload[0].payload.date}</p>
          <p className="text-lg font-bold text-yellow-500">
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-yellow-500/20 bg-card/90 backdrop-blur glass">
      <CardHeader>
        <CardTitle className="text-lg text-yellow-500/90">
          {title || 'Expense Trend (Last 30 Days)'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(45 100% 55%)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(45 100% 55%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(45 100% 55% / 0.2)" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(45 30% 65%)"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(45 30% 65%)"
              fontSize={12}
            />
            <Tooltip 
              content={<CustomTooltip />}
              contentStyle={{
                backgroundColor: 'hsl(0 0% 8%)',
                border: '1px solid hsl(45 100% 55% / 0.3)',
                borderRadius: '0.5rem',
              }}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(45 100% 55%)" 
              strokeWidth={2}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
