/* Protocolo de Inteligência Territorial — PICAPS · v2.0
   Aplicação estática, sem dependências, na identidade visual da série PICAPS.
   Autoria: Wagner de Jesus Martins, Fernanda Machiner, Maria Eduarda Silva, Jeferson Martins de Castro.
   Os registros ficam no localStorage do navegador (prefixo "itp2:"). */
"use strict";
/* ---------- utilidades ---------- */
const S = {
  get(k, d){ try{ const v = localStorage.getItem("itp2:" + k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem("itp2:" + k, JSON.stringify(v)); }catch(e){} }
};
const $ = (s, el) => (el || document).querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const pad = n => String(n).padStart(2, "0");
const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const parseISO = s => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const DOWS = ["dom","seg","ter","qua","qui","sex","sáb"];
const fmtD = d => pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear();
const fmtDH = ms => { const d = new Date(ms); return fmtD(d) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()); };
const localDT = ms => { const d = new Date(ms); return iso(d) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()); };
const today = new Date(); today.setHours(0, 0, 0, 0);
async function copyText(text){
  try{ await navigator.clipboard.writeText(text); return true; }
  catch(e){ const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); let ok = false; try{ ok = document.execCommand("copy"); }catch(_){} t.remove(); return ok; }
}
function flash(btn, msg){ const o = btn.textContent; btn.textContent = msg; setTimeout(() => { btn.textContent = o; }, 1600); }
function segBtns(name, opts, val){
  return '<div class="seg" role="group" data-q="' + name + '">' + opts.map(o => '<button type="button" data-v="' + esc(o[0]) + '" aria-pressed="' + (String(val) === String(o[0])) + '">' + esc(o[1]) + "</button>").join("") + "</div>";
}

/* ---------- dados do protocolo ---------- */

const COMMIT = [
  ["Visibilização social", "O que o território sabe e os sistemas não registram chega, verificado, aos registros oficiais. A cartografia social é o instrumento central."],
  ["Empoderamento", "O território lê a própria realidade, contesta os dados que o descrevem e age, inclusive questionando a própria PICAPS."],
  ["Governança participativa", "A SCS define a agenda, valida e contesta dados, delibera prioridades e cobra resposta, com prazos e registro."]
];
const THINK = ["Pergunta", "Dado", "Leitura no mapa", "Sala (SCS)", "Decisão", "Ação registrada", "Retorno à Sala"];
const RULES = [
  ["Nada sem a SCS", "Nenhuma decisão sobre dados ou ações no território é tomada sem deliberação da comunidade na Sala."],
  ["O dado informa; a Sala decide", "Um valor alto no INS ou um sinal no Painel gera uma pergunta para a SCS, nunca uma ação automática."],
  ["Dois fluxos, um mapa", "Alertas populares e registros oficiais são sempre lidos juntos, sobre o mapa da cartografia social, no contexto do INS."],
  ["72 horas", "Todo alerta crítico tem resposta registrada em até 72 horas, inclusive a ausência de resposta."],
  ["O invisível verificado torna-se registro", "Toda invisibilidade verificada torna-se registro oficial."],
  ["Medir não é deliberar", "O INS tem pesos fixos; o território delibera sobre o uso de seus resultados."],
  ["Devolver antes de publicar", "O território conhece os resultados antes da gestão, da academia e dos financiadores."],
  ["Resolver no nível mais próximo", "Decidir no nível mais próximo do território, com plano de contingência para a indisponibilidade da Plataforma Ágora."]
];
const PRODUCTS = [["Resposta","aos alertas"],["Programação","dos serviços ajustada às prioridades do território"],["Visibilização","do que os sistemas não viam"],["Exigibilidade","junto à gestão"]];
const SEPRULES = [
  ["Dados da intervenção ficam no Painel", "Alertas, reuniões, respostas e participação não entram no INS: sua variação reflete a atividade da SCS e seria confundida com mudança no território."],
  ["Morbimortalidade e oferta ficam fora do índice", "Doenças e óbitos validam o INS e aparecem como sinais no Painel; cobertura de serviços é lida à parte, na análise de lacunas."],
  ["Pesos fixos", "O INS tem pesos fixos em cada versão. A participação do território entra na cartografia social, na verificação territorial e na deliberação; a Matriz UIC prioriza problemas, não pondera indicadores."],
  ["Do INS ao mapa", "O INS-DF indica quais Regiões Administrativas têm maior necessidade; dentro delas, o mapa da cartografia social indica por onde começar."]
];
const INSTR = [
  {k:"ins", n:"INS", sub:"Índice de Necessidade de Saúde", q:"Onde a necessidade de saúde é maior?", esc:"Município (INS-M) e Região Administrativa (INS-DF)", mede:"Necessidade potencial de cuidado: 11 indicadores em 4 dimensões", rit:"Anual", use:"Escolher territórios de implantação; reivindicar recursos", nao:"Comparar áreas dentro do território"},
  {k:"pvi", n:"PVI", sub:"Painel de Vigilância Integrada", q:"O que as duas vigilâncias sinalizam e o que foi feito?", esc:"Microárea e território da SCS", mede:"Sinais, convergência, visibilização, resposta e participação: 9 indicadores, não agregados", rit:"Mensal (V5 e V8 trimestrais)", use:"Conduzir a reunião; cobrar resposta; avaliar a articulação", nao:"Medir vulnerabilidade ou necessidade"}
];
const WHICH = [
  {s:"Escolher em quais Regiões Administrativas implantar novas SCS", a:"INS", w:"O INS compara a necessidade de saúde entre municípios e Regiões Administrativas. Dentro do território já escolhido, a prioridade é lida no mapa da cartografia social."},
  {s:"Decidir em quais microáreas a busca ativa começa", a:"nenhum", w:"Nenhum dos dois. Dentro do território, a prioridade é lida no mapa da cartografia social, com as áreas de risco e as prioridades do Plano Popular. Verificar se o risco é do lugar, das pessoas ou de ambos indica quem age primeiro."},
  {s:"Saber se a UBS está respondendo aos alertas críticos", a:"PVI", w:"É o V6 do Painel: proporção de alertas críticos com resposta em até 72 horas, acompanhada do tempo mediano."},
  {s:"Mostrar à gestão que a SCS funcionou depois de um ano", a:"PVI", w:"O Painel avalia a articulação (confirmação, antecipação, visibilização, resposta). O INS não avalia a intervenção, e as incorporações aos registros oficiais constituem revisão de medida, não mudança do território."},
  {s:"Comparar duas microáreas vizinhas", a:"nenhum", w:"O INS não alcança o interior do território, e o Painel não mede necessidade. A comparação é feita no mapa da cartografia social, com os sinais das duas vigilâncias, e deliberada na SCS."},
  {s:"Saber se os alertas populares se confirmam", a:"PVI", w:"É o V3: na coorte de alertas de três meses antes, a proporção de verificados e, entre estes, a de confirmados. Muitos alertas sem verificação indicam falha do serviço, e não da vigilância popular."},
  {s:"Reivindicar recursos para o território junto à secretaria", a:"INS", w:"O INS sustenta a reivindicação entre territórios. No advocacy, deve vir acompanhado da cartografia social e do histórico de respostas do Painel."},
  {s:"Somar alertas populares ao INS para refinar a medida", a:"nenhum", w:"Nunca. Dados produzidos pela intervenção ficam apenas no Painel; somá-los ao INS faria a atividade da SCS ser confundida com necessidade de saúde."}
];

const PHASES = [
  {id:"F1", n:"Captação de sinais", rit:"Contínuo · revisão semanal", c:"var(--f1)",
   q:"O que está acontecendo no território agora, segundo quem vive nele e segundo os registros oficiais?",
   quem:"Pesquisadores populares (fluxo popular); equipes de APS e vigilância (fluxo tradicional); supervisor de campo (revisão); técnico de dados (carga)",
   quando:"Contínuo; revisão às segundas; carga oficial semanal", com:"Plataforma Ágora; SINAN; e-SUS APS; LIRAa e alertas da Defesa Civil como camada de contexto",
   prod:"Alertas e registros oficiais sobre o mesmo mapa da cartografia social; alertas críticos encaminhados",
   passos:["<b>Observar e registrar</b> na Ágora no momento da observação: categoria, local, data e hora, descrição e urgência. O que não se enquadra nas categorias entra como “não previsto”.","<b>Classificar a urgência.</b> A urgência máxima aciona imediatamente o fluxo de 72 horas (F4).","<b>Atualizar a cartografia social</b> com nova área de risco, ponto crítico ou família fora dos cadastros: o item segue para a lista de verificação.","<b>Carregar o fluxo tradicional.</b> Dados nominais ficam no ambiente seguro; à Ágora chegam apenas contagens por microárea e semana.","<b>Revisar semanalmente:</b> o supervisor devolve alertas incompletos e destaca os críticos para a Dupla."],
   alerta:"Queda de alertas em uma microárea com área de risco ou prioritária mapeada, ou pesquisadores sem registro no mês (V9 baixo). O silêncio pode indicar ausência de problema ou ausência de observação.",
   erros:["Esperar a reunião para registrar um evento.","Descartar o “não previsto”: é com ele que o sistema aprende.","Levar dados nominais de saúde para a Ágora ou para a reunião.","Ler o número de alertas como medida de gravidade."],
   pvi:["V1","V2","V9"],
   ck:["Alertas da semana revisados (segunda-feira)","Críticos destacados para a Dupla","Contagens oficiais carregadas por microárea","Cartografia social atualizada com novos pontos","Nenhum dado nominal na Ágora"]},
  {id:"F2", n:"Integração e análise", rit:"Mensal · INS anual", c:"var(--f2)",
   q:"Onde as duas vigilâncias convergem, onde divergem, o que nenhuma registra, e em que lugar do mapa do território isso acontece?",
   quem:"Técnico de dados do CTIS (executa); Vigilância em Saúde (valida a leitura epidemiológica); supervisor de campo (DPT); pesquisadores populares (relatos)",
   quando:"Mensal, com entrega à Dupla antes da reunião; INS anual", com:"Ambiente seguro da secretaria; Ágora (apenas agregados); mapa da cartografia social; PVI; DPT",
   prod:"Relatório de dados formulado em perguntas; mapa atualizado; lista de convergências, antecipações, divergências e invisibilidades; lista de verificação",
   passos:["<b>Cruzar no ambiente seguro</b> por microárea, categoria compatível e janela de tempo.","<b>Classificar cada sinal na matriz de leitura</b> (use o Leitor de sinais).","<b>Situar no mapa:</b> área de risco ou prioritária mapeada; risco do lugar, das pessoas ou de ambos.","<b>Calcular o PVI do mês</b>, com V4 sempre ao lado do valor esperado ao acaso.","<b>Montar a lista de verificação</b> com o serviço responsável por cada item.","<b>Escrever o relatório como perguntas</b> para a SCS, não como conclusões.","<b>No ano:</b> atualizar o INS; registrar como revisão de medida as incorporações que corrigem registros oficiais."],
   alerta:"Relatório entregue no dia da reunião; lista de invisibilidades vazia por meses; V4 sem o valor esperado ao acaso.",
   erros:["Tratar divergência como erro de uma das vigilâncias.","Usar o INS para comparar áreas dentro do território.","Somar o PVI ao INS.","Ler incorporações aos registros oficiais como mudança do território.","Levar à Sala conclusões prontas."],
   pvi:["V3","V4"],
   ck:["Cruzamento feito no ambiente seguro","Cada sinal classificado na matriz de leitura","Área mapeada e tipo de risco anotados","PVI do mês calculado (V4 com o acaso)","Lista de verificação montada","Relatório entregue à Dupla antes da reunião"]},
  {id:"F3", n:"Interpretação e deliberação", rit:"Mensal, na SCS", c:"var(--f3)",
   q:"O que esses sinais significam para nós, o que priorizamos e o que vamos exigir?",
   quem:"Dupla de Facilitação (conduz); pesquisadores populares (protagonistas); APS e vigilância (perspectiva clínica e epidemiológica)",
   quando:"Reunião mensal de cerca de duas horas", com:"Painel e mapa; relatório de dados; Matriz UIC; ata",
   prod:"Ata com prioridades, contestações e encaminhamentos com responsável, prazo e registro",
   passos:["<b>Abertura:</b> presença por segmento.","<b>Retorno</b> de cada encaminhamento anterior, inclusive os sem resposta.","<b>Leitura do mapa</b>, começando pelos pesquisadores populares.","<b>Convergências e divergências:</b> o que a Sala contesta?","<b>Priorização pela Matriz UIC</b>, por problema.","<b>Encaminhamentos</b> com responsável, prazo e registro de ação.","<b>Ata</b> lida e assinada."],
   alerta:"Técnicos falam mais que pesquisadores populares; nenhuma contestação por vários meses; encaminhamentos sem responsável ou prazo.",
   erros:["Deixar o número decidir.","Omitir o retorno dos encaminhamentos.","Usar a Matriz UIC para mudar pesos de índices.","Tratar divergência como erro de um dos lados."],
   pvi:["V7","V9"],
   ck:["Presença por segmento registrada","Retorno de todos os encaminhamentos anteriores","Pesquisadores populares falaram primeiro","Contestações registradas","Prioridades pela Matriz UIC","Encaminhamentos com responsável, prazo e registro","Ata lida e assinada"]},
  {id:"F4", n:"Ação e exigibilidade", rit:"48 horas a 180 dias", c:"var(--f4)",
   q:"Quem responde, o quê, até quando, e o que fazer se não houver resposta?",
   quem:"Responsáveis da ata; equipes de APS e vigilância; Dupla (prazos); Nível 2 (escalonamento)",
   quando:"Resposta imediata 48–72 h; incorporação até a reunião seguinte; ação planejada 30–90 dias; advocacy 90–180 dias", com:"Triagem em quatro registros; relógio de 72 horas; quadro de incorporação",
   prod:"Respostas registradas (inclusive a falta delas); programação das equipes ajustada (APPT); incorporações",
   passos:["<b>Triar</b> cada encaminhamento em um dos quatro registros.","<b>Alertas críticos:</b> relógio de 72 horas; sem resposta, o Nível 2 notifica a coordenação regional.","<b>Ação planejada</b> entra na programação trimestral das equipes (APPT).","<b>Incorporar</b> as invisibilidades verificadas ao sistema oficial, com marca de origem.","<b>Advocacy</b> pelos Níveis 2 e 3 com INS, cartografia social e histórico de respostas.","<b>Registrar</b> toda resposta e toda ausência de resposta."],
   alerta:"V6 abaixo de 80%; encaminhamentos sem retorno por duas reuniões; lista de verificação parada.",
   erros:["Descartar problema de alto impacto e baixa capacidade de agência: ele segue para advocacy.","Deixar a ação planejada fora da programação das equipes.","Apagar as respostas que não vieram.","Incorporar sem verificação conjunta."],
   pvi:["V5","V6","V7","V8"],
   ck:["Cada encaminhamento triado em um registro","Alertas críticos com resposta ou escalonados","Prioridades na programação das equipes (APPT)","Invisibilidades verificadas incorporadas","Falta de resposta registrada"]},
  {id:"F5", n:"Reflexividade", rit:"Trimestral · anual", c:"var(--f5)",
   q:"O que as duas vigilâncias registraram em comum, o que apenas uma registrou e o que nenhuma captou?",
   quem:"SCS e pesquisadores populares (autores do Relatório de Ciclo); supervisor de campo (coordena); técnico de dados; Coordenação do CTIS",
   quando:"Trimestral (Relatório de Ciclo); anual (Plano Popular, cartografia social, currículo, relatório técnico)", com:"Painel acumulado; atas; listas de divergências e invisibilidades; IRS",
   prod:"Relatório de Ciclo; categorias de alerta e agenda revistas; currículo atualizado",
   passos:["<b>Onde a articulação funcionou?</b> V3, V4, V6, V7, V8.","<b>Onde falhou?</b> Alertas sem verificação, críticos sem resposta, divergências não investigadas.","<b>O que nenhuma vigilância captou?</b> Eventos que chegaram ao serviço sem alerta prévio ou que o território conhecia e não registrou.","<b>O que muda?</b> Categorias, agenda, formação e fluxos com os serviços.","<b>Relatório de Ciclo</b> escrito pelos pesquisadores populares.","<b>Anual:</b> Plano Popular, cartografia social e currículo revistos; relatório técnico após devolução."],
   alerta:"Relatório de Ciclo escrito pela equipe técnica; trimestre sem revisão de categorias ou de fluxos.",
   erros:["Avaliar volume de atividade em vez de articulação.","Ler incorporações aos registros oficiais como mudança do território (é revisão de medida).","Mudar indicador do INS sem nova versão."],
   pvi:["V3","V4","V5","V6","V7","V8","V9"],
   ck:["PVI do trimestre examinado","Três perguntas da articulação respondidas","Categorias de alerta e agenda revistas","IRS apurado em oficina","Relatório de Ciclo escrito pelos pesquisadores populares","Devolução à SCS antes do relatório técnico"]}
];

