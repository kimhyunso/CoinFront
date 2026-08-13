import { useState } from 'react';

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (em: string): string | null => {
    if (!em) return '이메일을 입력해주세요.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return '올바른 이메일 형식이 아닙니다.';
    return null;
  };

  const validatePassword = (pw: string): string | null => {
    if (pw.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    if (!/[A-Za-z]/.test(pw)) return '비밀번호는 영문자를 포함해야 합니다.';
    if (!/[0-9]/.test(pw)) return '비밀번호는 숫자를 포함해야 합니다.';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) return '비밀번호는 특수문자를 포함해야 합니다.';
    return null;
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleLogin = async () => {
    setError('');
    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError('');
    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }
    if (!name.trim()) { setError('이름을 입력해주세요.'); return; }
    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTab('login');
      setEmail(''); setPassword(''); setName('');
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 비밀번호 강도 계산
  const passwordConditions = [
    password.length >= 8,
    /[A-Za-z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  ];
  const passwordScore = passwordConditions.filter(Boolean).length;
  const strengthLabel = ['', '약함', '보통', '강함', '매우 강함'][passwordScore];
  const strengthBarColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-[#03A9F4]', 'bg-[#00BCD4]'][passwordScore];
  const strengthTextColor = ['', 'text-red-400', 'text-orange-400', 'text-[#03A9F4]', 'text-[#00BCD4]'][passwordScore];
  const missingConditions = [
    !passwordConditions[0] && '8자 이상',
    !passwordConditions[1] && '영문자',
    !passwordConditions[2] && '숫자',
    !passwordConditions[3] && '특수문자',
  ].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-[#B3E5FC] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">

        {/* 헤더 */}
        <div className="bg-[#03A9F4] px-8 py-8 text-center">
          <p className="text-white text-2xl font-bold mb-1">◈ CoinDash</p>
          <p className="text-[#B3E5FC] text-sm">실시간 암호화폐 대시보드</p>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-[#BDBDBD]">
          {(['login', 'signup']).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                tab === t
                  ? 'text-[#03A9F4] border-[#03A9F4]'
                  : 'text-[#757575] border-transparent hover:text-[#212121]'
              }`}
            >
              {t === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        {/* 폼 */}
        <div className="px-8 py-7 flex flex-col gap-4">

          {/* 에러 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
              {error}
            </div>
          )}

          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#757575]">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              className={`w-full px-3 py-2.5 border rounded-md text-sm text-[#212121] outline-none transition-colors ${
                email && !isEmailValid
                  ? 'border-red-400 focus:border-red-400'
                  : email && isEmailValid
                  ? 'border-[#00BCD4]'
                  : 'border-[#BDBDBD] focus:border-[#03A9F4]'
              }`}
            />
            {email && (
              <p className={`text-xs ${isEmailValid ? 'text-[#00BCD4]' : 'text-red-400'}`}>
                {isEmailValid ? '✓ 올바른 이메일 형식입니다.' : '올바른 이메일 형식이 아닙니다.'}
              </p>
            )}
          </div>

          {/* 이름 (회원가입만) */}
          {tab === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#757575]">이름</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-3 py-2.5 border border-[#BDBDBD] rounded-md text-sm text-[#212121] outline-none focus:border-[#03A9F4] transition-colors"
              />
            </div>
          )}

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#757575]">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-[#BDBDBD] rounded-md text-sm text-[#212121] outline-none focus:border-[#03A9F4] transition-colors"
              onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? handleLogin() : handleSignup())}
            />

            {/* 비밀번호 강도 바 (회원가입만) */}
            {tab === 'signup' && password && (
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i < passwordScore ? strengthBarColor : 'bg-[#BDBDBD]'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium ${strengthTextColor}`}>
                    비밀번호 강도: {strengthLabel}
                  </span>
                  <span className="text-xs text-[#757575]">{passwordScore}/4</span>
                </div>
                {passwordScore < 4 && (
                  <p className="text-xs text-[#757575]">{missingConditions} 필요</p>
                )}
              </div>
            )}
          </div>

          {/* 메인 버튼 */}
          <button
            onClick={tab === 'login' ? handleLogin : handleSignup}
            disabled={loading}
            className="w-full py-3 bg-[#03A9F4] hover:bg-[#0288D1] disabled:bg-[#B3E5FC] text-white text-sm font-bold rounded-md transition-colors"
          >
            {loading ? '처리 중...' : (tab === 'login' ? '로그인' : '회원가입')}
          </button>

          {/* 구분선 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#BDBDBD]" />
            <span className="text-xs text-[#757575]">또는</span>
            <div className="flex-1 h-px bg-[#BDBDBD]" />
          </div>

          {/* 구글 로그인 */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-white border border-[#BDBDBD] hover:bg-gray-50 text-[#212121] text-sm rounded-md transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 계속하기
          </button>
        </div>

        {/* 하단 */}
        <div className="bg-gray-50 border-t border-[#BDBDBD] px-8 py-4 text-center">
          <span className="text-xs text-[#757575]">
            {tab === 'login' ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
          </span>
          <button
            onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); setEmail(''); setPassword(''); setName(''); }}
            className="text-xs text-[#03A9F4] font-bold hover:text-[#0288D1]"
          >
            {tab === 'login' ? '회원가입' : '로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}
