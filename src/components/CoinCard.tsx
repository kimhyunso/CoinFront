import { useSubscription, useMutation, useQuery } from '@apollo/client/react';
import { gql } from 'graphql-tag';
import { CoinPrice } from '../types';
import { useAuth } from '../hooks/useAuth';

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

const GET_FAVORITES = gql`
  query GetFavorites {
    favorites {
      id
      symbol
      name
    }
  }
`;

const ADD_FAVORITE = gql`
  mutation AddFavorite($symbol: String!) {
    addFavorite(symbol: $symbol) {
      id
      symbol
      name
    }
  }
`;

const REMOVE_FAVORITE = gql`
  mutation RemoveFavorite($symbol: String!) {
    removeFavorite(symbol: $symbol)
  }
`;

interface PriceSubscriptionData {
  priceUpdated: CoinPrice;
}

interface FavoriteCoin {
  id: string;
  symbol: string;
  name: string;
}

interface GetFavoritesData {
  favorites: FavoriteCoin[];
}

interface CoinCardProps {
  symbol: string;
  name: string;
}

export default function CoinCard({ symbol, name }: CoinCardProps) {
  const { isLoggedIn } = useAuth();

  const { data: priceData, loading, error } = useSubscription<PriceSubscriptionData>(
    PRICE_SUBSCRIPTION,
    { variables: { symbol } }
  );

  // 즐겨찾기 목록 조회 (로그인한 경우만)
  const { data: favData, refetch } = useQuery<GetFavoritesData>(GET_FAVORITES, {
    skip: !isLoggedIn,
  });

  const [addFavorite] = useMutation(ADD_FAVORITE, {
    onCompleted: () => refetch(),
  });

  const [removeFavorite] = useMutation(REMOVE_FAVORITE, {
    onCompleted: () => refetch(),
  });

  const price = priceData?.priceUpdated;
  const isPositive = price ? parseFloat(price.changePercent) >= 0 : null;
  const isFavorite = favData?.favorites?.some(f => f.symbol === symbol) ?? false;

  const handleFavorite = () => {
    if (!isLoggedIn) return;
    if (isFavorite) {
      removeFavorite({ variables: { symbol } });
    } else {
      addFavorite({ variables: { symbol } });
    }
  };

  return (
    <div className="bg-white border border-[#BDBDBD] rounded-xl p-5 flex flex-col gap-3 hover:border-[#03A9F4] hover:shadow-md transition-all">
      {/* 코인 이름 + 심볼 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#212121] font-semibold text-base">{name}</p>
          <p className="text-[#757575] text-xs mt-0.5">{symbol}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* 즐겨찾기 버튼 (로그인한 경우만) */}
          {isLoggedIn && (
            <button
              onClick={handleFavorite}
              className={`text-lg transition-colors ${
                isFavorite ? 'text-[#03A9F4]' : 'text-[#BDBDBD] hover:text-[#03A9F4]'
              }`}
              title={isFavorite ? '즐겨찾기 삭제' : '즐겨찾기 추가'}
            >
              {isFavorite ? '★' : '☆'}
            </button>
          )}
          <span className="flex items-center gap-1.5 text-xs text-[#00BCD4]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00BCD4] animate-pulse" />
            LIVE
          </span>
        </div>
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
