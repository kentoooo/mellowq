export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. はじめに</h2>
            <p className="leading-relaxed">
              MellowQ（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
              本プライバシーポリシーは、本サービスがどのような情報を収集し、どのように利用するかを説明するものです。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 収集する情報</h2>
            <p className="leading-relaxed mb-4">本サービスでは、以下の情報を収集する場合があります：</p>

            <div className="space-y-4">
              <div className="">
                <h3 className="font-semibold text-gray-900 mb-2">■ 回答情報</h3>
                <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                  <li>アンケート回答内容（匿名化されたデータ）</li>
                  <li>回答日時</li>
                  <li>匿名識別子（ランダム生成された文字列）</li>
                </ul>
              </div>

              <div className="">
                <h3 className="font-semibold text-gray-900 mb-2">■ デバイス情報</h3>
                <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                  <li>デバイストークン（プッシュ通知の配信に使用）</li>
                </ul>
                <p className="text-sm mt-2 text-gray-700">
                  <strong>※</strong> このトークンは端末を識別するための固有の識別子です<br/>
                  <strong>※</strong> 同じ端末からの複数の回答を技術的に紐付けることが可能です
                </p>
              </div>

              <div className="">
                <h3 className="font-semibold text-gray-900 mb-2">■ 技術情報</h3>
                <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                  <li>アクセスログ（一時的に記録される可能性があります）</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 情報の利用目的</h2>
            <p className="leading-relaxed mb-2">収集した情報は、以下の目的で利用します：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>アンケート結果の集計・分析</li>
              <li>追加質問のプッシュ通知配信</li>
              <li>サービスの改善および品質向上</li>
              <li>不正利用の防止</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. プッシュ通知とデバイストークンについて</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">■ プッシュ通知機能</h3>
                <p className="leading-relaxed text-sm">
                  本サービスでは、追加質問の通知を受け取るためにプッシュ通知機能を提供しています。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">■ デバイストークンについて</h3>
                <ul className="list-disc list-inside space-y-2 ml-2 text-sm">
                  <li>プッシュ通知を受け取るには、お使いの端末固有の「デバイストークン」が必要です</li>
                  <li>このトークンはFirebase Cloud Messaging（FCM）によって自動的に生成されます</li>
                  <li>デバイストークンにより、同じ端末からの回答を識別することが可能です</li>
                  <li>ただし、このトークンから個人（氏名や連絡先など）を特定することはできません</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">■ プライバシー保護</h3>
                <ul className="list-disc list-inside space-y-2 ml-2 text-sm">
                  <li>通知機能はいつでもデバイスの設定から無効にできます</li>
                </ul>
              </div>

            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. 情報の第三者提供</h2>
            <p className="leading-relaxed">
              本サービスは、法令に基づく場合を除き、収集した情報を第三者に提供することはありません。
              ただし、以下のサービスを利用しており、これらのサービスのプライバシーポリシーに従います：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Firebase Cloud Messaging（プッシュ通知配信）</li>
              <li>MongoDB Atlas（データベース）</li>
              <li>Vercel（ホスティング）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. データの保管期間</h2>
            <p className="leading-relaxed">
              アンケートデータは、アンケート作成者が削除するまで保管されます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookie（クッキー）の使用</h2>
            <p className="leading-relaxed">
              本サービスでは、サービスの機能向上のために必要最小限のCookieを使用する場合があります。
              ブラウザの設定でCookieを無効にすることも可能ですが、一部の機能が利用できなくなる可能性があります。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. プライバシーポリシーの変更</h2>
            <p className="leading-relaxed">
              本プライバシーポリシーは、法令の改正やサービスの変更に伴い、予告なく変更される場合があります。
              変更後のプライバシーポリシーは、本ページに掲載された時点で効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. お問い合わせ</h2>
            <p className="leading-relaxed">
              本プライバシーポリシーに関するご質問やご不明点がございましたら、以下までお問い合わせください。
            </p>
            <div>
              <p className="font-semibold">サービス名：MellowQ</p>
              <p className="font-semibold">メールアドレス：k95111403@gmail.com</p>
              <p className="mt-2">最終更新日：2025年10月5日</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <a
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← ホームに戻る
          </a>
        </div>
      </div>
    </div>
  );
}
