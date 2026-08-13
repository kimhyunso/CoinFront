import { useSubscription } from '@apollo/client/react';
import { gql } from 'graphql-tag';
import { CoinPrice, CoinInfo } from '../types';

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

   console.log('CoinCard 상태:', { symbol, data, loading, error }); // 추가!


  const price = data?.priceUpdated;
  const isPositive = price ? parseFloat(price.changePercent) >= 0 : null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-lg">{name}</p>
          <p className="text-gray-500 text-sm">{symbol}</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE
        </span>
      </div>

      {loading && (
        <div className="h-8 bg-gray-800 rounded animate-pulse" />
      )}
      {error && (
        <p className="text-red-400 text-sm">연결 오류</p>
      )}
      {price && (
        <>
          <p className="text-white text-2xl font-bold tracking-tight">
            ${parseFloat(price.price).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
              isPositive
                ? 'text-emerald-400 bg-emerald-400/10'
                : 'text-red-400 bg-red-400/10'
            }`}>
              {isPositive ? '+' : ''}{parseFloat(price.changePercent).toFixed(2)}%
            </span>
            <span className={`text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{parseFloat(price.change).toFixed(2)}
            </span>
          </div>

          <div className="pt-2 border-t border-gray-800">
            <p className="text-gray-500 text-xs">24h 거래량</p>
            <p className="text-gray-300 text-sm font-medium mt-0.5">
              {parseFloat(price.volume).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