/* ---------- navegação ---------- */
const NAV = [
  {g:"Compreender", items:[
    ["inicio","Início","A proposta em uma página"],
    ["fundamentos","Fundamentos","Tradições, definição, duas vigilâncias, transversalidade e os quatro eixos"],
    ["metodo","Método","Compromissos, regras de ouro e os dois instrumentos de leitura"]]},
  {g:"Operar o ciclo", items:[
    ["ciclo","Ciclo","As cinco fases com pergunta-guia, passos, sinais de alerta e checklist"],
    ["leitor","Leitor de sinais","Matriz de leitura sobre o mapa da cartografia social e quem age primeiro"],
    ["alerta","Alerta 72 h","Relógio de cada alerta crítico, escalonamento e V6"],
    ["triagem","Triagem","Quatro perguntas que definem o registro de ação e o prazo"],
    ["visib","Visibilização","Da invisibilidade ao registro oficial, com V5"],
    ["reuniao","Reunião SCS","Sete blocos, Matriz UIC, encaminhamentos e ata"],
    ["painel","Painel PVI","Metas, leitura e gatilhos dos nove indicadores"],
    ["agenda","Agenda","Os seis ritmos distribuídos no calendário"]]},
  {g:"Organizar", items:[
    ["papeis","Papéis","Atribuições de cada ator, fase a fase"],
    ["gov","Governança","Simulador de escalonamento em três níveis"],
    ["impl","Implantação","Seis etapas, prontidão e parâmetros a pactuar"],
    ["riscos","Riscos","Ameaças, sinais de alerta e modo contingência"]]},
  {g:"Consultar", items:[
    ["documentos","Documentos","Os três documentos de referência, em PDF e Word"]]}
];
const VIEWS = [];
NAV.forEach(g => g.items.forEach(it => VIEWS.push({id:it[0], n:it[1], d:it[2], g:g.g})));
const EXTRA_VIEWS = ["dados"];
const numOf = id => { const i = VIEWS.findIndex(v => v.id === id); return i <= 0 ? "" : pad(i); };
let curView = "inicio";
function buildNav(){
  $("#navList").innerHTML = NAV.map(g => '<div class="nav-g">' + g.g + "</div>" + g.items.map(it => '<a class="nav-a" href="#' + it[0] + '" data-go="' + it[0] + '"><span class="k">' + (numOf(it[0]) || "··") + "</span><span>" + it[1] + "</span></a>").join("")).join("");
  document.querySelectorAll(".view .kicker[data-k]").forEach(k => {
    const id = k.closest(".view").id.slice(2), v = VIEWS.find(x => x.id === id);
    if(v) k.innerHTML = '<span class="n">' + numOf(id) + "</span>" + v.g;
  });
  $("#homeMods").innerHTML = NAV.map(g => '<div class="modgroup"><h3>' + g.g + '</h3><div class="modgrid">' + g.items.filter(it => it[0] !== "inicio").map(it => '<a class="modcard" href="#' + it[0] + '" data-go="' + it[0] + '"><span class="k">' + numOf(it[0]) + "</span><b>" + it[1] + "</b><span>" + it[2] + "</span></a>").join("") + "</div></div>").join("");
}
function setNav(open){
  document.body.classList.toggle("nav-open", open);
  $("#menuBtn").setAttribute("aria-expanded", open); $("#menuBtn").setAttribute("aria-label", open ? "Fechar o menu" : "Abrir o menu");
  $("#scrim").hidden = !open;
}
function show(v, opts){
  opts = opts || {};
  if(!VIEWS.some(x => x.id === v) && !EXTRA_VIEWS.includes(v)) v = "inicio";
  const changed = v !== curView;
  curView = v; S.set("view", v);
  document.querySelectorAll(".view").forEach(s => { s.hidden = s.id !== "v-" + v; });
  document.querySelectorAll(".nav-a").forEach(a => { if(a.dataset.go === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  const vv = VIEWS.find(x => x.id === v);
  document.title = (vv && v !== "inicio" ? vv.n + " · " : "") + "Protocolo de Inteligência Territorial · PICAPS";
  if(location.hash.slice(1) !== v) history.replaceState(null, "", "#" + v);
  setNav(false);
  if(changed && !opts.keepScroll) window.scrollTo({top:0, behavior:"auto"});
  if(v === "reuniao") renderMeeting();
  if(v === "alerta") renderAlerts();
}
function initNav(){
  buildNav();
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-go]");
    if(a){ e.preventDefault(); show(a.dataset.go); if(a.closest(".sidebar") === null) $("#main").focus({preventScroll:true}); }
  });
  window.addEventListener("hashchange", () => show(location.hash.slice(1)));
  $("#menuBtn").addEventListener("click", () => setNav(!document.body.classList.contains("nav-open")));
  $("#scrim").addEventListener("click", () => setNav(false));
  document.addEventListener("keydown", e => { if(e.key === "Escape"){ if(!$("#lightbox").hidden) closeLb(); else setNav(false); } });
}

/* ---------- figuras e ampliação ---------- */
const figSrc = n => "assets/img/figs/" + n + ".png";
function figInner(n, cap){
  return '<figcaption><span class="lb">Figura · </span>' + cap + '</figcaption><button class="zoom" type="button" data-fig="' + n + '" data-cap="' + esc(cap) + '" aria-label="Ampliar a figura: ' + esc(cap) + '"><img src="' + figSrc(n) + '" alt="' + esc(cap) + '" loading="lazy"></button><span class="zh">Clique ou toque na figura para ampliá-la.</span>';
}
const fig = (n, cap) => '<figure class="fig">' + figInner(n, cap) + "</figure>";
let lbReturn = null;
function openLb(n, cap){
  lbReturn = document.activeElement;
  $("#lbImg").src = figSrc(n); $("#lbImg").alt = cap; $("#lbCap").textContent = cap;
  $("#lightbox").hidden = false; document.body.style.overflow = "hidden"; $("#lbClose").focus();
}
function closeLb(){ $("#lightbox").hidden = true; document.body.style.overflow = ""; if(lbReturn) lbReturn.focus(); }
function initFigs(){
  document.querySelectorAll("figure.fig[data-zoom]").forEach(f => { f.innerHTML = figInner(f.dataset.zoom, f.dataset.cap); });
  document.addEventListener("click", e => { const b = e.target.closest("[data-fig]"); if(b){ e.preventDefault(); openLb(b.dataset.fig, b.dataset.cap || ""); } });
  $("#lbClose").addEventListener("click", closeLb);
  $("#lightbox").addEventListener("click", e => { if(e.target.id === "lightbox" || e.target.classList.contains("lb-img")) closeLb(); });
}
const tbl = (h, rows, cls) => '<table class="dt' + (cls ? " " + cls : "") + '"><thead><tr>' + h.map(x => "<th>" + x + "</th>").join("") + "</tr></thead><tbody>" + rows.map(r => r.band ? '<tr class="band"><td colspan="' + h.length + '">' + r.band + "</td></tr>" : "<tr>" + r.map(c => "<td>" + c + "</td>").join("") + "</tr>").join("") + "</tbody></table>";

/* ---------- 01 método ---------- */
let whichSel = 0; const whichAns = S.get("which", {});
function renderMetodo(){
  $("#commit").innerHTML = COMMIT.map(c => "<div><b>" + c[0] + "</b><span>" + c[1] + "</span></div>").join("");
  $("#think").innerHTML = THINK.map((t, i) => (i ? "<i>→</i>" : "") + "<span>" + t + "</span>").join("");
  $("#products").innerHTML = PRODUCTS.map((p, i) => "<div><b>" + (i + 1) + ". " + p[0] + "</b><span>" + p[1] + "</span></div>").join("");
  $("#rules").innerHTML = RULES.map((r, i) => '<div class="rule"><span class="n">' + pad(i + 1) + "</span><b>" + r[0] + "</b><span>" + r[1] + "</span></div>").join("");
  $("#instr").innerHTML = INSTR.map(i => '<div class="sheet inst i-' + i.k + '"><div class="ih"><h3>' + i.n + "</h3><span>" + i.sub + '</span></div><div class="ib"><p class="iq">' + i.q + "</p><dl><div><dt>Escala</dt><dd>" + i.esc + "</dd></div><div><dt>Mede</dt><dd>" + i.mede + "</dd></div><div><dt>Ritmo</dt><dd>" + i.rit + "</dd></div><div><dt>Serve para</dt><dd>" + i.use + '</dd></div><div class="no"><dt>Não serve para</dt><dd>' + i.nao + "</dd></div></dl></div></div>").join("");
  $("#seprules").innerHTML = SEPRULES.map(r => "<div><b>" + r[0] + "</b><span>" + r[1] + "</span></div>").join("");
  renderWhich();
}
function renderWhich(){
  $("#whichOpts").innerHTML = WHICH.map((w, i) => { const a = whichAns[i]; const mark = a == null ? "" : (a === w.a ? "✓" : "✗"); return '<button class="opt" type="button" data-i="' + i + '" aria-pressed="' + (i === whichSel) + '"><span>' + esc(w.s) + '</span><span class="mono" style="color:' + (mark === "✓" ? "var(--ok)" : "var(--crit)") + '">' + mark + "</span></button>"; }).join("");
  const w = WHICH[whichSel], a = whichAns[whichSel];
  let h = '<p class="blkq">' + esc(w.s) + '</p><div class="row">' + ["INS","PVI","nenhum"].map(o => '<button type="button" class="btn' + (a === o ? " primary" : "") + '" data-ans="' + o + '">' + (o === "nenhum" ? "Nenhum" : o) + "</button>").join("") + "</div>";
  if(a != null){ const ok = a === w.a; h += '<div class="status-box" style="--c:' + (ok ? "var(--ok)" : "var(--crit)") + '"><b>' + (ok ? "Correto." : "Incorreto: a resposta é " + (w.a === "nenhum" ? "nenhum" : w.a) + ".") + "</b><span>" + esc(w.w) + "</span></div>"; }
  $("#whichOut").innerHTML = h;
  const n = Object.keys(whichAns).length, c = Object.keys(whichAns).filter(k => whichAns[k] === WHICH[k].a).length;
  $("#whichScore").textContent = n ? c + (c === 1 ? " acerto em " : " acertos em ") + n : "";
}

/* ---------- 02 ciclo ---------- */
let phaseSel = S.get("phase", 0); const phaseCk = S.get("phaseCk", {});
function polar(cx, cy, r, deg){ const a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
function drawCycle(){
  const cx = 210, cy = 210, R = 140, nr = 44;
  const ang = i => -90 + i * 72;
  let s = '<defs><marker id="cy-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--grey-2)"/></marker><marker id="cy-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--crit)"/></marker></defs>';
  s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R - 64) + '" fill="var(--tg)" stroke="var(--green)" stroke-width="1.5" stroke-dasharray="4 4"/>';
  s += '<text x="' + cx + '" y="' + (cy - 6) + '" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="700" font-size="19" fill="var(--navy)">Sala de</text><text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="700" font-size="19" fill="var(--navy)">Cooperação</text><text x="' + cx + '" y="' + (cy + 34) + '" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="700" font-size="19" fill="var(--navy)">Social</text>';
  for(let i = 0; i < 5; i++){
    const a1 = ang(i) + 20, a2 = ang(i + 1) - 20, p1 = polar(cx, cy, R, a1), p2 = polar(cx, cy, R, a2);
    s += '<path d="M' + p1[0].toFixed(1) + " " + p1[1].toFixed(1) + " A" + R + " " + R + " 0 0 1 " + p2[0].toFixed(1) + " " + p2[1].toFixed(1) + '" fill="none" stroke="var(--grey-2)" stroke-width="2" marker-end="url(#cy-ar)"/>';
  }
  const f1 = polar(cx, cy, R - nr, ang(0) + 18), f4 = polar(cx, cy, R - nr, ang(3) - 18);
  s += '<path d="M' + f1[0].toFixed(1) + " " + f1[1].toFixed(1) + " Q" + (cx - 120) + " " + (cy - 10) + " " + f4[0].toFixed(1) + " " + f4[1].toFixed(1) + '" fill="none" stroke="var(--crit)" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#cy-ar2)" opacity=".85"/>';
  PHASES.forEach((p, i) => {
    const [x, y] = polar(cx, cy, R, ang(i)), sel = i === phaseSel;
    s += '<g class="node" tabindex="0" role="button" aria-label="' + p.id + " " + p.n + '" data-i="' + i + '"><circle class="ring" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + nr + '" fill="' + (sel ? p.c : "var(--sheet)") + '" stroke="' + p.c + '" stroke-width="2.5"/><text x="' + x.toFixed(1) + '" y="' + (y + 2).toFixed(1) + '" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="700" font-size="24" fill="' + (sel ? "var(--sheet)" : p.c) + '">' + p.id + '</text><text x="' + x.toFixed(1) + '" y="' + (y + 19).toFixed(1) + '" text-anchor="middle" font-family="Barlow, sans-serif" font-size="10.5" font-weight="600" fill="' + (sel ? "var(--sheet)" : "var(--ink-2)") + '">' + esc(p.n.split(" ")[0]) + "</text></g>";
  });
  $("#cycle").innerHTML = s;
}
function renderPhase(){
  const p = PHASES[phaseSel], ck = phaseCk[p.id] || [], done = ck.filter(Boolean).length;
  const panel = $("#phasePanel"); panel.style.setProperty("--pc", p.c);
  panel.innerHTML = '<div class="phase-title"><span class="code">' + p.id + "</span><h2>" + p.n + '</h2><span class="chip" style="--c:' + p.c + '">' + p.rit + "</span></div>" +
    '<div class="qbox"><span class="eyebrow">Pergunta-guia</span>' + p.q + "</div>" +
    '<dl class="meta"><div><dt>Quem</dt><dd style="margin:0">' + p.quem + "</dd></div><div><dt>Quando</dt><dd style=\"margin:0\">" + p.quando + "</dd></div><div><dt>Instrumentos</dt><dd style=\"margin:0\">" + p.com + "</dd></div><div><dt>Produto</dt><dd style=\"margin:0\">" + p.prod + "</dd></div></dl>" +
    "<div><h3 style=\"margin-bottom:10px\">Passos</h3><ol class=\"steps\">" + p.passos.map(x => "<li><span>" + x + "</span></li>").join("") + "</ol></div>" +
    '<div class="status-box" style="--c:var(--warn)"><b>Sinal de alerta</b><span class="small">' + p.alerta + "</span></div>" +
    '<div><h3 style="margin-bottom:6px">Erros de raciocínio a evitar</h3><ul class="errs">' + p.erros.map(x => "<li>" + x + "</li>").join("") + "</ul></div>" +
    '<div class="row"><span class="note">Indicadores do Painel relacionados a esta fase:</span>' + p.pvi.map(v => '<span class="chip p1">' + v + "</span>").join("") + "</div>" +
    '<div class="stack" style="gap:8px"><div class="row" style="justify-content:space-between"><h3>Checklist do ciclo atual</h3><span class="mono small">' + done + "/" + p.ck.length + '</span></div><div class="progress"><i style="width:' + (100 * done / p.ck.length) + '%;background:' + p.c + '"></i></div><div class="checks">' + p.ck.map((x, i) => '<label><input type="checkbox" data-ck="' + i + '"' + (ck[i] ? " checked" : "") + '><span class="' + (ck[i] ? "done" : "") + '">' + x + "</span></label>").join("") + '</div><div><button class="btn ghost" type="button" id="ckReset">Novo ciclo: limpar checklist</button></div></div>';
}
function initCiclo(){
  drawCycle(); renderPhase();
  const pick = el => { const g = el.closest(".node"); if(!g) return; phaseSel = +g.dataset.i; S.set("phase", phaseSel); drawCycle(); renderPhase(); };
  $("#cycle").addEventListener("click", e => pick(e.target));
  $("#cycle").addEventListener("keydown", e => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); pick(e.target); } });
  $("#phasePanel").addEventListener("change", e => {
    const i = e.target.dataset.ck; if(i == null) return; const id = PHASES[phaseSel].id;
    phaseCk[id] = phaseCk[id] || []; phaseCk[id][i] = e.target.checked; S.set("phaseCk", phaseCk); renderPhase();
  });
  $("#phasePanel").addEventListener("click", e => { if(e.target.id === "ckReset"){ phaseCk[PHASES[phaseSel].id] = []; S.set("phaseCk", phaseCk); renderPhase(); } });
}

