import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from 'graphql-tag';
import { useAuth } from '../hooks/useAuth';
import CoinCard from '../components/CoinCard';
import PriceHistoryChart from '../components/PriceHistoryChart';
import PriceStatCard from '../components/PriceStatCard';

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

interface FavoriteCoin {
  id: string;
  symbol: string;
  name: string;
}

interface GetFavoritesData {
  favorites: FavoriteCoin[];
}

type Tab = 'profile' | 'favorites' | 'history';

const COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'BNBUSDT', name: 'BNB' },
  { symbol: 'SOLUSDT', name: 'Solana' },
  { symbol: 'XRPUSDT', name: 'XRP' },
];

const SIDEBAR_MENUS = [
  { key: 'profile', label: '회원 정보', icon: '👤' },
  { key: 'favorites', label: '즐겨찾기', icon: '★' },
  { key: 'history', label: '가격 히스토리', icon: '📈' },
];

export default function MyPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  // 훅
  const { data, loading, error, refetch } = useQuery<GetFavoritesData>(GET_FAVORITES);
  const [removeFavorite] = useMutation(REMOVE_FAVORITE, {
    onCompleted: () => refetch(),
  });

  // 일반 변수
  const favorites: FavoriteCoin[] = data?.favorites ?? [];

  // JWT 파싱
  const token = localStorage.getItem('token');
  let email = '';
  let name = '';
  let provider = '';

  if (token) {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(decodeURIComponent(
        atob(base64).split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      ));
      email = payload.sub || '';
      name = payload.name || '';
      provider = payload.provider || '';
    } catch (e) {}
  }

  const providerLabel =
    provider === 'google' ? '구글 로그인' :
    provider === 'local' ? '일반 로그인' : provider;

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="bg-[#0288D1] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white text-xl font-bold">◈</span>
          <h1 className="text-white font-bold text-xl tracking-tight">CoinDash</h1>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-1.5 text-sm font-bold text-[#0288D1] bg-white rounded-md hover:bg-[#B3E5FC] transition-colors"
        >
          메인으로
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 flex gap-6">

        {/* 사이드바 */}
        <aside className="w-56 flex-shrink-0">
          {/* 프로필 요약 */}
          <div className="bg-[#03A9F4] rounded-xl p-5 text-center mb-4">
            <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl font-bold">
                {name ? name[0].toUpperCase() : '?'}
              </span>
            </div>
            <p className="text-white font-semibold text-sm truncate">{name || '사용자'}</p>
            <p className="text-[#B3E5FC] text-xs mt-0.5 truncate">{email}</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
              {providerLabel}
            </span>
          </div>

          {/* 메뉴 */}
          <nav className="flex flex-col gap-1">
            {SIDEBAR_MENUS.map(menu => (
              <button
                key={menu.key}
                onClick={() => setActiveTab(menu.key as Tab)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                  activeTab === menu.key
                    ? 'bg-[#03A9F4]/10 text-[#03A9F4] border border-[#03A9F4]/30'
                    : 'text-[#757575] hover:bg-gray-50 hover:text-[#212121]'
                }`}
              >
                <span>{menu.icon}</span>
                {menu.label}
              </button>
            ))}

            {/* 로그아웃 */}
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-colors text-left mt-4"
            >
              <span>🚪</span>
              로그아웃
            </button>
          </nav>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 min-w-0">

          {/* 회원 정보 탭 */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[#212121] font-semibold text-lg">회원 정보</h2>

              <div className="bg-white border border-[#BDBDBD] rounded-xl p-6 flex flex-col gap-2">
                <div className="flex justify-between items-center py-3 border-b border-[#BDBDBD]/50">
                  <span className="text-[#757575] text-sm">이름</span>
                  <span className="text-[#212121] text-sm font-medium">{name || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#BDBDBD]/50">
                  <span className="text-[#757575] text-sm">이메일</span>
                  <span className="text-[#212121] text-sm font-medium">{email || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[#757575] text-sm">로그인 방식</span>
                  <span className="text-[#00BCD4] text-sm font-medium">{providerLabel}</span>
                </div>
              </div>

              {/* 비밀번호 변경 (일반 로그인만) */}
              {provider === 'local' && (
                <div className="bg-white border border-[#BDBDBD] rounded-xl p-6">
                  <h3 className="text-[#212121] font-medium text-sm mb-4">비밀번호 변경</h3>
                  <div className="flex flex-col gap-3">
                    <input
                      type="password"
                      placeholder="현재 비밀번호"
                      className="w-full px-3 py-2.5 border border-[#BDBDBD] rounded-md text-sm text-[#212121] outline-none focus:border-[#03A9F4] transition-colors"
                    />
                    <input
                      type="password"
                      placeholder="새 비밀번호"
                      className="w-full px-3 py-2.5 border border-[#BDBDBD] rounded-md text-sm text-[#212121] outline-none focus:border-[#03A9F4] transition-colors"
                    />
                    <input
                      type="password"
                      placeholder="새 비밀번호 확인"
                      className="w-full px-3 py-2.5 border border-[#BDBDBD] rounded-md text-sm text-[#212121] outline-none focus:border-[#03A9F4] transition-colors"
                    />
                    <button className="w-full py-2.5 bg-[#03A9F4] hover:bg-[#0288D1] text-white text-sm font-bold rounded-md transition-colors">
                      변경하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 즐겨찾기 탭 */}
          {activeTab === 'favorites' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[#212121] font-semibold text-lg">즐겨찾기</h2>
                <span className="text-xs text-[#757575]">{favorites.length}개</span>
              </div>

              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-40 bg-[#BDBDBD]/20 rounded-xl animate-pulse" />
                  ))}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
                  데이터를 불러오는 중 오류가 발생했어요.
                </div>
              )}

              {!loading && !error && favorites.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 border border-[#BDBDBD] rounded-xl">
                  <span className="text-3xl text-[#BDBDBD]">★</span>
                  <p className="text-[#757575] text-sm">즐겨찾기한 코인이 없어요.</p>
                  <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-[#03A9F4] text-white text-xs font-bold rounded-md hover:bg-[#0288D1] transition-colors"
                  >
                    코인 보러가기
                  </button>
                </div>
              )}

              {!loading && !error && favorites.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map((coin) => (
                    <div key={coin.id} className="relative">
                      <CoinCard symbol={coin.symbol} name={coin.name} />
                      <button
                        onClick={() => removeFavorite({ variables: { symbol: coin.symbol } })}
                        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-[#BDBDBD] hover:bg-red-50 hover:border-red-300 transition-colors text-xs text-[#BDBDBD] hover:text-red-400"
                        title="즐겨찾기 삭제"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 가격 히스토리 탭 */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[#212121] font-semibold text-lg">가격 히스토리</h2>
              </div>

              {/* 코인 선택 탭 */}
              <div className="flex gap-1 flex-wrap">
                {COINS.map(coin => (
                  <button
                    key={coin.symbol}
                    onClick={() => setSelectedSymbol(coin.symbol)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      selectedSymbol === coin.symbol
                        ? 'bg-[#03A9F4]/10 text-[#03A9F4] border border-[#03A9F4]/40'
                        : 'text-[#757575] border border-[#BDBDBD] hover:text-[#212121]'
                    }`}
                  >
                    {coin.name}
                  </button>
                ))}
              </div>

              {/* 고가/저가 통계 추가! */}
              <PriceStatCard symbol={selectedSymbol} />

              {/* 히스토리 차트 */}
              <PriceHistoryChart symbol={selectedSymbol} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
