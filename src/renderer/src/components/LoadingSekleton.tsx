"use client";

export function LoadingSkeleton({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div
      className={`h-screen flex overflow-hidden transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-indigo-50 via-white to-purple-50"
      }`}
    >
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
              <div className="xl:col-span-2 flex flex-col gap-6">
                <div
                  className={`p-6 rounded-2xl border shadow-xl transition-colors duration-300 ${
                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  <div className={`h-4 rounded mb-4 animate-pulse ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
                  <div className={`h-12 rounded-lg animate-pulse ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
                </div>
                <div
                  className={`p-6 rounded-2xl border shadow-xl transition-colors duration-300 ${
                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  <div className={`h-4 rounded mb-4 animate-pulse ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
                  <div className="flex gap-4">
                    <div className={`h-12 w-24 rounded-lg animate-pulse ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
                    <div className={`h-12 w-24 rounded-lg animate-pulse ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl border shadow-xl transition-colors duration-300 ${
                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  <div className={`h-4 rounded mb-4 animate-pulse ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
                  <div className="flex gap-4">
                    <div className={`h-12 flex-1 rounded-lg animate-pulse ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
                    <div className={`h-12 w-24 rounded-lg animate-pulse ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex flex-col gap-6">
                <div
                  className={`p-6 rounded-2xl border shadow-xl transition-colors duration-300 ${
                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  <div className={`h-4 rounded mb-4 animate-pulse ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
                  <div className={`h-2 rounded-full mb-4 animate-pulse ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
                  <div className={`h-6 rounded animate-pulse ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
                </div>

                <div
                  className={`p-6 rounded-2xl border shadow-xl transition-colors duration-300 ${
                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  <div className={`h-12 rounded-lg animate-pulse ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
