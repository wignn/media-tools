export function LoadingSkeleton({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div
      className={`min-h-screen flex flex-col items-center transition-colors duration-300 p-8 box-border ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800'
          : 'bg-gradient-to-br from-blue-100 via-purple-100 to-blue-50'
      }`}
    >
      <div className="flex flex-col w-full max-w-[1280px] gap-8">
        <main className="flex-1 w-full">
          <div className="flex flex-wrap gap-8 justify-center">
            <div className="flex-[2_1_600px] flex flex-col gap-6 min-w-[300px]">
              <div
                className={`p-6 rounded-2xl border shadow-xl transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                    : 'bg-white/70 border-gray-200/50 backdrop-blur-sm'
                }`}
              >
                <div
                  className={`h-4 w-32 rounded mb-4 animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                />
                <div
                  className={`h-12 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                />
              </div>
              <div
                className={`p-6 rounded-2xl border shadow-xl transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                    : 'bg-white/70 border-gray-200/50 backdrop-blur-sm'
                }`}
              >
                <div
                  className={`h-4 w-28 rounded mb-4 animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                />
                <div className="flex gap-4">
                  <div
                    className={`h-12 w-24 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                  />
                  <div
                    className={`h-12 w-24 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                  />
                </div>
              </div>
              <div
                className={`p-6 rounded-2xl border shadow-xl transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                    : 'bg-white/70 border-gray-200/50 backdrop-blur-sm'
                }`}
              >
                <div
                  className={`h-4 w-36 rounded mb-4 animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                />
                <div className="flex gap-4">
                  <div
                    className={`h-12 flex-1 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                  />
                  <div
                    className={`h-12 w-24 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex-[1_1_300px] flex flex-col gap-6 min-w-[280px]">
              <div
                className={`p-6 rounded-2xl border shadow-xl transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                    : 'bg-white/70 border-gray-200/50 backdrop-blur-sm'
                }`}
              >
                <div
                  className={`h-4 w-32 rounded mb-4 animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div
                      className={`h-3 w-12 rounded mb-2 animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                    />
                    <div
                      className={`h-6 w-20 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                    />
                  </div>
                  <div>
                    <div
                      className={`h-3 w-8 rounded mb-2 animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                    />
                    <div
                      className={`h-6 w-16 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                    />
                  </div>
                </div>
              </div>

              <div
                className={`p-6 rounded-2xl border shadow-xl transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                    : 'bg-white/70 border-gray-200/50 backdrop-blur-sm'
                }`}
              >
                <div
                  className={`h-4 w-24 rounded mb-4 animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                />
                <div
                  className={`h-2 rounded-full mb-4 animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                />
                <div
                  className={`h-6 w-16 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                />
              </div>

              <div
                className={`p-6 rounded-2xl border shadow-xl transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                    : 'bg-white/70 border-gray-200/50 backdrop-blur-sm'
                }`}
              >
                <div
                  className={`h-12 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                />
              </div>
            </div>
          </div>
        </main>

        <div className="mt-16 w-full">
          <div
            className={`p-8 rounded-2xl border shadow-xl transition-colors duration-300 ${
              isDarkMode
                ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                : 'bg-white/70 border-gray-200/50 backdrop-blur-sm'
            }`}
          >
            <div
              className={`h-6 w-40 rounded mb-6 animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            />
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600/50'
                      : 'bg-gray-50/70 border-gray-200/50'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-8 w-20 rounded-full animate-pulse ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                      />
                      <div>
                        <div
                          className={`h-4 w-48 rounded mb-2 animate-pulse ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                        />
                        <div
                          className={`h-3 w-32 rounded animate-pulse ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div
                        className={`h-8 w-8 rounded animate-pulse ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                      />
                      <div
                        className={`h-8 w-8 rounded animate-pulse ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                      />
                    </div>
                  </div>
                  <div
                    className={`h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
          <div
            className={`absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse opacity-20 ${
              isDarkMode ? 'bg-purple-500' : 'bg-indigo-400'
            }`}
          ></div>
          <div
            className={`absolute top-2/3 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse opacity-20 ${
              isDarkMode ? 'bg-blue-500' : 'bg-purple-400'
            }`}
            style={{ animationDelay: '1000ms' }}
          ></div>
          <div
            className={`absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full blur-3xl animate-pulse opacity-20 ${
              isDarkMode ? 'bg-indigo-500' : 'bg-blue-400'
            }`}
            style={{ animationDelay: '2000ms' }}
          ></div>
        </div>
      </div>
    </div>
  )
}
