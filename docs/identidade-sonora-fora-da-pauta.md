# Identidade sonora — Fora da Pauta
Status: **Voz 01 personalizada criada e salva; primeiro teste de escuta aprovado pelo editor; ainda não integrada à narração dos artigos nem publicada**.
Atualizado em: 29/10/2026.

## Conceito
**Uma conversa entre iguais.** A voz do Fora da Pauta ajuda pessoas com pouco tempo a entender os fatos, a disputa de versões e os interesses presentes nas decisões políticas. Não tenta impor conclusões.

O timbre é brasileiro, adulto, médio-grave, natural, levemente encorpado e caloroso. A entrega é ágil, clara e curiosa; perguntas soam genuínas e as pausas não são arrastadas. A firmeza vem da clareza, não do volume. Sem voz de telejornal, sem propaganda, sem dramatização, sem caricatura de sotaques e sem imitação de qualquer pessoa ou personagem.

A voz é um ativo editorial: deve funcionar em artigos, resumos de Telegram, chamadas curtas e perguntas ao público.

## Prompt de criação da voz — GPT-Live (versão A, principal)

> Create a distinctive **adult Brazilian Portuguese** voice for a public-interest explainer called Fora da Pauta. Native Brazilian Portuguese pronunciation, natural regional-neutral cadence, warm medium-low pitch, subtly textured and resonant timbre, clear diction without exaggerated enunciation. Conversational, alert, thoughtful, approachable and confident. The voice sounds like a knowledgeable neighbor discussing current events as an equal, never lecturing. Brisk, energetic, flowing speech; short natural pauses; genuine curiosity and a slight lift in meaningful questions. Expressive without being theatrical, sarcastic or promotional. Steady level, no forced smile, no radio-announcer or television-news cadence. Human, calm authority, approachable warmth. Designed for accessible civic education and longer-form listening. Do not imitate any existing voice, person or character.

Este texto descreve a identidade acústica; instruções de leitura e os fatos do artigo devem ser fornecidos separadamente.

## Voz salva e teste no GPT-Live — 29/10/2026

- **Nome salvo:** Fora da Pauta — Voz 01.
- **Origem:** criada a partir de descrição (prompt-to-voice) no Voice Playground e salva na biblioteca.
- **Modelo usado no teste:** GPT-Live 1, no Live Playground. A configuração em código apresentava um objeto `audio.output.voice.id` com identificador começando por `voice_`; o identificador completo não foi registrado, e deve ser recuperado da própria biblioteca se necessário.
- **Impressão do editor após ouvir:** "É uma voz feminina. Eu achei que ficou boa, natural, tranquila e com relação à velocidade também é agradável de ouvir, tá legal."
- **Decisão editorial:** manter a **Voz 01 como referência sonora preferida**, sem gerar outra versão por enquanto. Esse é um parecer positivo de **escuta inicial em conversa ao vivo**, não uma aprovação da narração completa de um artigo longo, nem autorização para divulgação.
- **Próxima validação:** testar um texto de artigo mais longo, conferir consistência do ritmo e das pausas; escutar também no celular.

### Descrição usada na criação da Voz 01

> Create an original adult voice speaking natural Brazilian Portuguese. Warm, medium-low pitch, clear and slightly textured timbre. Conversational, engaging and confident, with a lively, fluid pace and short natural pauses. Clear pronunciation without exaggerated articulation. Friendly, thoughtful and expressive, with genuine curiosity in questions. Consistent volume and a relaxed, natural delivery.

**Limitação importante:** a voz criada *a partir de descrição* é suportada no GPT-Live, mas **não** no endpoint de fala `/v1/audio/speech` usado pelo site atualmente. Não substitua `marin` por este `voice_...` na rota de TTS; a viabilidade de áudio em artigos deve ser avaliada separadamente, preservando a versão do site em produção até aprovação. Para o público, identificar sempre a narração como gerada por IA.

## Duas variações para comparação

**B — Mais acolhedora:** mesmo texto da versão A, com tom ligeiramente mais quente e menos grave, mantendo andamento ágil e clareza. Evitar qualquer voz infantilizada ou terapêutica.

**C — Mais investigativa:** mesmo texto da versão A, com articulação um pouco mais definida e curiosidade mais presente nas perguntas, sem suspense ou dramatização.

As três versões devem usar **o mesmo roteiro** de teste, no mesmo idioma, sem alterar palavras, para permitir comparação justa.

## Roteiro fixo de teste (aproximadamente 35 segundos, dependendo do ritmo)

"Lula venceu a eleição. No dia seguinte, O Globo reconheceu a vitória — e passou a dizer o que esperava do novo governo.

Mas você já pensou em uma coisa?

Quem decide como o presidente deve governar? O eleitor? O Congresso? Os jornais?

Uma coisa é informar quem venceu. Outra é recomendar o que o vencedor deveria fazer.

E é justamente aí que começa a nossa conversa."

## Ritmo e critérios de aprovação

- Ritmo de referência aprovado na **demonstração com voz do navegador**: 1,75×. Essa taxa **não é automaticamente equivalente** à velocidade do GPT-Live ou de outra voz gerada. Ajustar por escuta, não converter mecanicamente.
- Compreensão: 0 a 5 — palavras reconhecíveis na primeira audição.
- Naturalidade: 0 a 5 — soa como conversa, não texto mecanicamente lido.
- Proximidade: 0 a 5 — não fala de cima para baixo.
- Perguntas: 0 a 5 — expressivas sem dramatização.
- Identidade: 0 a 5 — soa adequada a diversos artigos do Fora da Pauta.
- Avaliação em fones e alto-falante; computador e celular; ao menos um teste de artigo longo antes da aprovação.

## Viabilidade técnica — situação em outubro de 2026

1. **Prompt-to-voice** cria uma voz salva a partir de descrição na OpenAI API, mas funciona em **GPT-Live**, não na rota de Speech/TTS que o projeto usa hoje. Uma voz criada nessa modalidade **não deve ser inserida como** `voice` em `/v1/audio/speech`.
2. **Voz personalizada via gravação** pode servir aos endpoints de TTS, mas exige amostra de voz autorizada, consentimento e acesso ao recurso. Não gravar nem clonar voz de terceiros sem autorização.
3. O site usa atualmente `gpt-4o-mini-tts`, voz `marin`, em `/api/audio/ler`; a prévia editorial usa a voz do navegador. Uma eventual alteração para voz nova requer testes independentes.
4. A documentação da OpenAI informa descontinuação do modelo `gpt-4o-mini-tts` em 06/01/2027; planejar migração de áudio antes disso.
5. É necessário sinalizar ao público que a voz é **gerada por IA**.

**NÃO EXECUTAR:** ativação para toda a audiência; criação automática de voz com uso de API; uso de chaves de produção em páginas de Preview; publicação de artigo ou disparo de Telegram sem aprovação.

Fontes técnicas:
- https://developers.openai.com/api/docs/guides/custom-voices
- https://developers.openai.com/api/reference/resources/audio/subresources/voices/methods/create
- https://developers.openai.com/api/docs/guides/text-to-speech
- https://developers.openai.com/api/reference/resources/audio/subresources/speech/methods/create
