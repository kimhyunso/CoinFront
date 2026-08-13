import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function MyPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // JWT 토큰에서 정보 파싱
  const token = localStorage.getItem('token');
  let email = '';
  let name = '';
  let provider = '';

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      email = payload.sub || '';
      // 한글 이름 디코딩
      name = decodeURIComponent(
        Array.from(atob(token.split('.')[1]))
          .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('')
      );
      const parsed = JSON.parse(name);
      name = parsed.name || '';
      provider = parsed.provider || '';
    } catch (e) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        name = payload.name || '';
        provider = payload.provider || '';
      } catch {}
    }
  }

  const providerLabel = provider === 'google' ? '구글 로그인' : provider === 'local' ? '일반 로그인' : provider;

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

      <main className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-6">
        {/* 프로필 카드 */}
        <div className="bg-[#03A9F4] rounded-xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">
              {name ? name[0].toUpperCase() : '?'}
            </span>
          </div>
          <h2 className="text-white text-2xl font-bold">{name || '사용자'}</h2>
          <p className="text-[#B3E5FC] text-sm mt-1">{email}</p>
          <span className="inline-block mt-3 px-3 py-1 bg-white/20 text-white text-xs rounded-full">
            {providerLabel}
          </span>
        </div>

        {/* 정보 카드 */}
        <div className="bg-white border border-[#BDBDBD] rounded-xl p-6 flex flex-col gap-2">
          <h3 className="text-[#757575] text-xs font-medium uppercase tracking-wider mb-2">계정 정보</h3>

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

        {/* 로그아웃 버튼 */}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full py-3 border border-red-300 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
        >
          로그아웃
        </button>
      </main>
    </div>
  );
}
