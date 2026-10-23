import { pipeline, env, type ProgressInfo, type AutomaticSpeechRecognitionPipeline } from "@huggingface/transformers";

env.allowLocalModels = false;

// let transcritor: AutomaticSpeechRecognitionPipeline | null = null;
let transcritor: AutomaticSpeechRecognitionPipeline | null = null;

self.addEventListener("message", async (event: MessageEvent) => {
  const { audioData } = event.data;
  if (!audioData) return;

  try {
    if (!transcritor) {
      self.postMessage({
        status: "carregando",
        message:
          "Carregando o modelo Whisper (isso pode demorar na primeira vez)...",
      });

      transcritor = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-base",
        {
          progress_callback: (progresso: ProgressInfo) => {
            if (progresso.status === "progress") {
              self.postMessage({
                status: "carregando",
                message: `Baixando modelo: ${Math.round(progresso.progress ?? 0)}%`,
              });
            }
          },
        },
      );
    }

    self.postMessage({ status: 'processando', message: 'A Inteligência Artificial está transcrevendo e traduzindo o seu arquivo...' })

    const resultado = await transcritor(audioData, {
      task: 'transcribe',
      repetition_penalty: 1.2,
      condition_on_previous_text: false,
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: true,
      no_speech_threshold: 0.6,
      temperature: 0.2,
    });

    self.postMessage({ status: 'completo', message: resultado })


  } catch (err) {
    const mensagemDeErro = err instanceof Error ? err.message : 'Erro desconhecido no processamento.'
    self.postMessage({ status: 'erro', message: mensagemDeErro });
  }
});