/* ---------- 03 leitor de sinais ---------- */
const ls = S.get("ls", {});
let pauta = S.get("pauta", []);
const LSQ = [
  {k:"pop", l:"Há alerta popular?", h:"Ágora ou cartografia social, no período e na microárea", o:[["s","sim"],["n","não"]]},
  {k:"of", l:"Há registro oficial?", h:"SINAN, e-SUS APS, Defesa Civil, LIRAa", o:[["s","sim"],["n","não"]]},
  {k:"urg", l:"O alerta tem urgência máxima?", h:"Risco à vida ou à saúde nas próximas horas", o:[["s","sim"],["n","não"]], when:s => s.pop === "s"},
  {k:"ant", l:"O alerta veio antes do registro oficial?", h:"Até 30 dias antes, mesma microárea, categoria compatível", o:[["s","sim"],["n","não"],["?","não sei"]], when:s => s.pop === "s" && s.of === "s"},
  {k:"ver", l:"Houve verificação conjunta?", h:"Serviço e pesquisador popular, em campo", o:[["n","ainda não"],["c","confirmou"],["d","descartou"]], when:s => s.pop === "s" && s.of === "n"},
  {k:"tipo", wide:true, l:"O que foi visto?", h:"Define quem verifica e em que registro passa a constar", o:[["agravo","agravo"],["risco","área de risco"],["vetor","criadouro"],["dom","sem cadastro"],["cad","fora do CadÚnico"]], when:s => s.pop === "s" && s.of === "n"},
  {k:"area", l:"Está em área de risco ou prioritária mapeada?", h:"Cartografia social e Plano Popular", o:[["s","sim"],["n","não"]]},
  {k:"rk", wide:true, l:"O risco é sobretudo de quê?", h:"Lugar: encosta, alagamento, saneamento, criadouros. Pessoas: crianças pequenas, idosos, famílias sem renda ou fora dos cadastros", o:[["ambos","lugar e pessoas"],["lugar","do lugar"],["pessoas","das pessoas"],["nenhum","nenhum mapeado"]]}
];
const TIPOV = {agravo:["avaliação clínica ou epidemiológica","SINAN"], risco:["vistoria da Defesa Civil com a SCS","camada de áreas de risco, como revisão de medida"], vetor:["inspeção do ACE","roteiro de pontos estratégicos dos ACE"], dom:["visita do ACS com o pesquisador popular","cadastro do e-SUS APS, com marca de origem"], cad:["encaminhamento ao CRAS","Cadastro Único, com marca de origem"]};
function quemAge(s){
  if(s.rk === "ambos") return "APS, vigilância e Defesa Civil, em conjunto: o dano é mais provável no lugar e nas pessoas.";
  if(s.rk === "lugar") return "Defesa Civil, vigilância ambiental e saneamento: o risco é sobretudo do lugar.";
  if(s.rk === "pessoas") return "Equipe de APS e CRAS: o risco é sobretudo das pessoas (busca ativa de crianças de 0 a 4 anos e idosos de 75 ou mais).";
  return "Acompanhamento de rotina; verificar se há invisibilidade ainda não registrada no mapa.";
}
function readSignals(s){
  const need = LSQ.filter(q => !q.when || q.when(s)).filter(q => s[q.k] == null);
  if(need.length) return null;
  const hi = s.area === "s", ma = s.ma || "esta microárea", ag = s.ag || "este agravo";
  const o = {why:[], fazer:[], pvi:[], quem:quemAge(s)};
  o.why.push("Popular: " + (s.pop === "s" ? "sim" : "não") + " · oficial: " + (s.of === "s" ? "sim" : "não") + ".");
  if(s.pop === "s" && s.urg === "s") o.fazer.push("<b>Prioridade:</b> trata-se de alerta crítico. Abra imediatamente o relógio de 72 horas; a leitura abaixo segue para a reunião.");
  if(s.pop === "s" && s.of === "s"){
    if(s.ant === "s"){ o.cls = "Antecipação"; o.cell = "ps-os"; o.tone = "var(--ok)"; o.why.push("O alerta precedeu o registro oficial: o território identificou o evento primeiro."); o.fazer.push("Registrar a antecipação e conferir se a categoria era compatível.","Agir pelo registro de ação cabível e devolver o resultado à SCS."); o.pvi = ["V3","V4"]; o.reg = "conforme a triagem"; o.perg = "Em " + ma + ", o território alertou sobre " + ag + " antes da notificação. O fluxo entre a SCS e o serviço aproveitou essa antecipação?"; }
    else { o.cls = "Convergência"; o.cell = "ps-os"; o.tone = "var(--ok)"; o.why.push(s.ant === "?" ? "As duas vigilâncias registraram, mas a ordem temporal não está clara: confira no ambiente seguro antes de contar em V4." : "As duas vigilâncias registraram, mas o registro oficial veio primeiro."); o.fazer.push("Confirmar que a resposta está em curso.","Informar à SCS o que o serviço fez."); o.pvi = ["V3"]; o.reg = "conforme a triagem"; o.perg = "Em " + ma + ", alerta e registro oficial coincidem sobre " + ag + ". A resposta foi suficiente?"; }
  } else if(s.pop === "s"){
    o.cell = "ps-on"; const tv = TIPOV[s.tipo];
    if(s.ver === "n"){ o.cls = "Antecipação ou invisibilidade a verificar"; o.tone = "var(--navy)"; o.why.push("Apenas o território registrou. Não é erro nem fato: é hipótese a verificar."); o.fazer.push("Incluir na lista de verificação: " + tv[0] + ".", s.tipo === "agravo" ? "Se a avaliação indicar agravo de notificação compulsória, notificar no SINAN." : "Se confirmado, incorporar: " + tv[1] + "."); o.pvi = ["V3","V5"]; o.reg = "Incorporação, após verificação (até a reunião seguinte)"; o.perg = "Em " + ma + ", o território registra " + ag + " e o sistema não. Quem verifica com o pesquisador popular, e até quando?"; }
    else if(s.ver === "c"){ o.cls = "Invisibilidade confirmada"; o.tone = "var(--navy)"; o.why.push("A verificação conjunta confirmou o que o sistema não registrava."); o.fazer.push("Incorporar: " + tv[1] + ".","Devolver à SCS na reunião seguinte; contar em V5."); if(s.tipo === "risco" || s.tipo === "dom" || s.tipo === "cad") o.fazer.push("Registrar como revisão de medida: a correção não é piora do território."); o.pvi = ["V3","V5"]; o.reg = "Incorporação (até a reunião seguinte)"; o.perg = "Em " + ma + ", " + ag + " foi confirmado e passa ao registro oficial. Que outras ações essa constatação exige?"; }
    else { o.cls = "Alerta não confirmado"; o.tone = "var(--warn)"; o.why.push("A verificação descartou o alerta. Ele conta em V3 como descartado, o que não significa falha do pesquisador popular."); o.fazer.push("Devolver à SCS o motivo do descarte.","Se o padrão se repetir, rever a categoria de alerta ou a formação (F5)."); o.pvi = ["V3"]; o.reg = "Informação na ata"; o.perg = "Em " + ma + ", o alerta sobre " + ag + " não se confirmou. A categoria está clara para quem registra?"; }
  } else if(s.of === "s"){
    o.cls = "Ponto cego popular"; o.cell = "pn-os"; o.tone = "var(--warn)"; o.why.push("O registro oficial identificou o evento; o território não alertou."); o.fazer.push("Perguntar se a categoria existe e se é conhecida.","Verificar se há pesquisador popular ativo na microárea (V9).","Levar à reflexividade (F5)."); o.pvi = ["V9"]; o.reg = "Pauta da F5"; o.perg = "Em " + ma + ", o serviço registrou " + ag + " sem alerta prévio. Por que o território não percebeu ou não registrou?";
  } else {
    o.cls = hi ? "Silêncio suspeito" : "Silêncio"; o.cell = "pn-on"; o.tone = hi ? "var(--crit)" : "var(--ink-3)"; o.why.push("Nenhuma das vigilâncias registrou."); o.fazer.push(hi ? "Em área de risco ou prioritária, o silêncio é uma pergunta: conferir V9 e a cobertura de ACS na microárea." : "Seguir a rotina, sem concluir que não há problema."); o.pvi = ["V9"]; o.reg = hi ? "Pauta da reunião" : "Nenhum"; o.perg = hi ? "Em " + ma + ", em área de risco ou prioritária mapeada, não há sinal de " + ag + ". É ausência de problema ou de observação?" : "";
  }
  o.why.push(hi ? "Área de risco ou prioritária no mapa da cartografia social: prioridade de verificação e de pauta." : "Fora das áreas mapeadas como de risco ou prioritárias: segue o ritmo habitual, sem ser descartado.");
  o.why.push({ambos:"Risco do lugar e das pessoas", lugar:"Risco sobretudo do lugar", pessoas:"Risco sobretudo das pessoas", nenhum:"Nenhum risco mapeado"}[s.rk] + ": define quem age primeiro.");
  return o;
}
function renderLeitor(){
  $("#lsMa").value = ls.ma || ""; $("#lsAg").value = ls.ag || "";
  $("#lsQs").innerHTML = LSQ.map(q => '<div class="qrow' + (q.wide ? " wide" : "") + '"' + (q.when && !q.when(ls) ? " hidden" : "") + '><span class="ql">' + q.l + '<span class="qh">' + q.h + "</span></span>" + segBtns(q.k, q.o, ls[q.k]) + "</div>").join("") + '<div class="row" style="margin-top:10px"><button class="btn ghost" type="button" id="lsReset">Nova leitura</button></div>';
  renderLsOut();
}
function renderLsOut(){
  const o = readSignals(ls);
  const cells = [["ps-on","Antecipação ou invisibilidade","popular sim · oficial não"],["ps-os","Convergência","popular sim · oficial sim"],["pn-on","Silêncio","popular não · oficial não"],["pn-os","Ponto cego popular","popular não · oficial sim"]];
  const cell = c => '<div class="c' + (o && o.cell === c[0] ? " on" : "") + '"><b>' + c[1] + '</b><span class="note">' + c[2] + "</span></div>";
  $("#lsMx").innerHTML = '<div></div><div class="h">Oficial: não</div><div class="h">Oficial: sim</div><div class="h">Popular: sim</div>' + cell(cells[0]) + cell(cells[1]) + '<div class="h">Popular: não</div>' + cell(cells[2]) + cell(cells[3]);
  if(!o){ $("#lsOut").innerHTML = '<p class="muted">Responda às perguntas para compor a leitura. Cada resposta é um passo do raciocínio; nenhuma conclusão é apresentada antes da última.</p>'; return; }
  $("#lsOut").innerHTML = '<div class="result-card" style="--c:' + o.tone + '"><span class="eyebrow">Classificação</span><b style="font-family:var(--font-display);font-size:24px;color:var(--c)">' + o.cls + "</b></div>" +
    '<div><h3 style="margin-bottom:6px">Raciocínio</h3><ol class="reason">' + o.why.map(x => "<li>" + x + "</li>").join("") + "</ol></div>" +
    '<div><h3 style="margin-bottom:6px">O que fazer</h3><ul class="reason">' + o.fazer.map(x => "<li>" + x + "</li>").join("") + "</ul></div>" +
    '<dl class="kv"><dt>Quem age primeiro</dt><dd>' + o.quem + "</dd><dt>Registro de ação</dt><dd>" + o.reg + "</dd><dt>Indicador do Painel</dt><dd>" + o.pvi.map(v => '<span class="chip p1">' + v + "</span>").join(" ") + "</dd></dl>" +
    (o.perg ? '<div class="qbox"><span class="eyebrow">Pergunta para a SCS</span>' + esc(o.perg) + "</div>" : "") +
    '<div class="row"><button class="btn primary" type="button" id="lsAdd">Levar à reunião</button>' + (ls.urg === "s" && ls.pop === "s" ? '<button class="btn" type="button" id="lsTo72">Abrir relógio de 72 h</button>' : "") + "</div>";
}
function renderPauta(){
  $("#lsPauta").innerHTML = pauta.length ? pauta.map(p => '<div class="item"><div class="hd"><b>' + esc(p.cls) + '</b><span class="note">' + esc(p.ma) + " · " + esc(p.ag) + (p.area === "s" ? " · área mapeada" : "") + ' <button class="xbtn" data-del="' + p.id + '">remover</button></span></div><span class="small">' + esc(p.perg || "—") + "</span></div>").join("") : '<p class="note">Nenhum item. Use “Levar à reunião” no leitor.</p>';
}
function initLeitor(){
  renderLeitor(); renderPauta();
  $("#lsQs").addEventListener("click", e => {
    const b = e.target.closest("button[data-v]");
    if(b){ const k = b.parentElement.dataset.q; ls[k] = b.dataset.v; LSQ.forEach(q => { if(q.when && !q.when(ls)) delete ls[q.k]; }); S.set("ls", ls); renderLeitor(); return; }
    if(e.target.id === "lsReset"){ Object.keys(ls).forEach(k => delete ls[k]); S.set("ls", ls); renderLeitor(); }
  });
  ["lsMa","lsAg"].forEach(id => $("#" + id).addEventListener("input", e => { ls[id === "lsMa" ? "ma" : "ag"] = e.target.value; S.set("ls", ls); renderLsOut(); }));
  $("#lsOut").addEventListener("click", e => {
    if(e.target.id === "lsAdd"){ const o = readSignals(ls); if(!o) return; pauta.push({id:uid(), cls:o.cls, ma:ls.ma || "microárea", ag:ls.ag || "agravo", area:ls.area, perg:o.perg}); S.set("pauta", pauta); renderPauta(); flash(e.target, "Incluído na pauta ✓"); }
    if(e.target.id === "lsTo72"){ $("#alMa").value = ls.ma || ""; $("#alCat").value = ls.ag || ""; show("alerta"); }
  });
  $("#lsPauta").addEventListener("click", e => { const d = e.target.dataset.del; if(d){ pauta = pauta.filter(p => p.id !== d); S.set("pauta", pauta); renderPauta(); } });
  $("#lsClear").addEventListener("click", () => { pauta = []; S.set("pauta", pauta); renderPauta(); });
}

/* ---------- 04 alerta 72 h ---------- */
let alerts = S.get("alerts", []);
const AL_STEPS = [["Registro na Ágora (hora zero)","Formulário físico preenchido (hora zero)"],["Plataforma notificou a Dupla e o supervisor","Supervisor notificou diretamente a Dupla"],["Dupla comunicou a UBS e a vigilância (registro em ata)","Dupla comunicou a UBS e a vigilância (registro em ata)"],["Serviço registrou ação ou justificativa","Serviço registrou ação ou justificativa"]];
function hoursSince(t0, t1){ return ((t1 || Date.now()) - t0) / 36e5; }
function fmtH(h){ const hh = Math.floor(h), mm = Math.floor((h - hh) * 60); return hh + " h " + pad(mm) + " min"; }
function alStatus(a){
  const el = hoursSince(a.t0);
  if(a.s[3]){ const rh = hoursSince(a.t0, a.tResp); return {c: rh <= 72 ? "var(--ok)" : "var(--warn)", t: rh <= 72 ? "Respondido em " + fmtH(rh) : "Respondido fora do prazo, em " + fmtH(rh), next: "Apresentar a resposta na reunião seguinte (bloco 2). Entra no cálculo de V6.", pct: Math.min(rh / 72, 1.4)}; }
  if(el > 72) return {c:"var(--crit)", t:"Prazo vencido há " + fmtH(el - 72), next: a.esc ? "Escalonado ao Nível 2. Registre a falta de resposta: é insumo do advocacy." : "<b>Escalonar imediatamente:</b> o Nível 2 (CTIS) notifica a coordenação regional de saúde, com o registro do alerta e da comunicação formal.", pct:1.4};
  let next;
  if(!a.s[1]) next = a.cont ? "O supervisor deve notificar a Dupla diretamente, de imediato." : "Confirmar que a Plataforma notificou a Dupla e o supervisor.";
  else if(!a.s[2]) next = "A Dupla comunica formalmente o alerta ao interlocutor da UBS e da vigilância e registra a comunicação em ata.";
  else next = "Aguardar o registro do serviço. Faltam " + fmtH(72 - el) + ".";
  return {c: el > 48 ? "var(--warn)" : "var(--navy)", t: fmtH(el) + " desde a hora zero", next, pct: el / 72};
}
function renderAlerts(){
  const list = $("#alList"); if(!list) return;
  list.innerHTML = alerts.length ? alerts.slice().sort((a, b) => b.t0 - a.t0).map(a => {
    const st = alStatus(a), steps = AL_STEPS.map((x, i) => '<label class="st' + (a.s[i] ? " done" : "") + '"><input type="checkbox" data-a="' + a.id + '" data-s="' + i + '"' + (a.s[i] ? " checked" : "") + (i === 0 ? " disabled" : "") + "><span>" + x[a.cont ? 1 : 0] + "</span></label>").join("");
    return '<div class="sheet item"><div class="hd"><b>' + esc(a.ma || "Microárea") + " · " + esc(a.cat || "alerta crítico") + (a.cont ? ' <span class="example-flag">contingência</span>' : "") + '</b><span class="note">hora zero ' + fmtDH(a.t0) + ' · <button class="xbtn" type="button" data-del="' + a.id + '">excluir</button></span></div>' +
      '<div class="bar72" style="--c:' + st.c + '"><i style="width:' + Math.min(st.pct / 1.4 * 100, 100) + '%"></i><b style="left:' + (100 / 1.4) + '%"></b></div><div style="position:relative;height:16px"><span class="note" style="position:absolute;left:0">0 h</span><span class="note" style="position:absolute;left:71.4%;transform:translateX(-50%)">72 h</span></div>' +
      '<div class="steps4">' + steps + "</div>" +
      (a.s[3] ? '<label class="f">Hora do registro da resposta<input type="datetime-local" data-tr="' + a.id + '" value="' + localDT(a.tResp) + '"></label>' : "") +
      '<div class="status-box" style="--c:' + st.c + '"><b>' + st.t + '</b><span class="small">' + st.next + "</span></div>" +
      (!a.s[3] && hoursSince(a.t0) > 72 ? '<div class="checks"><label><input type="checkbox" data-esc="' + a.id + '"' + (a.esc ? " checked" : "") + "> Escalonamento ao Nível 2 realizado</label></div>" : "") + "</div>";
  }).join("") : '<p class="note">Nenhum alerta crítico registrado.</p>';
  const closed = alerts.filter(a => a.s[3] || hoursSince(a.t0) > 72), ok = closed.filter(a => a.s[3] && hoursSince(a.t0, a.tResp) <= 72);
  const rts = alerts.filter(a => a.s[3]).map(a => hoursSince(a.t0, a.tResp)).sort((x, y) => x - y);
  const med = rts.length ? (rts.length % 2 ? rts[(rts.length - 1) / 2] : (rts[rts.length / 2 - 1] + rts[rts.length / 2]) / 2) : null;
  const pct = closed.length ? Math.round(100 * ok.length / closed.length) : null;
  const cls = pct == null ? "" : pct >= 95 ? "s-ok" : pct >= 80 ? "s-warn" : "s-crit";
  $("#alSum").innerHTML = '<div class="kpi"><span class="eyebrow">V6 · no prazo</span><span class="v">' + (pct == null ? "—" : pct + "%") + "</span>" + (pct == null ? "" : '<span class="chip dot ' + cls + '">' + (pct >= 95 ? "recomendada" : pct >= 80 ? "mínima" : "abaixo da mínima") + "</span>") + '</div><div class="kpi"><span class="eyebrow">Tempo mediano</span><span class="v">' + (med == null ? "—" : Math.round(med) + " h") + '</span></div><div class="kpi"><span class="eyebrow">Em aberto</span><span class="v">' + alerts.filter(a => !a.s[3] && hoursSince(a.t0) <= 72).length + "</span></div>";
}
function initAlerts(){
  $("#alT0").value = localDT(Date.now());
  $("#alAdd").addEventListener("click", () => {
    const t = Date.parse($("#alT0").value); const t0 = isNaN(t) ? Date.now() : t;
    alerts.push({id:uid(), ma:$("#alMa").value.trim(), cat:$("#alCat").value.trim(), t0, cont:$("#alCont").checked, s:[true, false, false, false], tResp:null, esc:false});
    S.set("alerts", alerts); $("#alMa").value = ""; $("#alCat").value = ""; $("#alT0").value = localDT(Date.now()); renderAlerts();
  });
  $("#alDemo").addEventListener("click", () => {
    const n = Date.now();
    alerts.push({id:uid(), ma:"MA 04 (exemplo)", cat:"deslizamento", t0:n - 20 * 36e5, cont:false, s:[true, true, true, false], tResp:null, esc:false});
    alerts.push({id:uid(), ma:"MA 09 (exemplo)", cat:"esgoto a céu aberto", t0:n - 80 * 36e5, cont:false, s:[true, true, true, false], tResp:null, esc:false});
    alerts.push({id:uid(), ma:"MA 02 (exemplo)", cat:"surto de diarreia", t0:n - 100 * 36e5, cont:true, s:[true, true, true, true], tResp:n - 70 * 36e5, esc:false});
    S.set("alerts", alerts); renderAlerts();
  });
  $("#alList").addEventListener("change", e => {
    const t = e.target;
    if(t.dataset.s != null){ const a = alerts.find(x => x.id === t.dataset.a); a.s[+t.dataset.s] = t.checked; if(+t.dataset.s === 3) a.tResp = t.checked ? Date.now() : null; }
    if(t.dataset.esc){ const a = alerts.find(x => x.id === t.dataset.esc); a.esc = t.checked; }
    if(t.dataset.tr){ const a = alerts.find(x => x.id === t.dataset.tr); const v = Date.parse(t.value); if(!isNaN(v)) a.tResp = v; }
    S.set("alerts", alerts); renderAlerts();
  });
  $("#alList").addEventListener("click", e => { const d = e.target.dataset.del; if(d){ alerts = alerts.filter(a => a.id !== d); S.set("alerts", alerts); renderAlerts(); } });
  renderAlerts(); setInterval(() => { if(curView === "alerta") renderAlerts(); }, 60000);
}

