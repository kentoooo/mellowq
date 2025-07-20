import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          MellowQ
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          匿名性を保ちながら、質問者と回答者が双方向でコミュニケーションできる新しいアンケートサービス
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">完全匿名</h3>
            <p className="text-gray-600">
              ログイン不要で、回答者の個人情報は一切収集しません
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">双方向対話</h3>
            <p className="text-gray-600">
              特定の回答に対して追加質問を送ることができます
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">リアルタイム通知</h3>
            <p className="text-gray-600">
              ブラウザ通知で追加質問をすぐに確認できます
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">簡単作成</h3>
            <p className="text-gray-600">
              アカウント登録なしですぐにアンケートを作成できます
            </p>
          </div>
        </div>

        <Link
          href="/create"
          className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          アンケートを作成する
        </Link>
      </div>
    </div>
  );
}