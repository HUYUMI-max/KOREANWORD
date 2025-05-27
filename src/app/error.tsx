'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('エラーが発生しました:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">エラーが発生しました</h2>
      <p className="text-gray-600 mb-4">申し訳ありません。問題が発生しました。</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
      >
        もう一度試す
      </button>
    </div>
  );
} 