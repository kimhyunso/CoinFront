import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from 'graphql-tag';  // 추가!
import { useAuth } from '../hooks/useAuth';
import CoinCard from '../components/CoinCard';

const GET_FAVORITES = gql`
  query GetFavorites {
    favorites {
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

export default function FavoritePage() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  const { data, loading, error, refetch } = useQuery(GET_FAVORITES, {
    skip: !isLoggedIn,  // 로그인 안 했으면 쿼리 스킵
  });

  const [removeFavorite] = useMutation(REMOVE_FAVORITE, {
    onCompleted: () => refetch(),  // 삭제 후 목록 새로고침
  });

  const favorites = data?.favorites ?? [];

  const handleRemove = (symbol: string) => {
    removeFavorite({ variables: { symbol } });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="bg-[#0288D1] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white text-xl font-bold">◈</span>
          <h1 className="text-white font-bold text-xl tracking-tight">CoinDash</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-1.5 text-sm font-bold text-[#0288D1] bg-white rounded-md hover:bg-[#B3E5FC] transition-colors"
          >
            메인으로
          </button>
          {isLoggedIn && (
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="px-4 py-1.5 text-sm text-white bg-white/20 border border-white/40 rounded-md hover:bg-white/30 transition-colors"
            >
              로그아웃
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-[#757575] text-xs font-medium uppercase tracking-wider mb-6">
          즐겨찾기 목록
        </h2>

        {/* 비로그인 */}
        {!isLoggedIn && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-[#757575] text-sm">로그인 후 즐겨찾기를 사용할 수 있어요.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-[#03A9F4] text-white text-sm font-bold rounded-md hover:bg-[#0288D1] transition-colors"
            >
              로그인하기
            </button>
          </div>
        )}

        {/* 로딩 */}
        {isLoggedIn && loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-[#BDBDBD]/20 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* 에러 */}
        {isLoggedIn && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
            데이터를 불러오는 중 오류가 발생했어요.
          </div>
        )}

        {/* 즐겨찾기 없음 */}
        {isLoggedIn && !loading && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-4xl">★</p>
            <p className="text-[#757575] text-sm">즐겨찾기한 코인이 없어요.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-[#03A9F4] text-white text-sm font-bold rounded-md hover:bg-[#0288D1] transition-colors"
            >
              코인 보러가기
            </button>
          </div>
        )}

        {/* 즐겨찾기 목록 */}
        {isLoggedIn && !loading && favorites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favorites.map((coin: { id: string; symbol: string; name: string }) => (
              <div key={coin.id} className="relative">
                <CoinCard symbol={coin.symbol} name={coin.name} />
                {/* 즐겨찾기 삭제 버튼 */}
                <button
                  onClick={() => handleRemove(coin.symbol)}
                  className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-[#BDBDBD] hover:bg-red-50 hover:border-red-300 transition-colors"
                  title="즐겨찾기 삭제"
                >
                  <span className="text-[#BDBDBD] hover:text-red-400 text-sm">★</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
