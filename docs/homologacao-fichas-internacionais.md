# Critérios de homologação — fichas internacionais

**Ambiente:** ramo `quero-entender-melhor`; não publicar.

## Conferência de conteúdo (manual e documental)
- Confirmar identidade e grafia oficial em fonte primária.
- Verificar datas de início e fim de cada cargo e mudanças de partido; indicar data de referência quando o vínculo estiver em curso.
- Conferir se cada URL abre e sustenta exatamente a afirmação exibida, inclusive para períodos históricos.
- Separar decisões oficiais, declarações, acusações, investigações, processos e conclusões; não transformar alegações em fatos.
- Não tratar a ausência de acontecimentos cadastrados como ausência de atuação.
- Preencher os oito eixos da Ficha Política ou identificar expressamente lacunas documentais.
- Conferir tradução e contexto de fontes em outros idiomas.
- Identificar informações sujeitas a mudança, incluindo situação atual e data da última verificação.

## Conferência de experiência (celular)
- Pesquisar Trump e Netanyahu na busca geral de fichas; abrir cada resultado.
- Verificar legibilidade, rolagem, fontes clicáveis e acessibilidade em telas pequenas.
- Conferir retorno à busca sem perder o contexto.
- Conferir que a pesquisa de acompanhamento não oferece inscrição internacional inexistente.
- Verificar links antigos e endereço permanente `/pessoas/[id]`.
- Repetir para um político brasileiro com identidade confirmada e para um caso `EM_REVISAO`.

## Critérios para aprovação
- Compilação e testes automatizados aprovados.
- Navegação real testada em navegador e celular.
- Nenhuma identidade ambígua associada automaticamente.
- Fontes conferidas e lacunas apresentadas sem induzir o leitor a erro.
- Backup e segurança avaliados.
- Prévia revisada e autorização expressa do responsável pelo projeto.

**Estado:** roteiro de homologação; não significa que os itens já foram executados.

## Evidências técnicas registradas em 06/11/2026
- Compilação aprovada: https://github.com/douglaslsoares-sketch/fora-da-pauta/actions/runs/42201025431
- Integração aprovada: https://github.com/douglaslsoares-sketch/fora-da-pauta/actions/runs/42201025448
- Teste anterior de celular aprovado: https://github.com/douglaslsoares-sketch/fora-da-pauta/actions/runs/42200756037
- Novo teste de celular após ordenação dos cargos: execução https://github.com/douglaslsoares-sketch/fora-da-pauta/actions/runs/42201025499 — em andamento no momento desta anotação.

**Limite dos testes:** a automação atual abre as fichas por URL e testa o retorno à busca, mas **não preenche o campo de pesquisa da página**. Não marcar o fluxo completo de busca como homologado. O teste automatizado também não comprova o conteúdo histórico das fontes.
