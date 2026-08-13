import { useState } from 'react';
import CoinCard from '../components/CoinCard';
import PriceChart from '../components/PriceChart';
import { CoinInfo } from '../types';

const COINS: CoinInfo[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'BNBUSDT', name: 'BNB' },
  { symbol: 'SOLUSDT', name: 'Solana' },
  { symbol: 'XRPUSDT', name: 'XRP' },
];

export default function MainPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 text-xl font-bold">◈</span>
          <h1 className="text-white font-bold text-xl tracking-tight">CoinDash</h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Binance 실시간 연결
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider">실시간 차트</h2>
            <div className="flex gap-1">
              {COINS.map(coin => (
                <button
                  key={coin.symbol}
                  onClick={() => setSelectedSymbol(coin.symbol)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedSymbol === coin.symbol
                      ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {coin.name}
                </button>
              ))}
            </div>
          </div>
          <PriceChart symbol={selectedSymbol} />
        </section>

        <section>
          <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">
            실시간 시세
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {COINS.map(coin => (
              <div
                key={coin.symbol}
                onClick={() => setSelectedSymbol(coin.symbol)}
                className={`cursor-pointer transition-all ${
                  selectedSymbol === coin.symbol ? 'ring-1 ring-emerald-400/50 rounded-2xl' : ''
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
