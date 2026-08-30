# Ideia 002 — Rede social aberta com identidade verificada

## Visão

No futuro, o Fora da Pauta poderá evoluir para um ambiente social
próprio.

Qualquer pessoa poderá acessar e ler os conteúdos publicados.

A publicação editorial continuará sendo feita exclusivamente
pelo próprio Fora da Pauta.

Os usuários não publicarão posts próprios.

A participação acontecerá principalmente por meio de comentários,
respostas e, futuramente, conversas entre participantes.

## Leitura aberta

A leitura deverá permanecer aberta.

Não será necessário cadastro apenas para acessar uma edição,
ler uma matéria ou conhecer o conteúdo do projeto.

## Cadastro para participar

Para comentar ou participar das conversas, a pessoa deverá possuir
cadastro com identidade verificada.

A ideia é utilizar dados ou mecanismos capazes de confirmar que
existe uma pessoa real por trás daquela conta.

Poderá ser utilizado CPF ou outra forma segura de verificação
de identidade.

Objetivos:

- dificultar perfis falsos;
- dificultar múltiplos cadastros fraudulentos;
- aumentar a responsabilização por aquilo que é publicado;
- melhorar a capacidade de moderação;
- dificultar ações coordenadas por contas falsas.

A identidade verificada não elimina, por si só, a possibilidade
de alguém divulgar informações falsas. Por isso, ainda deverão
existir regras de comunidade, moderação e mecanismos de denúncia.

## Privacidade da identidade real

A identidade real da pessoa não deverá ser exibida publicamente.

Dados como CPF deverão ser tratados apenas para a finalidade
necessária e com proteção adequada.

O projeto deverá buscar coletar e armazenar o mínimo possível
de dados pessoais.

Quando houver solução técnica adequada, poderá ser preferível
receber de um serviço de verificação apenas a confirmação de que
a identidade é válida, evitando guardar dados sensíveis sem
necessidade.

## Referência pública única

Depois da verificação, o próprio sistema atribuirá ao participante
uma referência pública única e permanente.

Exemplo meramente ilustrativo:

`FP-7K4M2`

A pessoa não escolherá:

- nickname;
- apelido;
- nome de usuário público;
- nome de exibição.

A referência será criada automaticamente pelo sistema.

## Regras da referência

A referência pública deverá:

- ser única;
- permanecer vinculada à mesma conta;
- não revelar o nome real;
- não ser derivada diretamente do CPF;
- não permitir deduzir dados pessoais;
- ser gerada de forma segura;
- identificar publicamente a mesma pessoa ao longo do tempo.

Arquitetura desejada:

**identidade real verificada em privado + referência pública
atribuída pelo sistema.**

## Comentários por voz

A forma principal de criar um comentário será pela fala.

A interface deverá privilegiar a gravação de áudio, em vez de
exigir que a pessoa digite o comentário.

Fluxo:

1. a pessoa toca em **Comentar**;
2. grava sua fala;
3. o sistema transcreve o áudio;
4. a transcrição é exibida para conferência;
5. a pessoa pode corrigir erros;
6. somente depois da confirmação o comentário é publicado.

## O que aparece publicamente

O comentário público será o texto transcrito.

O áudio original não deverá aparecer publicamente.

Exemplo:

**FP-7K4M2**

> Eu vejo essa questão de outra forma porque...

## Revisão da transcrição

Antes da publicação, a pessoa deverá obrigatoriamente poder
revisar o texto produzido pelo reconhecimento de voz.

Isso é especialmente importante para:

- nomes próprios;
- números;
- datas;
- siglas;
- termos técnicos;
- palavras pouco comuns.

Princípio:

**a pessoa fala → o sistema transcreve → a pessoa confere →
o texto é publicado.**

## Áudio original

O Fora da Pauta deverá seguir um princípio de minimização de dados.

O áudio deverá ser mantido apenas pelo tempo necessário para:

- realizar a transcrição;
- permitir a conferência;
- concluir o fluxo de publicação.

Se não houver necessidade técnica, jurídica ou de moderação,
o áudio poderá ser descartado depois da confirmação.

## Respostas encadeadas

Participantes poderão responder diretamente uns aos outros.

Exemplo:

**FP-3H8Q1 respondeu a FP-7K4M2**

As respostas deverão formar conversas encadeadas, permitindo
acompanhar quem respondeu a quem sem revelar nomes reais.

## Conversas entre participantes

No futuro, poderá existir interação mais direta entre participantes,
semelhante aos antigos sistemas de bate-papo.

A identificação continuará sendo feita pelas referências públicas
atribuídas pelo sistema.

Se houver mensagens diretas, deverão existir mecanismos como:

- bloquear participante;
- denunciar abuso;
- impedir novas mensagens;
- registrar violações;
- permitir moderação.

## Princípio estrutural

A arquitetura pretendida é:

**leitura aberta + publicação editorial centralizada +
participação mediante identidade verificada +
identidade pública por referência única.**

## Status

Ideia para desenvolvimento futuro.

Não implementar a estrutura social completa neste momento.