/* ---------- 05 triagem ---------- */
const REG = {
  imediata:{n:"Resposta imediata", prazo:"48 a 72 horas", dias:3, aciona:"UBS de referência e vigilância em saúde, diretamente", pvi:"V6", c:"var(--crit)", nota:"Aciona o relógio de 72 horas a partir da hora zero."},
  incorp:{n:"Incorporação", prazo:"Até a reunião seguinte", dias:30, aciona:"Serviço responsável pelo registro oficial (módulo Visibilização)", pvi:"V5", c:"var(--green)", nota:"Somente após verificação conjunta. Se corrigir um registro oficial, constitui revisão de medida."},
  plan:{n:"Ação planejada", prazo:"30 a 90 dias", dias:90, aciona:"Responsáveis da ata; programação trimestral das equipes (APPT)", pvi:"V7 e V8", c:"var(--navy)", nota:"Se não entrar na programação das equipes, a ação não se sustenta."},
  adv:{n:"Advocacy", prazo:"90 a 180 dias", dias:180, aciona:"Gestão pública, pelos Níveis 2 e 3, com INS, cartografia social e histórico de respostas", pvi:"V7", c:"var(--warn)", nota:"Problema de alto impacto e baixa capacidade de agência local não é descartado: segue para advocacy."}
};
const TRQ = [
  {q:"Há risco à vida ou à saúde nas próximas horas?", r:"imediata"},
  {q:"Trata-se de algo identificado pelo território, ausente do registro oficial e confirmado em verificação conjunta?", r:"incorp", h:"Se ainda não houve verificação, o item segue antes para a lista de verificação (F2)."},
  {q:"Os serviços locais conseguem agir com os recursos de que dispõem?", r:"plan"},
  {q:"Exige decisão, recurso ou política fora do alcance local?", r:"adv"}
];
let tr = [];
function trResult(){ for(let i = 0; i < TRQ.length; i++){ if(tr[i] == null) return null; if(tr[i] === "s") return TRQ[i].r; } return "none"; }
function renderTriagem(){
  let h = "", stop = false;
  TRQ.forEach((q, i) => { if(stop) return; h += '<div class="qrow"><span class="ql">' + (i + 1) + ". " + q.q + (q.h ? '<span class="qh">' + q.h + "</span>" : "") + "</span>" + segBtns("t" + i, [["s","sim"],["n","não"]], tr[i]) + "</div>"; if(tr[i] !== "n") stop = true; });
  $("#trQs").innerHTML = h + '<div class="row" style="margin-top:10px"><button class="btn ghost" type="button" id="trReset">Nova triagem</button></div>';
  const r = trResult();
  if(!r){ $("#trOut").innerHTML = '<p class="muted">Responda na ordem: a primeira resposta “sim” define o registro.</p><div class="list">' + Object.values(REG).map(x => '<div class="result-card" style="--c:' + x.c + '"><b>' + x.n + '</b><span class="small">' + x.prazo + " · " + x.aciona + "</span></div>").join("") + "</div>"; return; }
  if(r === "none"){ $("#trOut").innerHTML = '<div class="status-box" style="--c:var(--ink-3)"><b>Não é encaminhamento</b><span class="small">Registre como informação na ata ou reformule, com a SCS, o que se espera e de quem.</span></div>'; return; }
  const x = REG[r], base = S.get("mt", {}).date ? parseISO(S.get("mt", {}).date) : today;
  $("#trOut").innerHTML = '<div class="result-card" style="--c:' + x.c + '"><span class="eyebrow">Registro de ação</span><b style="font-family:var(--font-display);font-size:26px;color:var(--c)">' + x.n + '</b></div><dl class="kv"><dt>Prazo</dt><dd>' + x.prazo + " (até " + fmtD(addDays(base, x.dias)) + ')</dd><dt>Aciona</dt><dd>' + x.aciona + "</dd><dt>Indicador do Painel</dt><dd>" + x.pvi + '</dd></dl><p class="small muted">' + x.nota + '</p><label class="f">Responsável<input id="trResp"></label><div class="row"><button class="btn primary" type="button" id="trSend">Enviar aos encaminhamentos da reunião</button>' + (r === "imediata" ? '<button class="btn" type="button" id="trTo72">Abrir relógio de 72 h</button>' : "") + (r === "incorp" ? '<button class="btn" type="button" id="trToVi">Abrir Visibilização</button>' : "") + "</div>";
}
function initTriagem(){
  renderTriagem();
  $("#trQs").addEventListener("click", e => {
    const b = e.target.closest("button[data-v]");
    if(b){ const i = +b.parentElement.dataset.q.slice(1); tr[i] = b.dataset.v; tr = tr.slice(0, i + 1); renderTriagem(); }
    if(e.target.id === "trReset"){ tr = []; $("#trTxt").value = ""; renderTriagem(); }
  });
  $("#trOut").addEventListener("click", e => {
    if(e.target.id === "trSend"){ const r = trResult(); const txt = $("#trTxt").value.trim(); if(!txt){ $("#trTxt").focus(); flash(e.target, "Descreva o encaminhamento"); return; } addEnc(txt, ($("#trResp").value || "").trim(), r); flash(e.target, "Enviado ✓"); }
    if(e.target.id === "trTo72"){ $("#alCat").value = $("#trTxt").value; show("alerta"); }
    if(e.target.id === "trToVi"){ $("#viDesc").value = $("#trTxt").value; show("visib"); }
  });
}

/* ---------- 06 visibilização ---------- */
const VTIPOS = [
  {k:"dom", n:"Domicílios ou famílias não cadastrados", ver:"Visita do ACS com o pesquisador popular", quem:"Equipe de APS", onde:"Cadastro do e-SUS APS", ivt:"Marca de origem: trata-se de correção da base, e não de mudança das condições do território."},
  {k:"risco", n:"Área de alagamento, enxurrada ou deslizamento fora do mapa oficial", ver:"Vistoria da Defesa Civil com a SCS", quem:"Defesa Civil", onde:"Camada de áreas de risco", ivt:"Corrige o mapa oficial de risco: revisão de medida, não piora do território."},
  {k:"vetor", n:"Criadouros, depósitos e pontos críticos de vetores", ver:"Inspeção do agente de combate às endemias", quem:"Vigilância ambiental", onde:"Roteiro de pontos estratégicos e de visitas", ivt:""},
  {k:"notif", n:"Evento compatível com agravo de notificação compulsória", ver:"Avaliação clínica ou epidemiológica", quem:"Equipe de APS ou de vigilância", onde:"SINAN", ivt:""},
  {k:"cad", n:"Famílias de baixa renda fora do Cadastro Único", ver:"Encaminhamento ao CRAS", quem:"Gestão do Cadastro Único", onde:"Cadastro Único", ivt:"Marca de origem: trata-se de correção da base, e não de mudança das condições do território."}
];
let vis = S.get("vis", []);
const qOf = ms => { const d = new Date(ms); return d.getFullYear() + "-T" + (Math.floor(d.getMonth() / 3) + 1); };
function renderVisHint(){ const t = VTIPOS.find(x => x.k === $("#viTipo").value); $("#viHint").innerHTML = '<dl class="kv"><dt>Verificação</dt><dd>' + t.ver + "</dd><dt>Quem incorpora</dt><dd>" + t.quem + "</dd><dt>Onde passa a constar</dt><dd>" + t.onde + "</dd>" + (t.ivt ? "<dt>Atenção</dt><dd>" + t.ivt + "</dd>" : "") + "</dl>"; }
function renderVis(){
  $("#viList").innerHTML = vis.length ? vis.slice().reverse().map(v => {
    const t = VTIPOS.find(x => x.k === v.tipo), labels = ["Identificado pelo território", "Verificação: " + t.ver, "Incorporado: " + t.onde, "Devolvido à SCS"];
    const nxt = !v.s[1] ? "Agendar a verificação conjunta com " + t.quem.toLowerCase() + "." : !v.s[2] ? "Se confirmado, " + t.quem + " incorpora em " + t.onde + ". Se descartado, informar o motivo à SCS e excluir o item." : !v.s[3] ? "Devolver à SCS na reunião seguinte." : "Ciclo concluído. Entra no cálculo de V5" + (t.ivt ? "; registrar a revisão de medida." : ".");
    return '<div class="sheet item"><div class="hd"><b>' + esc(t.n) + '</b><span class="note">' + esc(v.ma || "—") + ' · <button class="xbtn" data-del="' + v.id + '">excluir</button></span></div>' + (v.desc ? '<span class="small">' + esc(v.desc) + "</span>" : "") +
      '<div class="steps4">' + labels.map((l, i) => '<label class="st' + (v.s[i] ? " done" : "") + '"><input type="checkbox" data-v="' + v.id + '" data-s="' + i + '"' + (v.s[i] ? " checked" : "") + (i === 0 || (i > 0 && !v.s[i - 1] && !v.s[i]) ? " disabled" : "") + "><span>" + esc(l) + (v.d[i] ? '<br><span class="note mono">' + fmtD(new Date(v.d[i])) + "</span>" : "") + "</span></label>").join("") + "</div>" +
      '<div class="note">' + nxt + "</div></div>";
  }).join("") : '<p class="note">Nenhuma invisibilidade registrada.</p>';
  const q = qOf(Date.now()), inc = vis.filter(v => v.s[2]), incQ = inc.filter(v => qOf(v.d[2]) === q);
  $("#viSum").innerHTML = '<div class="kpi"><span class="eyebrow">Incorporadas no trimestre</span><span class="v">' + incQ.length + '</span><span class="chip dot ' + (incQ.length >= 1 ? "s-ok" : "s-crit") + '">' + (incQ.length >= 1 ? "meta mínima atingida" : "abaixo da mínima") + '</span></div><div class="kpi"><span class="eyebrow">Aguardando verificação</span><span class="v">' + vis.filter(v => !v.s[1]).length + "</span></div>";
}
function initVis(){
  $("#viTipo").innerHTML = VTIPOS.map(t => '<option value="' + t.k + '">' + t.n + "</option>").join("");
  $("#viTipo").addEventListener("change", renderVisHint); renderVisHint();
  $("#viAdd").addEventListener("click", () => { vis.push({id:uid(), tipo:$("#viTipo").value, ma:$("#viMa").value.trim(), desc:$("#viDesc").value.trim(), s:[true, false, false, false], d:[Date.now(), null, null, null]}); S.set("vis", vis); $("#viDesc").value = ""; renderVis(); });
  $("#viList").addEventListener("change", e => { const t = e.target; if(t.dataset.s == null) return; const v = vis.find(x => x.id === t.dataset.v), i = +t.dataset.s; v.s[i] = t.checked; v.d[i] = t.checked ? Date.now() : null; if(!t.checked) for(let j = i + 1; j < 4; j++){ v.s[j] = false; v.d[j] = null; } S.set("vis", vis); renderVis(); });
  $("#viList").addEventListener("click", e => { const d = e.target.dataset.del; if(d){ vis = vis.filter(v => v.id !== d); S.set("vis", vis); renderVis(); } });
  renderVis();
}

