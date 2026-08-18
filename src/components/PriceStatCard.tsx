import { useQuery } from '@apollo/client/react';
import { gql } from 'graphql-tag';

const GET_PRICE_STAT = gql`
  query GetPriceStat($symbol: String!) {
    priceStat(symbol: $symbol) {
      highPrice
      lowPrice
      highAt
      lowAt
    }
  }
`;

interface PriceStatData {
  priceStat: {
    highPrice: string;
    lowPrice: string;
    highAt: string;
    lowAt: string;
  };
}

interface PriceStatCardProps {
  symbol: string;
}

export default function PriceStatCard({ symbol }: PriceStatCardProps) {
  const { data, loading } = useQuery<PriceStatData>(GET_PRICE_STAT, {
    variables: { symbol },
    pollInterval: 5000,  // 5초마다 갱신
  });

  const stat = data?.priceStat;

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-white border border-[#BDBDBD] rounded-xl p-5 flex flex-col gap-4">
      <h3 className="text-[#757575] text-xs font-medium uppercase tracking-wider">
        고가 / 저가
      </h3>

      {loading && (
        <div className="h-12 bg-[#BDBDBD]/20 rounded animate-pulse" />
      )}

      {stat && (
        <div className="grid grid-cols-2 gap-4">
          {/* 고가 */}
          <div className="flex flex-col gap-1 p-3 bg-[#03A9F4]/5 border border-[#03A9F4]/20 rounded-lg">
            <p className="text-xs text-[#757575]">▲ 고가</p>
            <p className="text-[#03A9F4] text-lg font-bold">
              ${parseFloat(stat.highPrice).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-[#757575] text-xs">{formatTime(stat.highAt)}</p>
          </div>

          {/* 저가 */}
          <div className="flex flex-col gap-1 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-[#757575]">▼ 저가</p>
            <p className="text-red-400 text-lg font-bold">
              ${parseFloat(stat.lowPrice).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-[#757575] text-xs">{formatTime(stat.lowAt)}</p>
          </div>
        </div>
      )}

      {/* 범위 바 */}
      {stat && parseFloat(stat.highPrice) > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-[#757575]">
            <span>${parseFloat(stat.lowPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            <span>${parseFloat(stat.highPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="h-1.5 bg-gradient-to-r from-red-400 to-[#03A9F4] rounded-full" />
          <p className="text-xs text-[#757575] text-center">저가 → 고가 범위</p>
        </div>
      )}
    </div>
  );
}
