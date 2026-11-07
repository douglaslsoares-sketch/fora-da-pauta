# Modelo definitivo: ficha política centrada na pessoa

**Decisão aprovada em 06/11/2026.** A ficha não pertence a uma candidatura: pertence à pessoa pública. Uma candidatura é um acontecimento da sua trajetória.

## Identificadores e histórico
- `pessoaPoliticaId` identifica permanentemente a pessoa, independentemente de eleições, cargos, partidos e períodos sem mandato.
- `candidaturaId` identifica uma participação eleitoral específica; mantém resultados e documentos do TSE daquela eleição.
- Cargos e mandatos são vínculos **com datas de início e fim**, esfera, órgão, situação e fonte. Não inferir exercício de cargo apenas de uma candidatura.
- Filiações partidárias são vínculos **com datas e fontes**; o partido de uma eleição não deve ser apresentado como filiação atual sem confirmação.
- Atos, votos, proposições, declarações e acontecimentos têm data, contexto, fonte e ligação à pessoa; podem também referenciar mandato ou candidatura quando aplicável.
- Uma pessoa pode não ocupar cargo e nem disputar eleições. A identidade não é apagada nem reiniciada por isso.

## Regras de segurança
1. Não unir identidades por semelhança de nomes, mesmo com mesmo cargo ou UF.
2. Só consolidar candidaturas de eleições distintas quando houver prova documental e vínculo confirmado.
3. Identidades `EM_REVISAO` não autorizam transferir histórico entre eleições.
4. Preservar IDs eleitorais e dados originais; migrações devem ter relatório de origem/destino, backup, testes e possibilidade de reversão.
5. Informar datas de referência, fontes e lacunas. Nunca exibir cargo ou partido antigo como atual por falta de atualização.
6. Duda Salabert e os demais vínculos órfãos permanecem em revisão até reconciliação comprovada.
7. Não liberar prévia final ou campanha antes de auditoria de cobertura, veracidade, atualizações e funcionamento.

## Migração progressiva
1. Inventariar todas as páginas, buscas, APIs e dados que usam `candidaturaId` como identidade da pessoa.
2. Criar uma camada de identidade da pessoa sem alterar nem apagar as candidaturas.
3. Criar acesso público por `pessoaPoliticaId`, com redirecionamentos compatíveis para links antigos **somente após confirmação do vínculo**.
4. Associar cargos, filiações e atos a períodos e fontes; separar situação atual de trajetória histórica.
5. Auditar casos confirmados, ambíguos e sem candidatura, além de testes de regressão.
6. Demonstrar na prévia as fichas completas e lacunas documentais, sem publicar automaticamente.

## Oito eixos da ficha política
1. Quem é
2. Formação e trabalho
3. Caminho na política
4. O que fez no exercício do cargo
5. Patrimônio e atividades econômicas
6. Acontecimentos públicos
7. O que diz e o que defende
8. Fontes e atualizações

A linha do tempo atravessa os oito eixos. A ausência de mandato não elimina a pessoa nem a ficha.
