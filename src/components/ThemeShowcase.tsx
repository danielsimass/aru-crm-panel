/**
 * Componente de demonstração do tema
 * Mostra todas as cores e variações disponíveis
 */

export default function ThemeShowcase() {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
        Paleta de Cores - ARU CRM
      </h2>

      {/* Cores Primárias */}
      <section>
        <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
          Cores Primárias
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {[500, 600, 700, 400, 300].map((shade) => (
            <div key={shade} className="text-center">
              <div
                className={`h-20 rounded-lg bg-primary-${shade} mb-2 shadow-soft`}
              />
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                primary-{shade}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cores Secundárias */}
      <section>
        <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
          Cores Secundárias
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {[500, 600, 700, 400, 300].map((shade) => (
            <div key={shade} className="text-center">
              <div
                className={`h-20 rounded-lg bg-secondary-${shade} mb-2 shadow-soft`}
              />
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                secondary-{shade}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cores de Estado */}
      <section>
        <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
          Cores de Estado
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="h-20 rounded-lg bg-success-500 mb-2 shadow-soft" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              success
            </p>
          </div>
          <div className="text-center">
            <div className="h-20 rounded-lg bg-warning-500 mb-2 shadow-soft" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              warning
            </p>
          </div>
          <div className="text-center">
            <div className="h-20 rounded-lg bg-error-500 mb-2 shadow-soft" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              error
            </p>
          </div>
          <div className="text-center">
            <div className="h-20 rounded-lg bg-info-500 mb-2 shadow-soft" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              info
            </p>
          </div>
        </div>
      </section>

      {/* Exemplos de Botões */}
      <section>
        <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
          Exemplos de Botões
        </h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all duration-200 shadow-soft">
            Primário
          </button>
          <button className="px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white font-medium rounded-xl transition-all duration-200 shadow-soft">
            Secundário
          </button>
          <button className="px-6 py-3 bg-success-500 hover:bg-success-600 text-white font-medium rounded-xl transition-all duration-200 shadow-soft">
            Sucesso
          </button>
          <button className="px-6 py-3 bg-warning-500 hover:bg-warning-600 text-white font-medium rounded-xl transition-all duration-200 shadow-soft">
            Aviso
          </button>
          <button className="px-6 py-3 bg-error-500 hover:bg-error-600 text-white font-medium rounded-xl transition-all duration-200 shadow-soft">
            Erro
          </button>
        </div>
      </section>

      {/* Cards de Exemplo */}
      <section>
        <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
          Cards de Exemplo
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft-lg p-6 border border-neutral-200 dark:border-neutral-700">
            <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-2">
              Card Primário
            </h4>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Exemplo de card usando o tema
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft-lg p-6 border border-secondary-200 dark:border-secondary-800">
            <h4 className="font-semibold text-secondary-600 dark:text-secondary-400 mb-2">
              Card Secundário
            </h4>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Exemplo de card usando cor secundária
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-soft-lg p-6 text-white">
            <h4 className="font-semibold mb-2">Card com Gradiente</h4>
            <p className="text-white/90 text-sm">
              Exemplo de card com gradiente
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
