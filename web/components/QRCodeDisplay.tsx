'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  url: string;
  title?: string;
  size?: number;
  className?: string;
}

export default function QRCodeDisplay({ 
  url, 
  title = 'QRコード', 
  size = 256,
  className = '' 
}: QRCodeDisplayProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [url, size]);

  const generateQRCode = async () => {
    if (!url) return;

    setIsLoading(true);
    setError('');

    try {
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrCodeDataURL(qrCodeDataURL);
    } catch (err) {
      console.error('QRコード生成エラー:', err);
      setError('QRコードの生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataURL) return;

    const link = document.createElement('a');
    link.download = `survey-qrcode-${Date.now()}.png`;
    link.href = qrCodeDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyQRCodeToClipboard = async () => {
    if (!qrCodeDataURL) return;

    try {
      const response = await fetch(qrCodeDataURL);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      // 成功通知は親コンポーネントで処理
    } catch (err) {
      console.error('QRコードのコピーに失敗:', err);
      // フォールバック: 画像をダウンロード
      downloadQRCode();
    }
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
        <p className="text-sm text-gray-600">QRコードを生成中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center p-4 ${className}`}>
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-sm text-red-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* QRコード画像 */}
      <div className="bg-white p-2 rounded-lg shadow-sm border mb-4">
        <img 
          src={qrCodeDataURL} 
          alt={`${title}のQRコード`}
          className="block"
          style={{ width: size, height: size }}
        />
      </div>

      {/* QRコード情報 */}
      <div className="text-center mb-4">
        <h3 className="font-semibold text-gray-900 ">{title}</h3>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={downloadQRCode}
          className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
          title="QRコード画像をダウンロード"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          ダウンロード
        </button>
      </div>
    </div>
  );
}