/* ---------- 07 reunião ---------- */
const BLOCKS = [
  ["Abertura", 10, "Quem está presente e quem está ausente?", "Dupla de Facilitação"],
  ["Retorno", 15, "O que aconteceu com cada encaminhamento anterior, inclusive os sem resposta?", "Dupla e serviços"],
  ["Leitura do mapa", 20, "Onde estão os sinais das duas vigilâncias, e em que áreas do mapa da cartografia social?", "Pesquisadores populares falam primeiro"],
  ["Convergências e divergências", 20, "O que as duas vigilâncias registraram em comum, o que apenas uma registrou e que dado oficial é contestado?", "Todos"],
  ["Priorização (Matriz UIC)", 30, "O que é mais urgente, de maior impacto e sobre o que há maior capacidade de agir?", "Plenária"],
  ["Encaminhamentos", 15, "Quem faz o quê, até quando, por qual registro de ação?", "Dupla de Facilitação"],
  ["Ata", 10, "Todos reconhecem o que foi decidido?", "Dupla de Facilitação"]
];
const SEG_COM = ["Pesquisadores populares","Associação de moradores","Mulheres","Juventude","Pessoas idosas","População negra e povos tradicionais","Pessoas com deficiência","Grupos religiosos","Comércio e trabalhadores locais"];
const SEG_SERV = ["Equipe de APS","Vigilância em Saúde","CTIS"];
const mt = Object.assign({date:iso(today), cur:0, t:[0,0,0,0,0,0,0], run:false, segs:{}, ct:[], uic:[]}, S.get("mt", {}));
let enc = S.get("enc", []);
const ENC_ST = ["Em andamento","Respondido no prazo","Respondido fora do prazo","Sem resposta"];
function saveMt(){ S.set("mt", mt); }
function addEnc(txt, resp, reg){ const base = mt.date ? parseISO(mt.date) : today; enc.push({id:uid(), txt, resp, reg, criado:mt.date || iso(today), prazo:iso(addDays(base, REG[reg].dias)), st:"Em andamento"}); S.set("enc", enc); renderEnc(); renderRet(); renderAta(); }
function mmss(s){ s = Math.max(0, Math.round(s)); return pad(Math.floor(s / 60)) + ":" + pad(s % 60); }
function renderClock(){
  const b = BLOCKS[mt.cur], sp = mt.t[mt.cur];
  $("#mtClock").textContent = mmss(sp); $("#mtClock").style.color = sp > b[1] * 60 ? "var(--crit)" : "var(--navy)";
  $("#mtQ").innerHTML = '<span class="eyebrow">Bloco ' + (mt.cur + 1) + " · " + b[0] + "</span>" + b[2];
  $("#mtGo").textContent = mt.run ? "Pausar" : "Iniciar";
  $("#mtBlocks").innerHTML = BLOCKS.map((x, i) => '<div class="blk' + (i === mt.cur ? " cur" : i < mt.cur ? " past" : "") + '" data-b="' + i + '" role="button" tabindex="0"><span class="mono">' + (i + 1) + "</span><span><b>" + x[0] + '</b><br><span class="who">' + x[3] + '</span></span><span class="m">' + mmss(mt.t[i]) + " / " + x[1] + ':00</span><span class="bar" style="width:' + Math.min(100, 100 * mt.t[i] / (x[1] * 60)) + '%"></span></div>').join("");
}
function renderSegs(){
  $("#mtSegs").innerHTML = SEG_COM.concat(SEG_SERV).map(s => '<label><input type="checkbox" data-seg="' + esc(s) + '"' + (mt.segs[s] ? " checked" : "") + "><span>" + esc(s) + (SEG_SERV.includes(s) ? ' <span class="note">(serviço)</span>' : "") + "</span></label>").join("");
  const n = SEG_COM.filter(s => mt.segs[s]).length, c = n >= 4 ? "s-ok" : n >= 2 ? "s-warn" : "s-crit";
  $("#mtV9").innerHTML = '<div class="row"><span class="chip dot ' + c + '">' + n + (n === 1 ? " segmento comunitário</span>" : " segmentos comunitários</span>") + "<span class=\"note\">V9: mínimo de 2, recomendado 4. O outro componente do V9 (pesquisadores com registro no mês) provém da Ágora.</span></div>" + (!mt.segs["Pesquisadores populares"] ? '<p class="small" style="color:var(--crit)">Sem pesquisadores populares presentes, a leitura do mapa perde seu protagonista.</p>' : "") + (!mt.segs["Equipe de APS"] && !mt.segs["Vigilância em Saúde"] ? '<p class="small" style="color:var(--warn)">Sem a presença da APS e da vigilância, os encaminhamentos exigirão comunicação formal após a reunião.</p>' : "");
}
function encLate(e){ return e.st === "Em andamento" && parseISO(e.prazo) < today; }
function renderRet(){
  const prev = enc.filter(e => e.criado !== mt.date);
  const fin = prev.filter(e => e.st !== "Em andamento" || encLate(e)), ok = prev.filter(e => e.st === "Respondido no prazo");
  $("#mtRet").innerHTML = prev.length ? "<thead><tr><th>Encaminhamento</th><th>Responsável</th><th>Registro</th><th>Prazo</th><th>Situação</th></tr></thead><tbody>" + prev.map(e => "<tr><td>" + esc(e.txt) + "</td><td>" + esc(e.resp || "—") + "</td><td>" + REG[e.reg].n + '</td><td class="mono small"' + (encLate(e) ? ' style="color:var(--crit)"' : "") + ">" + fmtD(parseISO(e.prazo)) + (encLate(e) ? " · vencido" : "") + '</td><td><select data-st="' + e.id + '">' + ENC_ST.map(s => "<option" + (s === e.st ? " selected" : "") + ">" + s + "</option>").join("") + "</select></td></tr>").join("") + '</tbody><tfoot><tr><td colspan="5" class="small muted" style="padding-top:8px">V7 (respondidos no prazo entre os vencidos ou respondidos): <b class="mono">' + (fin.length ? Math.round(100 * ok.length / fin.length) + "%" : "—") + "</b> · meta mínima 60%, recomendada 80%. Encaminhamento sem resposta é registro, não esquecimento.</td></tr></tfoot>" : '<tbody><tr><td class="note">Não há encaminhamentos de reuniões anteriores. Os encaminhamentos criados com outra data aparecerão nesta lista.</td></tr></tbody>';
}
function renderMtPauta(){ $("#mtPauta").innerHTML = pauta.length ? pauta.map(p => '<div class="item"><div class="hd"><b>' + esc(p.cls) + '</b><span class="note">' + esc(p.ma) + " · " + esc(p.ag) + '</span></div><span class="small">' + esc(p.perg || "") + "</span></div>").join("") : '<p class="note">Nenhum item enviado pelo Leitor de sinais.</p>'; }
function renderCt(){ $("#ctList").innerHTML = mt.ct.map(c => '<div class="item"><div class="hd"><b>' + esc(c.dado) + '</b><span class="note">' + esc(c.saida) + ' · <button class="xbtn" data-delct="' + c.id + '">remover</button></span></div></div>').join(""); }
function uicTot(u){ return (+u.u || 0) + (+u.i || 0) + (+u.c || 0); }
function renderUic(){
  const rows = mt.uic.slice().sort((a, b) => uicTot(b) - uicTot(a));
  $("#uicTbl").innerHTML = rows.length ? '<thead><tr><th>Problema</th><th title="Urgência">U</th><th title="Impacto">I</th><th title="Capacidade de agência">C</th><th>Soma</th><th>Leitura</th><th></th></tr></thead><tbody>' + rows.map(u => "<tr><td>" + esc(u.p) + "</td>" + ["u","i","c"].map(k => '<td><input type="number" min="1" max="5" value="' + esc(u[k]) + '" data-uic="' + u.id + '" data-k="' + k + '"></td>').join("") + '<td class="tot">' + uicTot(u) + '</td><td class="small">' + (+u.i >= 4 && +u.c <= 2 ? '<span class="chip s-warn">candidato a advocacy</span>' : +u.u >= 5 ? '<span class="chip s-crit">avaliar resposta imediata</span>' : "") + '</td><td><button class="xbtn" data-deluic="' + u.id + '">remover</button></td></tr>').join("") + "</tbody>" : '<tbody><tr><td class="note">Adicione os problemas em debate.</td></tr></tbody>';
}
function renderEnc(){
  const cur = enc.filter(e => e.criado === mt.date);
  $("#enTbl").innerHTML = cur.length ? "<thead><tr><th>O quê</th><th>Responsável</th><th>Registro</th><th>Prazo</th><th></th></tr></thead><tbody>" + cur.map(e => "<tr><td>" + esc(e.txt) + "</td><td>" + esc(e.resp || "—") + '</td><td><span class="chip" style="--c:' + REG[e.reg].c + '">' + REG[e.reg].n + '</span></td><td class="mono small">' + fmtD(parseISO(e.prazo)) + '</td><td><button class="xbtn" data-delenc="' + e.id + '">remover</button></td></tr>').join("") + "</tbody>" : '<tbody><tr><td class="note">Nenhum encaminhamento nesta reunião. Use a Triagem ou o campo acima.</td></tr></tbody>';
}
function renderAta(){
  const d = mt.date ? fmtD(parseISO(mt.date)) : "__/__/____";
  const segs = Object.keys(mt.segs).filter(s => mt.segs[s]);
  const prev = enc.filter(e => e.criado !== mt.date), cur = enc.filter(e => e.criado === mt.date);
  const rows = mt.uic.slice().sort((a, b) => uicTot(b) - uicTot(a));
  let t = "ATA DA REUNIÃO DELIBERATIVA DA SALA DE COOPERAÇÃO SOCIAL\nData: " + d + "\n\n1. PRESENÇA POR SEGMENTO\n" + (segs.length ? segs.map(s => "- " + s).join("\n") : "- (registrar)") + "\n\n2. RETORNO DOS ENCAMINHAMENTOS ANTERIORES\n" + (prev.length ? prev.map(e => "- " + e.txt + " (" + REG[e.reg].n + "; resp.: " + (e.resp || "—") + "; prazo " + fmtD(parseISO(e.prazo)) + "): " + (encLate(e) ? "PRAZO VENCIDO, sem resposta registrada" : e.st)).join("\n") : "- Nenhum") +
    "\n\n3-4. LEITURA DO MAPA, CONVERGÊNCIAS E DIVERGÊNCIAS\n" + (pauta.length ? pauta.map(p => "- [" + p.cls + "] " + p.ma + ", " + p.ag + ": " + (p.perg || "")).join("\n") : "- (registrar)") + "\nContestações de dados:\n" + (mt.ct.length ? mt.ct.map(c => "- " + c.dado + " → " + c.saida).join("\n") : "- Nenhuma") +
    "\n\n5. PRIORIDADES (MATRIZ UIC: urgência, impacto, capacidade de agência)\n" + (rows.length ? rows.map((u, i) => (i + 1) + ". " + u.p + " (U" + u.u + " I" + u.i + " C" + u.c + " = " + uicTot(u) + ")" + (+u.i >= 4 && +u.c <= 2 ? " — encaminhar como advocacy" : "")).join("\n") : "- (registrar)") +
    "\n\n6. ENCAMINHAMENTOS\n" + (cur.length ? cur.map(e => "- " + e.txt + " | resp.: " + (e.resp || "—") + " | " + REG[e.reg].n + " | prazo " + fmtD(parseISO(e.prazo))).join("\n") : "- (registrar)") +
    "\n\nOs resultados desta reunião somente seguem para a gestão, a academia ou os financiadores após a devolução a esta SCS.\n\nAssinaturas da Dupla de Facilitação:\n______________________________    ______________________________";
  $("#ata").value = t;
}
function renderMeeting(){ $("#mtDate").value = mt.date || ""; renderClock(); renderSegs(); renderRet(); renderMtPauta(); renderCt(); renderUic(); renderEnc(); renderAta(); }
function initMeeting(){
  $("#enReg").innerHTML = Object.keys(REG).map(k => '<option value="' + k + '">' + REG[k].n + "</option>").join("");
  let last = Date.now();
  setInterval(() => { const n = Date.now(); if(mt.run){ mt.t[mt.cur] += (n - last) / 1000; if(curView === "reuniao") renderClock(); if(Math.floor(n / 1000) % 10 === 0) saveMt(); } last = n; }, 1000);
  $("#mtGo").addEventListener("click", () => { mt.run = !mt.run; saveMt(); renderClock(); });
  $("#mtNext").addEventListener("click", () => { if(mt.cur < BLOCKS.length - 1) mt.cur++; saveMt(); renderClock(); });
  $("#mtReset").addEventListener("click", () => { mt.t = [0,0,0,0,0,0,0]; mt.cur = 0; mt.run = false; saveMt(); renderClock(); });
  const pickB = e => { const b = e.target.closest(".blk"); if(b){ mt.cur = +b.dataset.b; saveMt(); renderClock(); } };
  $("#mtBlocks").addEventListener("click", pickB);
  $("#mtBlocks").addEventListener("keydown", e => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); pickB(e); } });
  $("#mtDate").addEventListener("change", e => { mt.date = e.target.value; saveMt(); renderMeeting(); });
  $("#mtSegs").addEventListener("change", e => { const s = e.target.dataset.seg; if(s){ mt.segs[s] = e.target.checked; saveMt(); renderSegs(); renderAta(); } });
  $("#mtRet").addEventListener("change", e => { const id = e.target.dataset.st; if(id){ enc.find(x => x.id === id).st = e.target.value; S.set("enc", enc); renderRet(); renderAta(); } });
  $("#ctAdd").addEventListener("click", () => { const d = $("#ctDado").value.trim(); if(!d) return; mt.ct.push({id:uid(), dado:d, saida:$("#ctSaida").value}); $("#ctDado").value = ""; saveMt(); renderCt(); renderAta(); });
  $("#ctList").addEventListener("click", e => { const d = e.target.dataset.delct; if(d){ mt.ct = mt.ct.filter(c => c.id !== d); saveMt(); renderCt(); renderAta(); } });
  $("#uicAdd").addEventListener("click", () => { const p = $("#uicTxt").value.trim(); if(!p) return; mt.uic.push({id:uid(), p, u:3, i:3, c:3}); $("#uicTxt").value = ""; saveMt(); renderUic(); renderAta(); });
  $("#uicTbl").addEventListener("change", e => { const id = e.target.dataset.uic; if(id){ const u = mt.uic.find(x => x.id === id); u[e.target.dataset.k] = Math.max(1, Math.min(5, +e.target.value || 1)); saveMt(); renderUic(); renderAta(); } });
  $("#uicTbl").addEventListener("click", e => { const d = e.target.dataset.deluic; if(d){ mt.uic = mt.uic.filter(u => u.id !== d); saveMt(); renderUic(); renderAta(); } });
  $("#enAdd").addEventListener("click", () => { const t = $("#enTxt").value.trim(); if(!t) return; addEnc(t, $("#enResp").value.trim(), $("#enReg").value); $("#enTxt").value = ""; $("#enResp").value = ""; });
  $("#enTbl").addEventListener("click", e => { const d = e.target.dataset.delenc; if(d){ enc = enc.filter(x => x.id !== d); S.set("enc", enc); renderEnc(); renderAta(); } });
  $("#ataCopy").addEventListener("click", async e => { const ok = await copyText($("#ata").value); flash(e.target, ok ? "Copiada ✓" : "Selecione e copie"); });
  renderMeeting();
}

