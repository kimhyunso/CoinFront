import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CoinCard from '../components/CoinCard';
import PriceChart from '../components/PriceChart';
import { CoinInfo } from '../types';
import { useAuth } from '../hooks/useAuth';

const COINS: CoinInfo[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'BNBUSDT', name: 'BNB' },
  { symbol: 'SOLUSDT', name: 'Solana' },
  { symbol: 'XRPUSDT', name: 'XRP' },
];

export default function MainPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#212121' }}>

      {/* 헤더 */}
      <header style={{ backgroundColor: '#0288D1' }} className="px-6 py-4 flex items-center justify-between border-b border-[#757575]">
        <div className="flex items-center gap-2">
          <span className="text-white text-xl font-bold">◈</span>
          <h1 className="text-white font-bold text-xl tracking-tight">CoinDash</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* 실시간 연결 표시 */}
          <div className="flex items-center gap-1.5 text-xs text-[#B3E5FC] bg-white/15 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B3E5FC] animate-pulse" />
            Binance 실시간 연결
          </div>

          {/* 로그인/마이페이지 버튼 */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/mypage')}
                className="px-4 py-1.5 text-sm font-bold text-[#03A9F4] bg-white rounded-md hover:bg-[#B3E5FC] transition-colors"
              >
                마이페이지
              </button>
              <button
                onClick={logout}
                className="px-4 py-1.5 text-sm text-white bg-white/20 border border-white/40 rounded-md hover:bg-white/30 transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-1.5 text-sm font-bold text-[#03A9F4] bg-white rounded-md hover:bg-[#B3E5FC] transition-colors"
            >
              로그인
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* 실시간 차트 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[#BDBDBD] text-xs font-medium uppercase tracking-wider">실시간 차트</h2>
            <div className="flex gap-1">
              {COINS.map(coin => (
                <button
                  key={coin.symbol}
                  onClick={() => setSelectedSymbol(coin.symbol)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedSymbol === coin.symbol
                      ? 'bg-[#03A9F4]/20 text-[#03A9F4] border border-[#03A9F4]/40'
                      : 'text-[#757575] hover:text-white'
                  }`}
                >
                  {coin.name}
                </button>
              ))}
            </div>
          </div>
          <PriceChart symbol={selectedSymbol} />
        </section>

        {/* 코인 카드 목록 */}
        <section>
          <h2 className="text-[#BDBDBD] text-xs font-medium uppercase tracking-wider mb-4">
            실시간 시세
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {COINS.map(coin => (
              <div
                key={coin.symbol}
                onClick={() => setSelectedSymbol(coin.symbol)}
                className={`cursor-pointer rounded-xl transition-all ${
                  selectedSymbol === coin.symbol ? 'ring-1 ring-[#03A9F4]' : ''
                }`}
              >
                <CoinCard symbol={coin.symbol} name={coin.name} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
