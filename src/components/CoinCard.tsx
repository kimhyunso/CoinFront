import { useSubscription } from '@apollo/client/react';
import { gql } from 'graphql-tag';
import { CoinPrice } from '../types';

const PRICE_SUBSCRIPTION = gql`
  subscription PriceUpdated($symbol: String!) {
    priceUpdated(symbol: $symbol) {
      symbol
      price
      change
      changePercent
      volume
      timestamp
    }
  }
`;

interface PriceSubscriptionData {
  priceUpdated: CoinPrice;
}

interface CoinCardProps {
  symbol: string;
  name: string;
}

export default function CoinCard({ symbol, name }: CoinCardProps) {
  const { data, loading, error } = useSubscription<PriceSubscriptionData>(
    PRICE_SUBSCRIPTION,
    { variables: { symbol } }
  );

  const price = data?.priceUpdated;
  const isPositive = price ? parseFloat(price.changePercent) >= 0 : null;

  return (
    <div className="bg-white border border-[#BDBDBD] rounded-xl p-5 flex flex-col gap-3 hover:border-[#03A9F4] hover:shadow-md transition-all">
      {/* 코인 이름 + 심볼 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#212121] font-semibold text-base">{name}</p>
          <p className="text-[#757575] text-xs mt-0.5">{symbol}</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-[#00BCD4]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00BCD4] animate-pulse" />
          LIVE
        </span>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="h-8 bg-[#BDBDBD]/30 rounded animate-pulse" />
      )}

      {/* 에러 */}
      {error && (
        <p className="text-red-400 text-sm">연결 오류</p>
      )}

      {/* 데이터 */}
      {price && (
        <>
          <p className="text-[#212121] text-2xl font-bold tracking-tight">
            ${parseFloat(price.price).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isPositive
                ? 'text-[#00BCD4] bg-[#00BCD4]/10'
                : 'text-red-500 bg-red-50'
            }`}>
              {isPositive ? '+' : ''}{parseFloat(price.changePercent).toFixed(2)}%
            </span>
            <span className={`text-xs font-medium ${isPositive ? 'text-[#00BCD4]' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{parseFloat(price.change).toFixed(2)}
            </span>
          </div>

          <div className="pt-2 border-t border-[#BDBDBD]/50">
            <p className="text-[#757575] text-xs">24h 거래량</p>
            <p className="text-[#212121] text-sm font-medium mt-0.5">
              {parseFloat(price.volume).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
