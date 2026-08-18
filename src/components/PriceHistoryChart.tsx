import { useQuery } from '@apollo/client/react';
import { gql } from 'graphql-tag';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const GET_PRICE_HISTORY = gql`
  query GetPriceHistory($symbol: String!, $page: Int, $size: Int) {
    priceHistory(symbol: $symbol, page: $page, size: $size) {
      price
      volume
      recordedAt
    }
  }
`;

interface PriceHistoryItem {
  price: string;
  volume: string;
  recordedAt: string;
}

interface GetPriceHistoryData {
  priceHistory: PriceHistoryItem[];
}

interface PriceHistoryChartProps {
  symbol: string;
}

export default function PriceHistoryChart({ symbol }: PriceHistoryChartProps) {
  const { data, loading, error } = useQuery<GetPriceHistoryData>(GET_PRICE_HISTORY, {
    variables: { symbol, page: 0, size: 50 },
    pollInterval: 10000,  // 10초마다 자동 갱신
  });

  const chartData = data?.priceHistory
    ? [...data.priceHistory]
        .reverse()  // 시간순 정렬
        .map(item => ({
          time: new Date(item.recordedAt).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          price: parseFloat(item.price),
          volume: parseFloat(item.volume),
        }))
    : [];

  const isPositive =
    chartData.length >= 2
      ? chartData[chartData.length - 1].price >= chartData[0].price
      : true;

  const strokeColor = isPositive ? '#03A9F4' : '#f87171';
  const fillColor = isPositive ? '#03A9F4' : '#f87171';

  return (
    <div className="bg-white border border-[#BDBDBD] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[#212121] font-semibold text-lg">{symbol}</h2>
          <p className="text-[#757575] text-xs mt-0.5">가격 히스토리 (10초 간격)</p>
        </div>
        {chartData.length > 0 && (
          <div className="text-right">
            <p className="text-[#212121] text-2xl font-bold">
              ${chartData[chartData.length - 1].price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className={`text-xs mt-0.5 ${isPositive ? 'text-[#03A9F4]' : 'text-red-400'}`}>
              {isPositive ? '▲' : '▼'} 추세
            </p>
          </div>
        )}
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="h-48 flex items-center justify-center text-[#757575] text-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#03A9F4] border-t-transparent rounded-full animate-spin" />
            데이터 불러오는 중...
          </div>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="h-48 flex items-center justify-center text-red-400 text-sm">
          데이터를 불러오는 중 오류가 발생했어요.
        </div>
      )}

      {/* 데이터 없음 */}
      {!loading && !error && chartData.length === 0 && (
        <div className="h-48 flex items-center justify-center text-[#757575] text-sm">
          아직 수집된 데이터가 없어요. 잠시 후 다시 확인해주세요.
        </div>
      )}

      {/* 차트 */}
      {!loading && !error && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={fillColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* 데이터 요약 */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#BDBDBD]/50">
          <div className="text-center">
            <p className="text-[#757575] text-xs">시작가</p>
            <p className="text-[#212121] text-sm font-medium mt-0.5">
              ${chartData[0].price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[#757575] text-xs">고가</p>
            <p className="text-[#03A9F4] text-sm font-medium mt-0.5">
              ${Math.max(...chartData.map(d => d.price)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[#757575] text-xs">저가</p>
            <p className="text-red-400 text-sm font-medium mt-0.5">
              ${Math.min(...chartData.map(d => d.price)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
