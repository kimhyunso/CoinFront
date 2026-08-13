export interface CoinPrice {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  volume: string;
  timestamp: string;
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
}

export interface PriceHistory {
  price: string;
  volume: string;
  recordedAt: string;
}

export interface PriceStat {
  highPrice: string;
  lowPrice: string;
  highAt: string;
  lowAt: string;
}

export interface CoinInfo {
  symbol: string;
  name: string;
}
