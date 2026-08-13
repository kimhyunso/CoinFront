import { useState, useEffect } from 'react';
import { useSubscription } from '@apollo/client/react';
import { gql } from 'graphql-tag';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { CoinPrice } from '../types';

const PRICE_SUBSCRIPTION = gql`
  subscription PriceUpdated($symbol: String!) {
    priceUpdated(symbol: $symbol) {
      symbol
      price
      changePercent
      timestamp
    }
  }
`;

interface PriceSubscriptionData {
  priceUpdated: CoinPrice;
}

interface ChartPoint {
  time: string;
  price: number;
}

interface PriceChartProps {
  symbol: string;
}

const MAX_POINTS = 30;

export default function PriceChart({ symbol }: PriceChartProps) {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  const { data } = useSubscription<PriceSubscriptionData>(PRICE_SUBSCRIPTION, {
    variables: { symbol },
  });

  useEffect(() => {
    if (!data?.priceUpdated) return;

    const { price, timestamp } = data.priceUpdated;
    const time = new Date(parseInt(timestamp)).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setChartData(prev => {
      const next = [...prev, { time, price: parseFloat(price) }];
      return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
    });
  }, [data]);

  const isPositive =
    chartData.length >= 2
      ? chartData[chartData.length - 1].price >= chartData[0].price
      : true;

  const strokeColor = isPositive ? '#34d399' : '#f87171';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-semibold text-xl">{symbol}</h2>
          <p className="text-gray-500 text-sm mt-0.5">실시간 가격 차트</p>
        </div>
        {chartData.length > 0 && (
          <p className="text-white text-2xl font-bold">
            ${chartData[chartData.length - 1].price.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        )}
      </div>

      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-600">
          데이터 수신 중...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(v: number) =>
                `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
              }
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(v: number) => [
                `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                '가격',
              ]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
