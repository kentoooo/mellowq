import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* 多様な図形が動く背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-500 via-purple-600 to-indigo-600">
        {/* 四角形ファミリー */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-purple-400/25 rounded-lg animate-bounce"></div>
        <div className="absolute bottom-32 right-32 w-12 h-12 bg-indigo-400/30 rounded-md animate-spin"></div>
        <div className="absolute top-1/3 left-1/4 w-20 h-8 bg-violet-400/20 rounded-xl animate-pulse"></div>
        <div className="absolute top-10 right-1/3 w-14 h-14 bg-slate-400/25 rounded-none animate-ping"></div>
        <div className="absolute bottom-10 left-1/5 w-18 h-6 bg-gray-400/30 rounded-sm animate-bounce"></div>
        
        {/* 丸い図形ファミリー */}
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-400/25 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 left-40 w-18 h-18 bg-cyan-400/30 rounded-full animate-bounce"></div>
        <div className="absolute top-2/3 right-1/3 w-14 h-14 bg-rose-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/6 w-10 h-10 bg-sky-400/25 rounded-full animate-spin"></div>
        <div className="absolute bottom-1/2 right-1/5 w-22 h-22 bg-fuchsia-400/20 rounded-full animate-ping"></div>
        <div className="absolute top-1/6 left-2/3 w-8 h-8 bg-orange-400/30 rounded-full animate-bounce"></div>
        
        {/* ダイヤモンド・三角形ファミリー */}
        <div className="absolute top-1/4 left-1/2 w-10 h-10 bg-emerald-400/25 rotate-45 animate-spin"></div>
        <div className="absolute bottom-1/3 right-1/4 w-8 h-8 bg-amber-400/30 rotate-12 animate-bounce"></div>
        <div className="absolute top-3/4 left-1/3 w-12 h-12 bg-red-400/25 rotate-45 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-2/3 w-6 h-6 bg-green-400/35 rotate-45 animate-ping"></div>
        <div className="absolute top-1/8 right-1/8 w-16 h-16 bg-blue-400/20 rotate-45 animate-spin"></div>
        
        {/* 長細い図形ファミリー */}
        <div className="absolute top-16 left-1/3 w-32 h-4 bg-teal-400/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-16 right-1/5 w-6 h-28 bg-lime-400/25 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 right-10 w-2 h-20 bg-purple-300/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/3 left-10 w-28 h-3 bg-indigo-300/25 rounded-full animate-spin"></div>
        <div className="absolute top-2/3 left-1/2 w-4 h-16 bg-pink-300/20 rounded-full animate-bounce"></div>
        
        {/* 楕円・変形図形ファミリー */}
        <div className="absolute top-1/5 left-3/4 w-20 h-12 bg-violet-400/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-2/5 right-1/6 w-16 h-8 bg-cyan-400/25 rounded-full animate-bounce"></div>
        <div className="absolute top-4/5 right-3/4 w-12 h-24 bg-rose-400/20 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/6 left-2/5 w-24 h-10 bg-emerald-400/25 rounded-full animate-spin"></div>
        
        {/* 小さなきらめきファミリー */}
        <div className="absolute top-1/5 right-1/6 w-3 h-3 bg-white/40 rounded-full animate-ping"></div>
        <div className="absolute bottom-2/5 left-1/6 w-2 h-2 bg-yellow-200/50 rounded-full animate-pulse"></div>
        <div className="absolute top-3/5 left-3/4 w-4 h-4 bg-blue-200/35 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/5 right-2/3 w-1 h-1 bg-pink-200/60 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/2 w-2 h-2 bg-green-200/45 rounded-full animate-spin"></div>
        <div className="absolute bottom-3/4 left-3/5 w-3 h-3 bg-orange-200/40 rounded-full animate-pulse"></div>
        <div className="absolute top-1/7 left-1/8 w-1 h-1 bg-purple-200/55 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/7 right-1/8 w-2 h-2 bg-teal-200/45 rounded-full animate-ping"></div>
        
        {/* ユニークな形状 */}
        <div className="absolute top-1/2 left-3/4 w-6 h-6 bg-red-300/30 rounded-tl-full animate-spin"></div>
        <div className="absolute bottom-3/5 right-2/5 w-8 h-8 bg-yellow-300/25 rounded-tr-full animate-bounce"></div>
        <div className="absolute top-3/7 left-1/7 w-10 h-5 bg-blue-300/20 rounded-l-full animate-pulse"></div>
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <div className="backdrop-blur-sm bg-white/10 rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg animate-fade-in-up">
            MellowQ
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-indigo-400 mx-auto mb-8 rounded-full"></div>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-light animate-fade-in-up">
            匿名アンケートでも追加質問ができる<br />
            新しいコミュニケーション体験
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <div className="backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-3xl shadow-2xl border border-white/10 hover:bg-gradient-to-br hover:from-white/15 hover:to-white/8 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl animate-fade-in-up relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 via-transparent to-pink-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-60"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full mb-6 flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <div className="w-6 h-6 rounded-sm bg-white/40 rotate-45"></div>
                </div>
                <h3 className="text-2xl font-light mb-4 text-white tracking-wide text-center">完全匿名</h3>
                <p className="text-white/70 leading-relaxed text-sm">
                  ログイン不要で、回答者の個人情報は一切収集しません
                </p>
              </div>
            </div>
            <div className="backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-3xl shadow-2xl border border-white/10 hover:bg-gradient-to-br hover:from-white/15 hover:to-white/8 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl animate-fade-in-up relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/5 via-transparent to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-indigo-300 to-cyan-300 rounded-full opacity-60"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-300/20 to-cyan-300/20 rounded-full mb-6 flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <div className="flex space-x-1">
                    <div className="w-2 h-6 bg-white/40 rounded-full"></div>
                    <div className="w-2 h-4 bg-white/30 rounded-full mt-1"></div>
                    <div className="w-2 h-5 bg-white/35 rounded-full mt-0.5"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-light mb-4 text-white tracking-wide text-center">双方向対話</h3>
                <p className="text-white/70 leading-relaxed text-sm">
                  特定の回答に対して追加質問を送ることができます
                </p>
              </div>
            </div>
            <div className="backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-3xl shadow-2xl border border-white/10 hover:bg-gradient-to-br hover:from-white/15 hover:to-white/8 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl animate-fade-in-up relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-transparent to-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full opacity-60"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-300/20 to-teal-300/20 rounded-full mb-6 flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <div className="relative">
                    <div className="w-8 h-1 bg-white/40 rounded-full"></div>
                    <div className="w-6 h-1 bg-white/30 rounded-full mt-1 ml-1"></div>
                    <div className="w-4 h-1 bg-white/35 rounded-full mt-1 ml-2"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-light mb-4 text-white tracking-wide text-center">簡単作成</h3>
                <p className="text-white/70 leading-relaxed text-sm">
                  アカウント登録なしですぐにアンケートを作成できます
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 animate-fade-in-up">
            <Link
              href="/create"
              className="inline-block px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              🚀 アンケートを作成する
            </Link>
            <p className="text-white/60 text-sm">
              無料で今すぐ始められます！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}