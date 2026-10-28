# Protocolo de Inteligência Territorial · PICAPS

Aplicação web interativa e responsiva do **Protocolo de Inteligência Territorial (versão 2.0)** e do seu guia operacional, na identidade visual da série PICAPS.

O protocolo articula a **vigilância epidemiológica tradicional** e a **vigilância popular em saúde** de modo que o território, por meio da Sala de Cooperação Social (SCS), tenha a primeira e a última palavra sobre o que se vigia, o que os dados significam e o que se exige dos serviços.

**Autoria:** Wagner de Jesus Martins, Fernanda Machiner, Maria Eduarda Silva, Jeferson Martins de Castro
**Realização:** Fundação Oswaldo Cruz – Fiocruz Brasília · CoLaboratório de Ciência, Tecnologia, Inovação e Sociedade (CTIS) · Plataforma de Inteligência Cooperativa com a Atenção Primária à Saúde (PICAPS)

## Módulos

| # | Módulo | Para que serve |
|---|---|---|
| — | Início | A proposta em uma página e o mapa dos módulos |
| 01 | Fundamentos | Três tradições, definição e dimensões da IT, duas vigilâncias, compromissos, transversalidade e os quatro eixos, com as figuras do protocolo |
| 02 | Método | Compromissos, regras de ouro, quatro produtos, os dois instrumentos (INS e PVI), regras de separação e um teste de escolha do instrumento |
| 03 | Ciclo | As cinco fases com pergunta-guia, passos, sinal de alerta, erros a evitar e checklist; os seis ritmos |
| 04 | Leitor de sinais | Matriz de leitura (alerta popular × registro oficial) sobre o mapa da cartografia social; indica quem age primeiro e gera a pergunta para a SCS |
| 05 | Alerta 72 h | Relógio de cada alerta crítico, próximo passo, escalonamento e cálculo de V6 |
| 06 | Triagem | Quatro perguntas que definem o registro de ação, o prazo e o indicador |
| 07 | Visibilização | Cada invisibilidade da identificação à devolução à SCS, com cálculo de V5 |
| 08 | Reunião SCS | Relógio dos sete blocos, presença por segmento, retorno, contestações, Matriz UIC, encaminhamentos e ata |
| 09 | Painel PVI | Metas, leitura e gatilhos dos nove indicadores do Painel de Vigilância Integrada |
| 10 | Agenda | Os ritmos distribuídos a partir do início do ciclo e do dia fixo da reunião |
| 11–14 | Papéis, Governança, Implantação, Riscos | Consulta por ator, simulador de escalonamento, prontidão e parâmetros a pactuar, ameaças e modo contingência |
| 15 | Documentos | Os três documentos de referência, em PDF e Word |

## Como usar

- **Na internet:** abra o endereço do GitHub Pages do repositório.
- **No computador, sem internet:** baixe o repositório (*Code → Download ZIP*), descompacte-o e abra `index.html` com dois cliques. As fontes Barlow estão incluídas em `assets/fonts`, de modo que a identidade visual se mantém sem conexão. Se o navegador restringir arquivos locais, execute um servidor local na pasta:

  ```bash
  python3 -m http.server 8000
  ```

  e abra <http://localhost:8000>.

A aplicação funciona em celular, tablet e computador. Cada módulo tem endereço próprio (por exemplo, `#ciclo`, `#reuniao`), o que permite compartilhar o link de uma ferramenta específica.

## Dados e privacidade

- Os registros (alertas, reuniões, encaminhamentos, painel, checklists) ficam **apenas no navegador do usuário** (`localStorage`, prefixo `itp2:`). Nenhum dado é enviado a servidor, mesmo com o site publicado no GitHub Pages.
- Use **Exportar meus registros (.json)**, em *Dados e privacidade*, para fazer cópia de segurança ou levar os dados para outro aparelho, e **Importar registros** para restaurá-los. Arquivos exportados pela versão anterior (`protocolo-atuacao-it`) também são aceitos.
- **Não registre dados nominais de saúde.** A aplicação é instrumento de apoio e de formação; não substitui a Plataforma Ágora nem os sistemas oficiais.

## Estrutura

```
index.html                 páginas e estrutura
assets/css/style.css       identidade visual (série PICAPS) e layout responsivo
assets/js/app.js           conteúdo do protocolo e lógica das ferramentas
assets/fonts/              Barlow e Barlow Condensed (SIL Open Font License)
assets/img/figs/           figuras do protocolo
docs/                      os três documentos de referência em PDF e Word
```

O conteúdo do protocolo está em constantes no `assets/js/app.js` (`FUND`, `RULES`, `PHASES`, `LSQ`, `REG`, `VTIPOS`, `BLOCKS`, `PV`, `ACTORS`, `SITS`, `STAGES`, `THREATS`, `DOCS`), e cada uma pode ser editada sem alterar a lógica.

## Como citar

MARTINS, W. J.; MACHINER, F.; SILVA, M. E.; CASTRO, J. M. **Protocolo de Inteligência Territorial**. Versão 2.0. Brasília: Fiocruz Brasília/CoLaboratório CTIS/PICAPS, 2026.