/* ---------- 08 painel PVI ---------- */
const PV = [
  {b:"Sinais das duas vigilâncias"},
  {id:"V1", n:"Sinal popular", q:"O que o território sinaliza?", f:[["v","alertas / 1.000 hab."]], free:true},
  {id:"V2", n:"Sinal tradicional", q:"O que os serviços registram?", f:[["v","casos notificados"]], free:true},
  {b:"Articulação entre as vigilâncias"},
  {id:"V3", n:"Confirmação", q:"O alerta se confirma?", f:[["v","% verificados"],["c","% confirmados"]], blk:"A"},
  {id:"V4", n:"Antecipação", q:"O território antecipa?", f:[["v","% precedidos"],["a","% esperado ao acaso"]], blk:"A"},
  {id:"V5", n:"Visibilização", q:"O invisível passou a constar?", f:[["v","incorporações no trimestre"]], blk:"A", tri:true},
  {b:"Resposta e governança"},
  {id:"V6", n:"Resposta a alertas críticos", q:"O serviço responde em 72 horas?", f:[["v","% em até 72 h"]], blk:"R", min:80, rec:95},
  {id:"V7", n:"Resposta a encaminhamentos", q:"A gestão responde à Sala?", f:[["v","% no prazo"]], blk:"R", min:60, rec:80},
  {id:"V8", n:"Incorporação à programação", q:"As prioridades entram na APPT?", f:[["v","% das prioridades"]], blk:"R", min:50, rec:75, tri:true},
  {b:"Participação"},
  {id:"V9", n:"Participação", q:"Quem participa?", f:[["v","% pesquisadores com registro"],["g","segmentos na reunião"]], blk:"P"}
];
let pv = S.get("pv", {});
const num = x => (x === "" || x == null || isNaN(+x)) ? null : +x;
const worst = (...s) => s.includes("crit") ? "crit" : s.includes("warn") ? "warn" : s.includes("na") ? "na" : "ok";
const band = (v, min, rec) => v == null ? "na" : v < min ? "crit" : v < rec ? "warn" : "ok";
function pvStatus(d, per){
  const g = k => num((pv[d.id] || {})[per + k]);
  if(d.free) return "free";
  switch(d.id){
    case "V3": return worst(band(g("v"), 80, 95), band(g("c"), 40, 60));
    case "V4": { const v = g("v"), a = g("a"); if(v == null || a == null) return "na"; if(v < 30 || v <= a) return "crit"; return v >= 50 ? "ok" : "warn"; }
    case "V5": { const v = g("v"); if(v == null) return "na"; if(v < 1) return "crit"; const p = num((pv.V5 || {})[(per === "c" ? "p" : "x") + "v"]); return per === "c" && p != null ? (v > p ? "ok" : "warn") : "warn"; }
    case "V9": return worst(band(g("v"), 50, 70), band(g("g"), 2, 4));
    default: return band(g("v"), d.min, d.rec);
  }
}
function pvRead(d){
  const g = k => num((pv[d.id] || {})["c" + k]), p = k => num((pv[d.id] || {})["p" + k]), st = pvStatus(d, "c");
  if(d.free){ const v = g("v"), pr = p("v"); let s = "Sem meta: mais sinais podem indicar mais problemas, mais observação ou ambos. Leia em conjunto com " + (d.id === "V1" ? "V2" : "V1") + ", sobre o mapa da cartografia social."; if(v != null && pr != null && pr > 0) s = "Variação de " + (v >= pr ? "+" : "") + Math.round(100 * (v - pr) / pr) + "% sobre o período anterior. " + s; return s; }
  if(st === "na") return "Informe o período atual.";
  if(d.id === "V3"){ if(g("v") < 80) return "Muitos alertas sem verificação: falha do serviço, e não da vigilância popular. Cobrar a verificação."; if(g("c") < 40) return "Baixa confirmação entre os verificados: rever as categorias de alerta e a formação."; }
  if(d.id === "V4" && st === "crit") return g("v") <= g("a") ? "Não supera o acaso: a antecipação ainda não está demonstrada. Rever as categorias compatíveis e o fluxo entre a SCS e os serviços." : "Antecipação abaixo de 30%: rever o fluxo entre a SCS e os serviços.";
  if(d.id === "V5" && st === "crit") return "Nenhuma incorporação no trimestre: a lista de verificação está parada?";
  if(d.id === "V6" && st === "crit") return "Alertas críticos sem resposta: escalonar com o histórico (Nível 2).";
  if(d.id === "V7" && st === "crit") return "A gestão não responde à Sala: advocacy com o histórico de respostas.";
  if(d.id === "V8" && st === "crit") return "Prioridades fora da programação: levar à pactuação trimestral da APPT.";
  if(d.id === "V9" && st === "crit") return "Risco de fadiga participativa ou de captura tecnocrática: consultar o módulo Riscos.";
  return st === "ok" ? "Na meta recomendada." : st === "warn" ? "Entre a mínima e a recomendada." : "";
}
function renderPv(){
  $("#pvList").innerHTML = PV.map(d => {
    if(d.b) return '<div class="blockh">' + d.b + "</div>";
    const st = pvStatus(d, "c"), cls = {ok:"s-ok", warn:"s-warn", crit:"s-crit"}[st] || "";
    const lab = {ok:"recomendada", warn:"mínima", crit:"abaixo da mínima", na:"sem dado", free:"sem meta"}[st];
    const inp = (per, k, l) => '<label>' + l + (per === "p" ? " · anterior" : "") + '<input inputmode="decimal" data-pv="' + d.id + '" data-k="' + per + k + '" value="' + esc((pv[d.id] || {})[per + k] ?? "") + '"></label>';
    return '<div class="pvi"><span class="cd">' + d.id + '</span><div><b>' + d.n + '</b><div class="note">' + d.q + (d.tri ? " · trimestral" : " · mensal") + '</div><span class="chip dot ' + cls + '" style="margin-top:4px">' + lab + '</span></div><div class="ins">' + d.f.map(f => inp("c", f[0], f[1]) + inp("p", f[0], f[1])).join("") + '</div><div class="rd">' + pvRead(d) + "</div></div>";
  }).join("");
  renderTrig();
}
function renderTrig(){
  const out = [];
  PV.filter(d => d.id && !d.free).forEach(d => {
    if(pvStatus(d, "c") === "crit" && pvStatus(d, "p") === "crit"){
      if(d.id !== "V6") out.push(["s-crit", d.id + " abaixo da mínima por dois períodos consecutivos: o supervisor de campo examina e leva à SCS uma proposta de correção."]);
      if(d.id === "V6") out.push(["s-crit", "V6 abaixo da mínima por dois meses: aciona o Nível 2 de governança com o histórico de alertas sem resposta."]);
    }
  });
  [["A","Articulação (V3–V5)"],["R","Resposta e governança (V6–V8)"]].forEach(b => { const n = PV.filter(d => d.blk === b[0] && pvStatus(d, "c") === "crit").length; if(n >= 2) out.push(["s-warn", "Bloco " + b[1] + " com " + n + " indicadores abaixo da mínima: pauta prioritária do Relatório de Ciclo."]); });
  $("#pvTrig").innerHTML = out.length ? out.map(o => '<div class="trigger"><span class="chip dot ' + o[0] + '">gatilho</span><span>' + o[1] + "</span></div>").join("") : '<p class="note">Nenhum gatilho acionado com os valores informados.</p>';
}
function initPv(){
  renderPv();
  $("#pvList").addEventListener("change", e => { const id = e.target.dataset.pv; if(!id) return; pv[id] = pv[id] || {}; pv[id][e.target.dataset.k] = e.target.value.replace(",", "."); S.set("pv", pv); renderPv(); });
  $("#pvDemo").addEventListener("click", () => { pv = {V1:{cv:"12.4", pv:"10.1"}, V2:{cv:"31", pv:"22"}, V3:{cv:"72", cc:"55", pv:"76", pc:"58"}, V4:{cv:"34", ca:"18"}, V5:{cv:"2", pv:"1"}, V6:{cv:"75", pv:"78"}, V7:{cv:"64", pv:"58"}, V8:{cv:"40", pv:"55"}, V9:{cv:"61", cg:"3", pv:"66", pg:"4"}}; S.set("pv", pv); renderPv(); });
  $("#pvClear").addEventListener("click", () => { pv = {}; S.set("pv", pv); renderPv(); });
}

/* ---------- 09 agenda ---------- */
const RIT = {cont:"Contínuo", sem:"Semanal", men:"Mensal", tri:"Trimestral", smt:"Semestral", anu:"Anual"};
const WEEK = [["Todos os dias","Registro de alertas; os críticos acionam o fluxo de 72 horas","Pesquisadores populares","cont"],["Segunda-feira","Supervisor revisa os alertas da semana anterior e destaca os críticos","Supervisor de campo","sem"],["Quarta-feira","Dupla confere os prazos dos encaminhamentos abertos","Dupla de Facilitação","sem"],["Sexta-feira","Técnico de dados carrega as contagens oficiais e atualiza o mapa","Técnico de dados","sem"]];
const ag = Object.assign({start:iso(today), nth:3, dow:4, months:12}, S.get("ag", {}));
function nthWeekday(y, m, n, dow){
  if(n === -1){ const d = new Date(y, m + 1, 0); while(d.getDay() !== dow) d.setDate(d.getDate() - 1); return d; }
  const d = new Date(y, m, 1); while(d.getDay() !== dow) d.setDate(d.getDate() + 1); d.setDate(d.getDate() + 7 * (n - 1)); return d;
}
function buildAgenda(){
  const st = parseISO(ag.start), ev = []; let y = st.getFullYear(), m = st.getMonth(), k = 0;
  while(k < ag.months){
    const d = nthWeekday(y, m, +ag.nth, +ag.dow);
    if(d >= st){
      ev.push({d:addDays(d, -7), t:"Relatório de dados entregue à Dupla (semana anterior à reunião)", w:"Técnico de dados", r:"men"});
      ev.push({d, t:"Reunião deliberativa da SCS; PVI do mês; encaminhamentos", w:"Dupla, SCS, serviços", r:"men", big:true});
      if(k % 3 === 2) ev.push({d, t:"Fechamento do trimestre: V5 e V8; programação das equipes (APPT); IRS; Relatório de Ciclo; Dimensões 2 e 3 dos DPT", w:"SCS, pesquisadores populares, equipes", r:"tri"});
      if(k % 6 === 5) ev.push({d, t:"Seminário de rede das SCS; Dimensão 4 dos DPT", w:"Supervisor de campo, Coordenação", r:"smt"});
      if(k % 12 === 11) ev.push({d, t:"Atualização do INS; revisão do Plano Popular, da cartografia social e do currículo; relatório técnico após devolução", w:"Coordenação, SCS", r:"anu"});
      k++;
    }
    m++; if(m > 11){ m = 0; y++; }
    if(y > st.getFullYear() + 4) break;
  }
  return ev.filter(e => e.d >= addDays(st, -7)).sort((a, b) => a.d - b.d);
}
function renderAgenda(){
  $("#agStart").value = ag.start; $("#agNth").value = ag.nth; $("#agDow").value = ag.dow; $("#agMonths").value = ag.months;
  $("#agLegend").innerHTML = Object.keys(RIT).map(r => '<span class="chip dot r-' + r + '">' + RIT[r] + "</span>").join("");
  $("#agWeek").innerHTML = WEEK.map(w => '<div class="item"><div class="hd"><b>' + w[0] + '</b><span class="chip r-' + w[3] + '">' + RIT[w[3]] + '</span></div><span class="small">' + w[1] + ' <span class="note">· ' + w[2] + "</span></span></div>").join("");
  const ev = buildAgenda(), by = {};
  ev.forEach(e => { const key = e.d.getFullYear() + "-" + pad(e.d.getMonth()); (by[key] = by[key] || []).push(e); });
  $("#agList").innerHTML = Object.keys(by).sort().map(k => { const [y, m] = k.split("-").map(Number); return '<div class="month"><div class="mh">' + MESES[m] + " " + y + '</div><div class="evts">' + by[k].map(e => '<div class="evt' + (e.big ? " big" : "") + '"><span class="when">' + DOWS[e.d.getDay()] + " " + pad(e.d.getDate()) + '/' + pad(e.d.getMonth() + 1) + '</span><span class="what"><span class="chip r-' + e.r + '">' + RIT[e.r] + '</span><span class="t">' + e.t + '</span><span class="who">' + e.w + "</span></span></div>").join("") + "</div></div>"; }).join("");
}
function initAgenda(){
  renderAgenda();
  ["agStart","agNth","agDow","agMonths"].forEach(id => $("#" + id).addEventListener("change", () => { ag.start = $("#agStart").value || iso(today); ag.nth = +$("#agNth").value; ag.dow = +$("#agDow").value; ag.months = +$("#agMonths").value; S.set("ag", ag); renderAgenda(); }));
  $("#agCopy").addEventListener("click", async e => { const t = "AGENDA DO CICLO DE INTELIGÊNCIA TERRITORIAL\n\nSemana-tipo:\n" + WEEK.map(w => "- " + w[0] + ": " + w[1] + " (" + w[2] + ")").join("\n") + "\n\n" + buildAgenda().map(x => fmtD(x.d) + " [" + RIT[x.r] + "] " + x.t + " — " + x.w).join("\n"); const ok = await copyText(t); flash(e.target, ok ? "Copiada ✓" : "Não foi possível copiar"); });
}

/* ---------- 10 papéis ---------- */
const ACTORS = [
  {n:"Pesquisadores populares", lv:[3,1,3,2,2], ph:["Registrar alertas na Ágora no momento da observação; atualizar a cartografia social","Contribuir com relatos sistematizados","Falar primeiro na leitura do mapa; validar, contestar e priorizar","Participar da verificação conjunta; acompanhar as respostas","Escrever o Relatório de Ciclo"]},
  {n:"Dupla de Facilitação da SCS", lv:[2,1,3,2,2], ph:["Receber os alertas críticos e acionar os serviços","Receber o relatório de dados antes da reunião","Conduzir a reunião e o protocolo MTEI; assinar a ata","Comunicar formalmente os serviços; conferir prazos às quartas","Apoiar o Relatório de Ciclo; ponto de contato com o CTIS"]},
  {n:"Equipes de APS (ESF e ACS)", lv:[2,1,2,3,1], ph:["Manter o cadastro territorial; receber alertas clínicos","Apoiar a leitura dos registros do e-SUS APS","Apresentar a perspectiva clínica e levar as prioridades à equipe","Responder aos encaminhamentos; cadastrar domicílios; incorporar prioridades à APPT","Participar da avaliação da articulação"]},
  {n:"Equipe de Vigilância em Saúde", lv:[2,2,2,3,1], ph:["Manter notificações e LIRAa","Validar a leitura epidemiológica do cruzamento","Apresentar a perspectiva epidemiológica e levar as prioridades à equipe","Investigar alertas compatíveis; incorporar pontos críticos ao roteiro dos ACE; responder em 72 horas","Participar da avaliação da articulação"]},
  {n:"Técnico de dados do CTIS", lv:[1,3,1,0,2], ph:["Carregar os dados oficiais às sextas","Cruzar os fluxos no ambiente seguro; calcular PVI e INS; preparar o relatório","Apoiar a leitura do painel quando solicitado","","Registrar as revisões de medida; apoiar o IRS"]},
  {n:"Supervisor de campo do CTIS", lv:[2,1,2,1,3], ph:["Revisar os alertas às segundas e destacar os críticos","Acompanhar as dimensões dos DPT","Oferecer perspectiva metodológica, quando presente","Acompanhar os alertas críticos","Coordenar a reflexividade e o IRS; examinar os gatilhos do Painel"]},
  {n:"Coordenação do CTIS", lv:[0,0,0,2,3], ph:["","","","Conduzir o Nível 2 de governança e o escalonamento","Garantir que a publicação ocorra somente após a devolução; interface com a gestão e o Ministério da Saúde"]}
];
let actSel = S.get("act", 0);
const dots = (n, c) => '<span class="lvl" style="--c:' + c + '" aria-label="' + ["nenhuma","apoio","compartilhada","primária"][n] + '">' + [1,2,3].map(i => "<i" + (i > n ? ' class="off"' : "") + "></i>").join("") + "</span>";
function renderActors(){
  $("#actorPick").innerHTML = ACTORS.map((a, i) => '<button type="button" data-i="' + i + '" aria-pressed="' + (i === actSel) + '">' + a.n + "</button>").join("");
  $("#actorMx").innerHTML = "<thead><tr><th>Ator</th>" + PHASES.map(p => "<th>" + p.id + "</th>").join("") + "</tr></thead><tbody>" + ACTORS.map((a, i) => '<tr data-i="' + i + '"' + (i === actSel ? ' class="sel"' : "") + "><td>" + a.n + "</td>" + a.lv.map((l, j) => "<td>" + (l ? dots(l, PHASES[j].c) : "") + "</td>").join("") + "</tr>").join("") + "</tbody>";
  const a = ACTORS[actSel];
  $("#actorPh").innerHTML = PHASES.map((p, j) => '<div class="rp' + (a.lv[j] ? "" : " none") + '" style="--c:' + p.c + '"><div class="h"><b>' + p.id + " · " + p.n + "</b>" + (a.lv[j] ? dots(a.lv[j], p.c) : "") + "</div><p>" + (a.ph[j] || "Sem atribuição nesta fase.") + "</p></div>").join("");
}
function initActors(){
  renderActors();
  const pick = e => { const t = e.target.closest("[data-i]"); if(t){ actSel = +t.dataset.i; S.set("act", actSel); renderActors(); } };
  $("#actorPick").addEventListener("click", pick); $("#actorMx").addEventListener("click", pick);
}

/* ---------- 11 governança ---------- */
const LEVELS = [
  {n:"Nível 1 · Governança territorial (SCS)", d:"Define a agenda; valida e contesta os dados; aprova Plano Popular, encaminhamentos e publicações."},
  {n:"Nível 2 · Governança metodológica (CTIS)", d:"Responde pela Ágora, pela conformidade com a LGPD e pelo cálculo do INS e do PVI; conduz o escalonamento; não decide sem a SCS."},
  {n:"Nível 3 · Governança institucional", d:"Fiocruz Brasília e gestão pública: financiamento, articulação com o SUS e o Ministério da Saúde."}
];
const SITS = [
  {s:"Divergência sobre a prioridade de um alerta", l:[0], quem:"SCS, na reunião", leva:"Matriz UIC e o motivo da decisão registrado em ata"},
  {s:"Alerta crítico sem resposta em 72 horas", l:[0,1], quem:"Nível 2 notifica a coordenação regional de saúde", leva:"Registro do alerta, da hora zero e da comunicação formal"},
  {s:"V6 abaixo da meta mínima por dois meses consecutivos", l:[0,1], quem:"Nível 2", leva:"Histórico de alertas sem resposta"},
  {s:"Indicador de V3 a V9 abaixo da mínima por dois períodos", l:[0], quem:"Supervisor de campo leva à SCS", leva:"Proposta de correção"},
  {s:"Dois ou mais indicadores do mesmo bloco abaixo da mínima", l:[0], quem:"SCS, no Relatório de Ciclo", leva:"Pauta prioritária do trimestre"},
  {s:"Discordância sobre o método de cálculo de um indicador", l:[0,1], quem:"Nível 2, com devolução à SCS", leva:"Ficha técnica e metaindicadores; mudança somente em nova versão"},
  {s:"Encaminhamento que exige decisão institucional", l:[0,1,2], quem:"Níveis 2 e 3, por advocacy (90 a 180 dias)", leva:"INS, cartografia social e histórico de respostas"},
  {s:"Disputa sobre o uso institucional dos dados do território", l:[0,1,2], quem:"Nível 3", leva:"Autorização da SCS e termos de uso dos dados"}
];
let govSel = 0;
function renderGov(){
  $("#govOpts").innerHTML = SITS.map((x, i) => '<button class="opt" type="button" data-i="' + i + '" aria-pressed="' + (i === govSel) + '">' + x.s + "</button>").join("");
  const x = SITS[govSel], top = Math.max.apply(null, x.l);
  $("#govLv").innerHTML = LEVELS.map((l, i) => i).reverse().map(i => '<div class="level' + (i === top ? " on" : "") + '" style="' + (x.l.includes(i) ? "" : "opacity:.45") + '"><span class="lt">' + LEVELS[i].n + '</span><span class="small muted">' + LEVELS[i].d + "</span></div>" + (i > 0 ? '<div class="up-arrow">' + (x.l.includes(i) ? "↑ sobe porque não se resolveu no nível inferior" : "·") + "</div>" : "")).join("");
  $("#govOut").innerHTML = '<dl class="kv"><dt>Quem resolve</dt><dd>' + x.quem + "</dd><dt>O que levar</dt><dd>" + x.leva + "</dd><dt>Retorno</dt><dd>" + (top > 0 ? "A decisão volta à SCS para conhecimento e registro em ata." : "Resolve-se na Sala, sem escalonamento.") + '</dd></dl><div class="status-box" style="--c:var(--green)"><b>Regra que não se escalona</b><span class="small">Devolver antes de publicar: nenhum resultado segue para a gestão, a academia ou os financiadores sem passar pela SCS.</span></div>';
}
function initGov(){ renderGov(); $("#govOpts").addEventListener("click", e => { const b = e.target.closest(".opt"); if(b){ govSel = +b.dataset.i; renderGov(); } }); }

