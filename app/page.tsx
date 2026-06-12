export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-cream-50 font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-cream-50 rounded-card">
        <h1 className="text-4xl font-display font-semibold text-brown-700 mb-4">
          Missed You
        </h1>
        <p className="text-lg text-bronze-500 font-serif mb-8">
          真诚交友平台
        </p>
        <div className="flex gap-4">
          <button className="px-8 py-3 bg-bronze-300 text-white rounded-full font-medium hover:bg-bronze-400 transition-colors">
            开始探索
          </button>
          <button className="px-8 py-3 border-2 border-bronze-300 text-bronze-500 rounded-full font-medium hover:bg-cream-100 transition-colors">
            了解更多
          </button>
        </div>
      </main>
    </div>
  );
}
