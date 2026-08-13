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
    setChartData([]);
  }, [symbol]);

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

  const strokeColor = isPositive ? '#00BCD4' : '#f87171';

  return (
    <div className="bg-white border border-[#BDBDBD] rounded-xl p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[#212121] font-semibold text-lg">{symbol}</h2>
          <p className="text-[#757575] text-xs mt-0.5">실시간 가격 차트</p>
        </div>
        {chartData.length > 0 && (
          <div className="text-right">
            <p className="text-[#212121] text-2xl font-bold">
              ${chartData[chartData.length - 1].price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className={`text-xs mt-0.5 ${isPositive ? 'text-[#00BCD4]' : 'text-red-400'}`}>
              {isPositive ? '▲' : '▼'} 추세
            </p>
          </div>
        )}
      </div>

      {/* 데이터 없을 때 */}
      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-[#757575] text-sm">
          데이터 수신 중...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#BDBDBD" strokeOpacity={0.5} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#757575', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#757575', fontSize: 11 }}
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
                backgroundColor: '#FFFFFF',
                border: '1px solid #BDBDBD',
                borderRadius: '8px',
                color: '#212121',
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