/* ---------- 12 implantação ---------- */
const STAGES = [
  ["Ativação das redes sociotécnicas","Quem, no território, precisa participar e quem costuma ficar de fora?","Mapa sociométrico; pacto dialógico"],
  ["Diagnóstico multidimensional","O que os dados oficiais revelam sobre este território e o que omitem?","Dimensões 1 a 4 dos DPT; leitura do INS; primeira lista de invisibilidades"],
  ["Cartografia social","O que o território sabe que os mapas oficiais não mostram?","Mapa do território vivido; áreas de risco, pontos críticos e domicílios a verificar"],
  ["Plano Popular","O que será vigiado, com que prioridade, e o que será exigido?","Agenda das duas vigilâncias no território"],
  ["Formação","Quem observará, registrará e interpretará, e quem receberá os alertas nos serviços?","Pesquisadores populares formados; equipes de APS e vigilância preparadas"],
  ["Instalação da SCS","Por onde o alerta passa e quem responde?","Sala em operação; interlocutores nomeados; fluxos pactuados"]
];
const READY = ["Agenda de vigilância do Plano Popular aprovada (agravos e condições prioritários)","Categorias de alerta da Ágora ajustadas à agenda","Interlocutor nomeado na UBS de referência e na vigilância em saúde","Prazos de resposta pactuados por escrito (72 horas para alertas críticos)","Cruzamento de dados definido no ambiente seguro, com saída agregada por microárea","Mapa da cartografia social disponível, com áreas de risco, pontos críticos e prioridades do Plano Popular","Dupla de Facilitação definida e segmentos comunitários convidados","Formulários físicos de contingência impressos"];
let ready = S.get("ready", []);
function renderImpl(){
  $("#implSt").innerHTML = STAGES.map((s, i) => '<div class="stage"><span class="n">' + (i + 1) + '</span><div class="stack" style="gap:3px"><b>' + s[0] + '</b><span class="q">' + s[1] + '</span><span class="note">Produto: ' + s[2] + "</span></div></div>").join("");
  const n = READY.filter((_, i) => ready[i]).length, pct = Math.round(100 * n / READY.length);
  $("#implPct").textContent = n + "/" + READY.length; $("#implBar").style.width = pct + "%";
  $("#implCk").innerHTML = READY.map((r, i) => '<label><input type="checkbox" data-r="' + i + '"' + (ready[i] ? " checked" : "") + '><span class="' + (ready[i] ? "done" : "") + '">' + r + "</span></label>").join("");
  $("#implOut").innerHTML = n === READY.length ? '<div class="status-box" style="--c:var(--ok)"><b>Pronto para a primeira reunião deliberativa</b><span class="small">Abra o módulo <a href="#agenda" data-go="agenda">Agenda</a> e defina o calendário.</span></div>' : !ready[2] ? '<div class="status-box" style="--c:var(--crit)"><b>Não inicie o ciclo</b><span class="small">Sem interlocutor nomeado no serviço, os alertas da vigilância popular não têm destino.</span></div>' : '<div class="status-box" style="--c:var(--warn)"><b>Prontidão incompleta</b><span class="small">' + (READY.length - n === 1 ? "Falta 1 item." : "Faltam " + (READY.length - n) + " itens.") + "</span></div>";
}
function initImpl(){ renderImpl(); $("#implCk").addEventListener("change", e => { const i = e.target.dataset.r; if(i != null){ ready[i] = e.target.checked; S.set("ready", ready); renderImpl(); } }); }

/* ---------- 13 riscos ---------- */
const THREATS = [
  {n:"Fadiga participativa", c:"var(--warn)", sinal:"Queda de V9; mesmas pessoas em todas as tarefas", contra:"Ajuda de custo; distribuir a carga; autonomia progressiva", quem:"Supervisor de campo e Coordenação"},
  {n:"Captura tecnocrática", c:"var(--navy)", sinal:"Técnicos falam mais que pesquisadores populares; poucas contestações em ata", contra:"Pesquisadores falam primeiro em cada bloco; nenhum dado se converte em ação sem deliberação", quem:"Dupla de Facilitação"},
  {n:"Desconexão entre IT e ação", c:"var(--crit)", sinal:"Queda de V6, V7 ou V8", contra:"Escalonamento ao Nível 2; devolver à SCS o destino de cada encaminhamento; advocacy com histórico de respostas", quem:"Dupla e Nível 2"},
  {n:"Dependência tecnológica", c:"var(--green)", sinal:"Plataforma Ágora indisponível", contra:"Modo contingência (abaixo)", quem:"Técnico de dados"}
];
const CONT = ["Comunicar à SCS e aos pesquisadores populares que o modo contingência está ativo","Usar formulários físicos equivalentes (local, data e hora, categoria, urgência)","Alertas críticos: a Dupla comunica a UBS e a vigilância diretamente, mantendo as 72 horas","Reunião com mapa e Painel impressos do último mês disponível","Com o retorno do sistema: digitar os formulários e marcar o período como “contingência”"];
let cont = S.get("cont", []);
function renderRiscos(){
  $("#threats").innerHTML = THREATS.map(t => '<div class="sheet threat" style="--c:' + t.c + '"><h3>' + t.n + '</h3><dl class="kv"><dt>Sinal de alerta</dt><dd>' + t.sinal + "</dd><dt>Contramedida</dt><dd>" + t.contra + "</dd><dt>Quem aciona</dt><dd>" + t.quem + "</dd></dl></div>").join("");
  $("#contCk").innerHTML = CONT.map((c, i) => '<label><input type="checkbox" data-c="' + i + '"' + (cont[i] ? " checked" : "") + '><span class="' + (cont[i] ? "done" : "") + '">' + c + "</span></label>").join("");
}
function initRiscos(){ renderRiscos(); $("#contCk").addEventListener("change", e => { const i = e.target.dataset.c; if(i != null){ cont[i] = e.target.checked; S.set("cont", cont); renderRiscos(); } }); }

/* ---------- cópia de segurança dos registros ---------- */
function initBackup(){
  const keys = () => { const out = []; try{ for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if(k && k.indexOf("itp2:") === 0) out.push(k); } }catch(e){} return out; };
  $("#bkExport").addEventListener("click", () => {
    const data = {app:"protocolo-inteligencia-territorial", versao:"2.0", exportado:new Date().toISOString(), registros:{}};
    keys().forEach(k => { try{ data.registros[k] = JSON.parse(localStorage.getItem(k)); }catch(e){} });
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "protocolo-it-registros-" + iso(new Date()) + ".json";
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });
  $("#bkImport").addEventListener("change", e => {
    const f = e.target.files && e.target.files[0]; if(!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try{
        const d = JSON.parse(rd.result);
        if(!d || ["protocolo-inteligencia-territorial", "protocolo-atuacao-it"].indexOf(d.app) < 0 || typeof d.registros !== "object") throw new Error("formato");
        keys().forEach(k => { try{ localStorage.removeItem(k); }catch(_){} });
        Object.keys(d.registros).forEach(k => { if(k.indexOf("itp2:") === 0) S.set(k.slice(5), d.registros[k]); });
        location.reload();
      }catch(err){ $("#bkImport").value = ""; flash($("#bkExport"), "Arquivo inválido"); }
    };
    rd.readAsText(f);
  });
  let armed = false;
  $("#bkClear").addEventListener("click", e => {
    if(!armed){ armed = true; e.target.textContent = "Clique novamente para confirmar"; setTimeout(() => { armed = false; e.target.textContent = "Apagar todos os registros"; }, 4000); return; }
    keys().forEach(k => { try{ localStorage.removeItem(k); }catch(_){} }); location.reload();
  });
}

