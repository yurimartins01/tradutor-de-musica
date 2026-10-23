# Tradutor De Música com IA
`Next.js` `Tailwind` `Transformer.js`

Existem músicas não tão conhecidas que sua tradução pode não estar disponível na internet.
Com esta aplicação, em poucos segundos o usuário pode traduzir qualquer vídeo ou música com a ajuda da Inteligência Artificial.

## Funcionalidades MVP

### 🎨 UX/UI
- Interface amigável com design feito com Tailwind.
- Campo de entrada para o usuário fazer upload do arquivo de áudio ou vídeo.
- Botão para começar o processo de tradução.
- área de resultado para ver a transcrição e tradução do áudio.
- Informações do processamento do modelo de IA

## 🧠 Modelo de Inteligência Artificial
- Utilizar transformer.js com modelo de transcrição e tradução
- Receber modelo de transcrição de áudio
- Receber modelo de tradução de texto

## ⚙️ Lógica de trancrição e tradução
- Extrair áudio para arrayBuffer (compactar em binário).
- Descompactar Decodificar o arrayBuffer do áudio em PCM Linear(Pulse Code Modulation) com sampleRate de 16000Hz.
- Acessar o canal mono de áudio
- Enviar audio bruto para o Web Worker 
- Fazer download do modelo de IA whisper com Web Worker
- Devolver transcrição e tradução para página web

## 🏛️ Decisões técnicas

### Carregamento do modelo de IA

**Decisão**: o modelo é carregado localmente dentro do navegador.

**Justificativa**: com o modelo de IA sendo carregado direto no navegador a privacidade do usuário é garantida, uma vez que seus dados
nunca saem do dispositivo.

Uma vez feito o download do modelo de IA ele fica armazenado em cache, permitindo ao o usuário transcrever e traduzir novos arquivos offline.
Como o modelo é carregado localmente a latência é zero, ou seja, não haverá atraso causado pela conexão de rede. A Resposta é gerada em tempo real.

Como não é utilizado um servidor o custo com infraestrutura é zero.

**Trade offs**: para fazer o download do modelo o usuário irá consumir sua banda, podendo causar demora dependendo da velocidade de sua rede.

O modelo ocupara espaço no armazenamento do dispositivo do usuário. Se o usuário estiver em um dispositivo com pouco espaço isso pode ser um fator limitante.

A velocidade de transcrição e tradução irá depender do hardware do usuário. Em um computador moderno com boa CPU, será rápido; em um celular de entrada ou
computador antigo, a inferência pode ser mais lenta do que seria em um servidor robusto.

### Arquitetura de processamento

**Decisão**: o processamento de IA é delegado a um Web Worker.

**Justificativa**: ao utilizar um Web Worker, o processamento é feito em uma thread separada. Dessa forma, evitamos o bloqueio da thread principal,
garantindo que a interface do usuário permaneça totalmente fluida e livre de travamentos durante o processo de inferência.