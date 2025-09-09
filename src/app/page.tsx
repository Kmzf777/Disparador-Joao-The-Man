'use client'

import { useState } from 'react'

export default function Home() {
  const [csvData, setCsvData] = useState('')
  const [message, setMessage] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDispatching, setIsDispatching] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [nonExistentNumbers, setNonExistentNumbers] = useState<any[]>([])
  const [webhookResponse, setWebhookResponse] = useState<string>('')

  const handleDispatchMessages = async () => {
    if (!message.trim() || !csvData.trim()) {
      alert('Por favor, preencha a mensagem e os números.')
      return
    }

    setIsDispatching(true)
    
    try {
      const response = await fetch('https://webhook.canastrainteligencia.com/webhook/disparar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensagem: message,
          numeros: csvData
        })
      })
      
      if (response.ok) {
        alert('Mensagens enviadas com sucesso!')
      } else {
        throw new Error('Erro ao enviar mensagens')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao enviar mensagens. Tente novamente.')
    } finally {
      setIsDispatching(false)
    }
  }

  const handleVerifyNumbers = async () => {
    setIsVerifying(true)
    setNonExistentNumbers([])
    
    try {
      const response = await fetch('https://webhook.canastrainteligencia.com/webhook/verificadorjoao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Dados recebidos do webhook:', data)
        console.log('Tipo dos dados:', typeof data)
        console.log('É array?', Array.isArray(data))
        
        // Armazenar resposta completa para debug
        setWebhookResponse(JSON.stringify(data, null, 2))
        
        // Tratar diferentes formatos de resposta
        let numbersArray = []
        if (Array.isArray(data)) {
          // Se for um array, verificar se o primeiro elemento tem propriedade 'data'
          if (data.length > 0 && data[0] && data[0].data && Array.isArray(data[0].data)) {
            numbersArray = data[0].data
          } else {
            numbersArray = data
          }
        } else if (data && typeof data === 'object') {
          // Se for um objeto, procurar por propriedades que contenham arrays
          if (data.data && Array.isArray(data.data)) numbersArray = data.data
          else if (data.numeros) numbersArray = data.numeros
          else if (data.numbers) numbersArray = data.numbers
          else if (data.inexistentes) numbersArray = data.inexistentes
          else {
            // Se não encontrar arrays conhecidos, converter o objeto em array
            numbersArray = [data]
          }
        } else if (typeof data === 'string' || typeof data === 'number') {
          numbersArray = [data]
        }
        
        console.log('Array processado:', numbersArray)
        setNonExistentNumbers(numbersArray)
      } else {
        throw new Error('Erro ao verificar números')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao verificar números. Tente novamente.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold neon-text mb-4">
            DISPARADOR
          </h1>
          <p className="text-gray-400 text-lg">
            Sistema de envio em massa para WhatsApp
          </p>
        </div>



        {/* Main Content */}
        <div className="space-y-8">
          {/* Message Input */}
          <div>
            <label htmlFor="message" className="block text-neon-green-500 text-sm font-medium mb-3">
              MENSAGEM
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite aqui a mensagem que será enviada para todos os números..."
              className="futuristic-input w-full h-32 resize-none"
              required
            />
            <p className="text-gray-500 text-xs mt-2">
              Esta mensagem será enviada para todos os números válidos
            </p>
          </div>

          {/* CSV Input */}
          <div>
            <label htmlFor="csv" className="block text-neon-green-500 text-sm font-medium mb-3">
              NÚMEROS (CSV)
            </label>
            <textarea
              id="csv"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Cole aqui os números do arquivo CSV...\nExemplo:\n5511999999999\n5511888888888\n5511777777777"
              className="futuristic-input w-full h-48 resize-none font-mono text-sm"
              required
            />
            <p className="text-gray-500 text-xs mt-2">
              Cole os números no formato: um número por linha (com código do país)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={handleDispatchMessages}
              disabled={isDispatching || !message.trim() || !csvData.trim()}
              className={`neon-button text-lg font-semibold px-8 py-4 ${
                isDispatching || !message.trim() || !csvData.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105 transform'
              }`}
            >
              {isDispatching ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-neon-green-500 border-t-transparent rounded-full animate-spin"></div>
                  DISPARANDO...
                </span>
              ) : (
                'DISPARAR'
              )}
            </button>

            <button
              type="button"
              onClick={handleVerifyNumbers}
              disabled={isVerifying}
              className={`neon-button-secondary text-lg font-semibold px-8 py-4 ${
                isVerifying
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105 transform'
              }`}
            >
              {isVerifying ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-neon-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  VERIFICANDO...
                </span>
              ) : (
                'VERIFICAR NÚMEROS'
              )}
            </button>
          </div>
        </div>

        {/* Non-Existent Numbers Table */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></span>
            Números Inexistentes {nonExistentNumbers && Array.isArray(nonExistentNumbers) && nonExistentNumbers.length > 0 && `(${nonExistentNumbers.length})`}
          </h3>
          
          <div className="bg-gray-900/50 border border-red-500/30 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-900/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-red-300 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-red-300 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-red-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-500/20">
                  {nonExistentNumbers && Array.isArray(nonExistentNumbers) && nonExistentNumbers.length > 0 ? (
                    nonExistentNumbers.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-red-900/20 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-red-300 font-mono text-lg font-semibold">
                            {item.numero || item.number || item}
                          </div>
                          {item.id && (
                            <div className="text-xs text-red-400 mt-1">ID: {item.id}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-300 border border-red-500/40">
                              {item.existe === false ? '❌ Não Existe' : item.existe === true ? '✅ Existe' : '❌ Inexistente'}
                            </span>
                            {item.funciona !== undefined && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-300 border border-yellow-500/40 ml-1">
                                {item.funciona === false ? '🚫 Não Funciona' : '✅ Funciona'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="text-gray-400">
                          <div className="text-4xl mb-4">📋</div>
                          <p className="text-lg font-medium mb-2">Nenhuma verificação realizada</p>
                          <p className="text-sm">Clique em "VERIFICAR NÚMEROS" para analisar os números inseridos</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {nonExistentNumbers && Array.isArray(nonExistentNumbers) && nonExistentNumbers.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                Total de números inexistentes encontrados: <span className="text-red-400 font-semibold">{nonExistentNumbers.length}</span>
              </p>
            </div>
          )}
        </div>
          
        {/* Debug Section */}
        {webhookResponse && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">🔍 Debug - Resposta do Webhook:</h3>
            <pre className="text-xs text-gray-300 overflow-auto max-h-40 whitespace-pre-wrap">
              {webhookResponse}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600 text-sm">
            Desenvolvido com{' '}
            <span className="text-neon-green-500">♥</span>{' '}
            para automação de WhatsApp
          </p>
        </div>
      </div>
    </div>
  )
}