/* ---------- fundamentos (Partes I a III do Protocolo de Inteligência Territorial) ---------- */
const FUND = [
  {id:"tradicoes", t:"Três tradições", h:() =>
    '<div class="prose"><p>O conceito de Inteligência Territorial nasce da confluência de três tradições que partilham uma compreensão comum: <b>o território não é um dado neutro da realidade, mas uma produção social ativa</b> que concentra e distribui poder, saúde e possibilidades de vida. Ele não é objeto de estudo externo à PICAPS, mas sujeito ativo da produção de conhecimento.</p></div>' +
    '<details class="acc" open><summary><span><span class="tagx">1</span>Geografia crítica</span></summary><div class="accb"><div class="prose"><p>Em Milton Santos, o território é <b>espaço usado</b>: a apropriação social, cultural, econômica e política que os coletivos humanos fazem dele. Para Raffestin, territorializar é um ato de poder-saber. Lefebvre acrescenta a tríade do espaço percebido, concebido e vivido. A IT situa-se na tensão entre o que os sistemas oficiais <b>concebem</b> sobre o território e o que os moradores <b>percebem e vivem</b> nele, que é também a tensão entre a vigilância tradicional e a popular.</p></div>' + fig("geo", "Geografia crítica e Inteligência Territorial") + "</div></details>" +
    '<details class="acc"><summary><span><span class="tagx">2</span>Pesquisa-ação participativa e ciência cidadã</span></summary><div class="accb"><div class="prose"><p>Diferentemente da inteligência coletiva, que descreve propriedades emergentes de sistemas conectados e tende à homogeneização dos saberes, a <b>inteligência cooperativa</b> que funda a PICAPS é prática deliberada, estruturada e governada de produção conjunta de conhecimento entre sujeitos que mantêm perspectivas distintas. A ciência pós-normal requer uma comunidade estendida de pares; a ecologia de saberes exige que a cooperação preserve a distinção entre os saberes, sem que um domestique o outro.</p></div>' + fig("coop", "Inteligência cooperativa e território") + "</div></details>" +
    '<details class="acc"><summary><span><span class="tagx">3</span>Tecnologias sociais e epidemiologia crítica</span></summary><div class="accb"><div class="prose"><p>Tecnologia social é o produto, a técnica ou a metodologia reaplicável desenvolvida na interação com a comunidade e voltada à transformação social. A epidemiologia crítica latino-americana mostra que o adoecimento é processo histórico-social inscrito nos territórios. <b>Se as condições de vida determinam a saúde, as ferramentas para conhecê-las e transformá-las precisam ser desenvolvidas de dentro dos territórios.</b></p></div>' + fig("tec", "Tecnologias sociais e epidemiologia crítica") + "</div></details>"},
  {id:"definicao", t:"Definição e dimensões", h:() =>
    '<div class="defbox"><span class="eyebrow">Inteligência Territorial</span><p>Capacidade cooperativa de um território, constituída na articulação deliberada e estruturada entre saberes técnico-científicos e saberes nativos, sob governança comunitária, de <b>produzir, processar, interpretar, planejar e agir</b> sobre o conhecimento relevante às suas condições de vida e saúde, com <b>soberania territorial</b> sobre os dados e os fins dessa produção.</p></div>' +
    '<div class="figrow">' + fig("def", "Definição de Inteligência Territorial e o que ela herda de cada tradição") + fig("naocoletiva", "A IT é inteligência cooperativa, mas não meramente coletiva") + "</div>" +
    '<div class="sheet stack"><h3>Quatro dimensões constitutivas</h3><p class="note">Elas dão forma ao Ciclo de Inteligência Territorial: o aprendizado reflexivo alimenta a produção cognitiva do ciclo seguinte, que alimenta a deliberação e a estratégia, e assim sucessivamente.</p><div class="tbl-wrap">' +
    tbl(["Dimensão","Pergunta-chave","O que envolve","Instrumentos na PICAPS"], [
      ["Cognitiva","O que está acontecendo aqui?","Produção de conhecimento territorial pelas duas vigilâncias: dados primários (vigilância popular, cartografia social) e secundários (sistemas oficiais)","DPT, dimensões 1 a 4; INS; cartografia social; Plataforma Ágora; sistemas de informação do SUS"],
      ["Deliberativa","O que priorizamos e por quê?","Interpretação coletiva; validação e contestação dos dados; priorização pela Matriz UIC; formulação do Plano Popular","Reuniões da SCS; MTEI; Painel de Vigilância Integrada"],
      ["Estratégica","Como queremos que seja e o que vamos fazer?","Cenários prospectivos; Plano Popular; planejamento estratégico situacional; exigência de resposta","DPT, dimensão 5; Três Horizontes; PES"],
      ["Reflexiva","O que aprendemos e como melhoramos?","Avaliação da articulação entre as vigilâncias; revisão das categorias de observação e do currículo","Relatório de Ciclo; revisão anual da cartografia social e do Plano Popular; Franquia Social Metodológica"]]) + "</div></div>"},
  {id:"vigilancias", t:"Duas vigilâncias", h:() =>
    '<div class="prose"><p>A IT não é uma versão sofisticada da vigilância epidemiológica tradicional, nem sua substituta. Ela organiza a cooperação entre a vigilância tradicional e a vigilância popular, que têm forças e limites complementares.</p></div>' +
    '<div class="sheet stack"><h3>Vigilância tradicional, popular e integrada territorial</h3><div class="tbl-wrap">' +
    tbl(["Dimensão","Vigilância tradicional","Vigilância popular","Vigilância integrada territorial"], [
      ["Quem observa","Profissionais e serviços do SUS, segundo normas nacionais","Moradores e pesquisadores populares, a partir da experiência do território","Os dois, em cooperação, na Sala de Cooperação Social"],
      ["O que observa","Agravos de notificação, óbitos, nascimentos, atendimentos, vetores","Condições de vida, riscos e eventos que não chegam aos serviços ou não têm código","Os dois fluxos sobre o mesmo mapa, com atenção ao que apenas um deles registra"],
      ["Categorias","Padronizadas e comparáveis (CID, fichas de notificação)","Do território, situadas e abertas a eventos não previstos","Traduzidas entre si pela MTEI, sem que uma subordine a outra"],
      ["Força","Comparabilidade, cobertura legal, séries históricas, obrigação de resposta","Oportunidade, granularidade, visibilidade do não registrado","Antecipação, correção mútua e exigibilidade"],
      ["Limite","Cega ao que não chega ao serviço; reativa; sub-registro desigual","Invisível às instituições sem canais e sem retorno; sujeita a sobrecarga","Depende de pactuação com os serviços e da sustentabilidade da participação"],
      ["Quem decide","Gestão e serviços","O território, sem poder formal sobre a resposta","O território delibera prioridades; serviços e gestão respondem, e a resposta é registrada"],
      ["Relação com a ação","Análise informa a gestão; a comunidade pode ser informada","Ação comunitária e reivindicação","Análise, deliberação e ação no mesmo espaço (SCS), com prazos e registro"]]) +
    '</div><p class="note">Fonte: elaborado com base em Teixeira, Paim e Vilasbôas (1998), Machado et al. (2024) e Oliveira et al. (2024).</p></div>' +
    '<div class="sheet stack"><h3>Preponderância do território: cinco sentidos operacionais</h3><p class="note">Preponderância não significa que o território decida sozinho nem que o conhecimento técnico seja dispensável.</p><div class="five">' +
    [["Agenda","A SCS define, a cada ciclo, o que as duas vigilâncias acompanham com prioridade."],["Validação","A SCS examina os dados oficiais e os populares e pode contestá-los; contestações são registradas."],["Interpretação","Nenhum dado, índice ou painel aciona ação por si só: aciona uma pergunta para a SCS."],["Exigibilidade","Encaminhamentos têm prazo e responsável; toda resposta, ou ausência dela, é registrada e devolvida."],["Devolução","O território conhece os resultados sobre si antes de qualquer outro destinatário."]].map(x => "<div><b>" + x[0] + "</b><span>" + x[1] + "</span></div>").join("") +
    '</div></div>' + fig("metodo", "Duas vigilâncias, um mapa, uma Sala que decide")},
  {id:"compromissos", t:"Compromissos", h:() =>
    '<div class="commit" id="fundCommit">' +
    [["Visibilização social","Os sistemas oficiais registram o que chega aos serviços e cabe em suas categorias. O domicílio não cadastrado, a rua que alaga fora do mapa de risco, a família pobre fora do Cadastro Único permanecem invisíveis e fora das decisões. A cartografia social torna esse conhecimento visível; o protocolo exige que ele seja verificado com os serviços e incorporado aos sistemas oficiais."],
     ["Empoderamento","A capacidade de participar preexiste a qualquer formação. A PICAPS oferece ferramentas que os moradores podem escolher mobilizar: registro, cartografia, leitura crítica de dados, conhecimento dos fluxos dos serviços. Empoderar não é preparar para operar o sistema, mas fortalecer a capacidade de questioná-lo, inclusive a própria PICAPS."],
     ["Governança participativa","Capacidade de um espaço coletivo de deliberar e de influenciar decisões que não controla diretamente. Nas SCS, ela se expressa na vigilância popular e na articulação do Plano Popular, e assume a forma de exigibilidade: prazos, registro das respostas e escalonamento quando não há resposta."]].map(c => "<div><b>" + c[0] + "</b><span>" + c[1] + "</span></div>").join("") + "</div>" +
    '<div class="prose"><h3>Compromisso com a transformação</h3><p>A PICAPS não inventa a Inteligência Territorial. Sistematiza, instrumentaliza e escala uma capacidade que as comunidades periféricas brasileiras historicamente exerceram: ler o próprio território, nomear suas vulnerabilidades e organizar respostas coletivas. O que a Plataforma oferece não é legitimidade, que preexiste a qualquer certificação. <b>É a possibilidade de que o conhecimento que os territórios já produzem se torne visível e disputável nas arenas onde as decisões sobre saúde são tomadas.</b></p></div>' +
    fig("papel", "O papel da PICAPS")},
  {id:"transversalidade", t:"Transversalidade", h:() =>
    '<div class="prose"><p>A transversalidade é uma diagonal que conecta elementos heterogêneos sem os subordinar nem os fundir. Na PICAPS, é a IT que a opera de forma ativa: <b>processa o que o Radar capta, orienta o que a Teleorientação forma, direciona o que a Inteligência Epidemiológica analisa e governa o que a Saúde Digital desenvolve.</b></p><p>Adicionar um quinto eixo seria metodologicamente equivocado: um eixo tem domínio próprio, objetivo específico e fronteira identificável. O domínio da IT é o cruzamento dos outros quatro; seu objetivo é a produção contínua de inteligência que orienta o sistema; sua fronteira é o sistema todo.</p></div>' +
    '<div class="figrow">' + fig("transv", "Inteligência Territorial como transversalidade") + fig("diagonal", "A IT na PICAPS: diagonal que conecta os quatro eixos") + "</div>" +
    '<div class="sheet stack"><h3>Mapa de integração da IT como eixo transversal</h3><div class="tbl-wrap">' +
    tbl(["Eixo","Função no sistema","Contribuição para a IT","O que a IT planeja e orienta no eixo"], [
      ["E1 · Radar de Territórios","Sensoriamento social: vigilância popular, cartografia social, alertas sentinela","A matéria-prima que os sistemas oficiais não veem","Define as categorias de alerta e as áreas prioritárias a partir da cartografia social e da agenda da SCS"],
      ["E2 · Teleorientação","Formação dos pesquisadores populares e das equipes, em educação popular","Agentes capazes de observar, registrar, interpretar e contestar","Define o currículo a partir das lacunas do ciclo; forma também as equipes de APS e de vigilância"],
      ["E3 · Inteligência Epidemiológica","Integração e análise dos dados oficiais e populares; INS e Painel","Rigor analítico: evidências defensáveis perante a gestão e a academia","Define as prioridades analíticas; valida os achados com o território antes de publicá-los"],
      ["E4 · Saúde Digital","Plataforma Ágora, painéis e interoperabilidade com os sistemas do SUS","Escala e memória: sem ela, a IT seria local, manual e não cumulativa","Delibera sobre escopo, uso e publicização dos dados; protege a soberania dos dados do território"]]) + "</div></div>" +
    fig("circular", "A circularidade constitutiva")},
  {id:"eixos", t:"Os quatro eixos", h:() =>
    fig("eixos", "A Inteligência Territorial atravessa os quatro eixos da PICAPS") +
    '<details class="acc" open><summary><span><span class="tagx">E1</span>Radar de Territórios</span></summary><div class="accb"><div class="prose"><p>Se a IT é a capacidade do território de conhecer a si mesmo, o Radar é o sistema sensorial que torna essa auto-observação possível. Opera com perspectivas situadas: são os moradores que produzem os dados, e essa situacionalidade é a vantagem epistêmica do Radar sobre os sistemas oficiais. Na articulação entre as vigilâncias, <b>o Radar é o fluxo popular</b> que o protocolo põe ao lado do fluxo tradicional.</p></div><div class="tbl-wrap">' +
    tbl(["Operação","Como a IT orienta o Radar","Como o Radar alimenta a IT"], [
      ["Categorias de alerta","Define, a partir da agenda da SCS e da cartografia social, quais categorias merecem acompanhamento prioritário em cada ciclo","Alertas sobre eventos não previstos forçam a ampliação do repertório de observação"],
      ["Georreferenciamento e cartografia","Organiza o mapa da cartografia social, por microárea, como base para alertas e notificações","A cartografia social revela riscos que os dados oficiais não captam e, verificada, corrige os mapas oficiais"],
      ["Qualificação da vigilância popular","Analisa a confirmação dos alertas (V3) e retroalimenta a formação","Alertas não confirmados distinguem subnotificação real de alerta impreciso"],
      ["Ativação da resposta","Delibera quais alertas acionam resposta imediata e quais alimentam o diagnóstico","Alertas críticos sem resposta são evidência de ruptura e insumo para advocacy"]]) + "</div></div></details>" +
    '<details class="acc"><summary><span><span class="tagx">E2</span>Teleorientação</span></summary><div class="accb"><div class="prose"><p>Toda inteligência cooperativa pressupõe paridade epistêmica. A Teleorientação só alimenta a IT de forma sustentável se operar na lógica da educação popular. A articulação entre as vigilâncias acrescenta uma tarefa: <b>formar também as equipes de APS e de Vigilância em Saúde</b> para receber, traduzir e responder aos registros da vigilância popular; sem isso, o fluxo popular chega aos serviços sem interlocutor.</p></div><div class="tbl-wrap">' +
    tbl(["Operação","Como a IT orienta a Teleorientação","Como a Teleorientação alimenta a IT"], [
      ["Currículo dos pesquisadores populares","Identifica, a partir do PVI, das atas e do Relatório de Ciclo, as capacidades frágeis","Pesquisadores com leitura crítica de dados, cartografia e deliberação"],
      ["Formação das equipes de APS e de vigilância","Define o que as equipes precisam para receber e responder aos alertas e às demandas da SCS","Profissionais que reconhecem a vigilância popular como fonte legítima"],
      ["Uso da Plataforma Ágora","Define as funcionalidades a dominar em cada fase","O retorno sobre dificuldades orienta o desenvolvimento da Plataforma"],
      ["Franquia Social Metodológica","Identifica territórios com IT consolidada e pesquisadores com perfil de facilitação","Facilitadores levam a IT a novos territórios sem expansão centralizada"]]) + "</div></div></details>" +
    '<details class="acc"><summary><span><span class="tagx">E3</span>Inteligência Epidemiológica</span></summary><div class="accb"><div class="prose"><p>É nesse eixo que os dois fluxos se cruzam tecnicamente. A cada mês, o técnico de dados identifica <b>convergências</b>, <b>antecipações</b>, <b>divergências</b> e <b>invisibilidades</b>: o insumo central da reunião deliberativa. A validação territorial é parte constitutiva do rigor que a IT reivindica. O produto mais imediato para os serviços é a <b>Atenção Primária de Precisão Territorial (APPT)</b>: a adaptação trimestral das prioridades das equipes com base nas deliberações da SCS, acompanhada no Painel pelo V8.</p></div><div class="tbl-wrap">' +
    tbl(["Operação","Como a IT orienta","Como o eixo alimenta a IT"], [
      ["Cruzamento das duas vigilâncias","Define, com a SCS, os agravos prioritários e as perguntas do cruzamento","Convergências, antecipações, divergências e invisibilidades a cada mês"],
      ["INS como base de leitura entre territórios","Delibera sobre o uso do índice na agenda e na reivindicação de recursos","Medida comparável, auditável e com incerteza declarada"],
      ["Verificação territorial","Conduz, com a SCS, a verificação das invisibilidades apontadas pela cartografia social","Incorpora as correções aos sistemas oficiais, com registro de revisão de medida"],
      ["Tradução para gestores e comunidade","Define as linguagens: relatório técnico, artigo, oficina de devolução","A devolução gera dados sobre como o território interpreta e contesta"]]) + "</div></div></details>" +
    '<details class="acc"><summary><span><span class="tagx">E4</span>Saúde Digital</span></summary><div class="accb"><div class="prose"><p>A Plataforma Ágora, os painéis e a interoperabilidade são parte do que a IT é: permitem reunir os dois fluxos no mesmo mapa. A tensão é entre digitalização emancipatória e extração de dados. A resposta da PICAPS são regras ancoradas na SCS: <b>nenhum uso ou publicação sem deliberação do território</b>; finalidade definida antes da coleta; devolução antes da publicação; proteção de dados pessoais nos termos da LGPD; transparência dos cálculos. O cruzamento nominal é feito no ambiente seguro da secretaria de saúde; à Ágora chegam apenas contagens agregadas, com supressão de contagens inferiores a cinco.</p></div><div class="tbl-wrap">' +
    tbl(["Operação","Como a IT governa","Como a Saúde Digital fortalece a IT"], [
      ["Governança dos dados","A SCS delibera sobre escopo, uso e publicização; nada é publicado sem essa deliberação","A Ágora armazena, integra e exibe os dados que alimentam o ciclo"],
      ["Interoperabilidade com o SUS","Define quais dados externos são integrados e com que finalidade","Os alertas e os registros oficiais no mesmo mapa, em contagens agregadas"],
      ["Painel como dispositivo deliberativo","Desenho legível pelos pesquisadores populares, não apenas pelos técnicos","A SCS delibera sobre dados atualizados até a véspera da reunião"],
      ["Registro da resposta","Exige que toda resposta, e toda ausência de resposta, fique registrada","A série de respostas e silêncios sustenta a exigibilidade e o advocacy"]]) + "</div></div></details>"}
];
let fundSel = S.get("fund", 0);
function renderFund(){
  if(fundSel >= FUND.length) fundSel = 0;
  $("#fundPills").innerHTML = FUND.map((f, i) => '<button type="button" role="tab" aria-selected="' + (i === fundSel) + '" data-f="' + i + '"><span class="n">' + (i + 1) + "</span>" + f.t + "</button>").join("");
  $("#fundBody").innerHTML = '<div class="fund">' + FUND[fundSel].h() + '<div class="row" style="justify-content:space-between;margin-top:6px">' +
    (fundSel > 0 ? '<button class="btn ghost" type="button" data-fstep="-1">← ' + FUND[fundSel - 1].t + "</button>" : "<span></span>") +
    (fundSel < FUND.length - 1 ? '<button class="btn primary" type="button" data-fstep="1">' + FUND[fundSel + 1].t + " →</button>" : '<a class="btn primary" href="#metodo" data-go="metodo">Ir ao método →</a>') + "</div></div>";
}
function initFund(){
  renderFund();
  $("#fundPills").addEventListener("click", e => { const b = e.target.closest("[data-f]"); if(b){ fundSel = +b.dataset.f; S.set("fund", fundSel); renderFund(); } });
  $("#fundBody").addEventListener("click", e => { const b = e.target.closest("[data-fstep]"); if(b){ fundSel += +b.dataset.fstep; S.set("fund", fundSel); renderFund(); $("#v-fundamentos").scrollIntoView({behavior:"smooth"}); } });
}

/* ---------- quadros de consulta ---------- */
const RITMOS = [
  ["Contínuo","Registro de alertas e da cartografia; fluxo de 72 horas","F1, F4"],
  ["Semanal","Revisão dos alertas e destaque dos críticos; carga dos registros oficiais; conferência de prazos","F1, F4"],
  ["Mensal","Cruzamento dos fluxos e PVI; reunião deliberativa; encaminhamentos e incorporações","F2, F3, F4"],
  ["Trimestral","Prioridades do ciclo e programação das equipes (APPT); IRS; Relatório de Ciclo; Dimensões 2 e 3 dos DPT","F3, F4, F5"],
  ["Semestral","Seminário de rede; Dimensão 4 dos DPT","F2, F5"],
  ["Anual","INS; revisão do Plano Popular, da cartografia social e do currículo; relatório técnico após devolução","F2, F5"]
];
const EXS = [
  ["Risco do lugar e das pessoas","Dano mais provável, no lugar e nas pessoas","APS, vigilância e Defesa Civil, em conjunto","Prioridade do ciclo; busca ativa e advocacy de infraestrutura"],
  ["Risco do lugar","Área de risco, saneamento precário, criadouros","Defesa Civil, vigilância ambiental, saneamento","Intervenção sobre o lugar (drenagem, contenção de encosta, saneamento); advocacy"],
  ["Risco das pessoas","Crianças pequenas, idosos, famílias sem renda ou fora dos cadastros","Equipe de APS e CRAS","Proteção às pessoas: busca ativa de crianças de 0 a 4 anos e idosos de 75 anos ou mais; Cadastro Único"],
  ["Nenhum risco mapeado","Nada registrado na cartografia nem nos sistemas","—","Acompanhar e verificar se há invisibilidades ainda não registradas no mapa"]
];
const PARAMS = [
  ["Metas do PVI (V3 a V9)","Mínima e recomendada conforme o Painel","SCS e gestão"],
  ["Agravos prioritários e categorias de alerta","Definidos pelo Plano Popular","SCS, com APS e vigilância"],
  ["Janela de antecipação (V4)","30 dias, mesma microárea, categoria compatível","Vigilância em Saúde e CTIS"],
  ["Prazo de resposta a alertas críticos","72 horas a partir da hora zero","SCS, UBS e vigilância, por escrito"],
  ["Entrega do relatório de dados","Antes da reunião, em linguagem legível","Dupla e técnico de dados"],
  ["Dia fixo da reunião e semana-tipo","Definidos por cada SCS","SCS"],
  ["Segmentos comunitários acompanhados em V9","Os do mapa sociométrico da Etapa 1","SCS"]
];
function renderTables(){
  $("#ritmos").outerHTML = tbl(["Ritmo","O que acontece","Fase"], RITMOS);
  $("#exsTbl").outerHTML = tbl(["Situação mapeada","O que indica","Quem age primeiro","Tipo de ação a discutir na SCS"], EXS);
  $("#regTbl").outerHTML = tbl(["Registro","Prazo","O que inclui","Aciona","Indicador do PVI"], [
    ["Resposta imediata","48 a 72 horas","Alertas críticos","UBS de referência e vigilância em saúde, diretamente","V6"],
    ["Incorporação","Até a reunião seguinte","Invisibilidades verificadas","Serviço responsável pelo registro oficial (módulo Visibilização)","V5"],
    ["Ação planejada","30 a 90 dias","Itens do Plano Popular e prioridades do ciclo","Responsáveis da ata; programação das equipes (APPT)","V7, V8"],
    ["Advocacy","90 a 180 dias","Encaminhamentos que exigem decisão institucional","Gestão pública, pelos Níveis 2 e 3, com INS, cartografia social e histórico de respostas","V7"]]);
  $("#paramTbl").outerHTML = tbl(["Parâmetro","Proposta do protocolo","Quem pactua"], PARAMS);
}

/* ---------- início ---------- */
function renderHome(){
  $("#homeCommit").innerHTML = COMMIT.map(c => "<div><b>" + c[0] + "</b><span>" + c[1] + "</span></div>").join("");
}

/* ---------- documentos ---------- */
const DOCS = [
  {k:"Protocolo", t:"Protocolo de Inteligência Territorial", d:"Fundamentos teórico-metodológicos, transversalidade, interfaces com os quatro eixos da PICAPS e protocolo de atuação.", p:53, f:"Protocolo_de_Inteligencia_Territorial_v2", mb:[4.5, 2.6]},
  {k:"Guia operacional", t:"Protocolo Operacional da Inteligência Territorial", d:"Guia metodológico de atuação: procedimentos, roteiros, listas de verificação e parâmetros. É a base desta aplicação.", p:31, f:"Protocolo_Operacional_da_Inteligencia_Territorial_v2", mb:[2.1, 1.4]},
  {k:"Índice · projeto técnico", t:"Índice de Necessidade de Saúde (INS)", d:"Recorte Municipal (INS-M) e Distrital (INS-DF): discussão teórico-metodológica, cesta de indicadores e metodologia de cálculo.", p:41, f:"Projeto_INS_v2", mb:[1.5, 1.0]}
];
const AUTH = "Wagner de Jesus Martins, Fernanda Machiner, Maria Eduarda Silva, Jeferson Martins de Castro";
function renderDocs(){
  $("#docs").innerHTML = DOCS.map(d => '<article class="doc"><div class="dh"><span>' + d.k + "</span><h3>" + d.t + '</h3></div><div class="db"><p>' + d.d + '</p><p class="meta2">' + AUTH + " · versão 2.0 · " + d.p + ' páginas</p></div><div class="df"><a class="btn primary" href="docs/' + d.f + '.pdf" target="_blank" rel="noopener">PDF · ' + String(d.mb[0]).replace(".", ",") + ' MB</a><a class="btn" href="docs/' + d.f + '.docx" download>Word · ' + String(d.mb[1]).replace(".", ",") + " MB</a></div></article>").join("");
}

/* ---------- início ---------- */
initNav(); initFigs();
renderHome(); renderTables(); initFund(); renderDocs();
renderMetodo();
$("#whichOpts").addEventListener("click", e => { const b = e.target.closest(".opt"); if(b){ whichSel = +b.dataset.i; renderWhich(); } });
$("#whichOut").addEventListener("click", e => { const b = e.target.closest("[data-ans]"); if(b){ whichAns[whichSel] = b.dataset.ans; S.set("which", whichAns); renderWhich(); } });
initCiclo(); initLeitor(); initAlerts(); initTriagem(); initVis(); initMeeting(); initPv(); initAgenda(); initActors(); initGov(); initImpl(); initRiscos(); initBackup();
show((location.hash || "").slice(1) || "inicio", {keepScroll:true});
