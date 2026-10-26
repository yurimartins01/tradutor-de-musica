"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker>(null);

  const [status, setStatus] = useState<string>("");
  const [textoTraduzido, setTextoTraduzido] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;
    worker.addEventListener("message", async (event: MessageEvent) => {
      const { status, message } = event.data;

      switch(status){
        case "carregando":
        case "processando":
          setStatus(message)
          break

        case "completo":
          setTextoTraduzido(message)
          setLoading(false)
          setStatus("Concluído")
          break

        case "erro":
          setStatus(`Erro: ${message}`)
          setLoading(false)
          break

        default:
          console.warn(`Status desconhecido recebido do worker: ${status}`)
          break
      }
    });

    return () => {
      worker.terminate()
    }
  }, [])

  async function handleClick() {
    const arquivos = inputRef.current?.files

    if (!arquivos || arquivos.length === 0) {
      alert("Por favor, selecione um arquivo du áudio ou de vídeo primeiro.")
      return
    }

    if (!workerRef.current) return

    setLoading(true)

    try {
      const arquivo = arquivos[0]

      const arrayBuffer = await arquivo.arrayBuffer()

      const audioCtx = new AudioContext({
        sampleRate: 16000,
      });

      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

      const dadosAudioBruto = audioBuffer.getChannelData(0)

      workerRef.current.postMessage({ audioData: dadosAudioBruto })
    } catch (err) {
      console.error(err)
      setStatus(
        "Erro ao decodificar o áudio. O formato pode não ser suportado.",
      )
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-slate-900 text-white">
      <h1 className="text-4xl font-bold mb-2 text-center">Tradutor de Músicas Local</h1>
      <h2 className="text-xl mb-8 text-slate-400 text-center">Processamento 100% gratuito no seu navegador</h2>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <input
          className="w-full p-2 border border-slate-700 bg-slate-800 rounded text-slate-300 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          type="file"
          accept="audio/*, video/*"
          ref={inputRef}
          disabled={loading}
        />
        
        <button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-semibold disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
          onClick={handleClick}
          disabled={loading}
        >
          {loading ? "Processando..." : "Gerar Transcrição"}
        </button>
      </div>

      {status && (
        <p className="mt-4 text-sm font-medium text-blue-400">
          Status: {status}
        </p>
      )}

      {textoTraduzido && (
        <div className="mt-8 p-4 bg-slate-800 border border-slate-700 rounded-lg max-w-lg w-full shadow-xl">
          <h3 className="text-lg font-bold mb-2 text-emerald-400">Trancrição em inglês:</h3>
          <p className="whitespace-pre-line text-slate-200 leading-relaxed">
            {textoTraduzido}
          </p>
        </div>
      )}
    </main>
  );
}
