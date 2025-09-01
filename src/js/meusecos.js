// Todos os dados definidos diretamente aqui (sem fetch).
// Ajuste, adicione ou remova perfis conforme necessário.
const DATA = {
  perfilBase: {
    id: "meu-perfil",
    nome: "Jéssica Tavares",
    ocupacao: "Psicóloga",
    especialidade: "Educação infantil",
    interesses: [
      "cinema autoral",
      "música",
      "educação infantil",
      "literatura",
      "séries de comédia"
    ],
    postsFavoritos: [
      "maes-devoradoras-horror-arquetipico",
      "infantilizacao-adultizacao",
      "cicatriz-da-infancia",
      "quando-amar-e-o-que-importa",
      "amor-que-nao-se-cura",
      "monstro-no-espelho",
      "tempo-como-oportunidade",
      "pais-filhos-legado-espelho"
    ]
  },
  ecos: [
    {
      id: "eco1",
      nome: "Bruna Castro",
      ocupacao: "Psicóloga",
      especialidade: "Psicopedagogia",
      interesses: ["educação infantil", "literatura", "podcasts", "autoconhecimento"],
      postsFavoritos: ["tempo-como-oportunidade", "cicatriz-da-infancia", "monstro-no-espelho"],
      bio: "Atuação em dificuldades de aprendizagem e desenvolvimento socioemocional.",
      foto: "src/images/brunafake-img.png",
      link: "#"
    },
    {
      id: "eco2",
      nome: "Carlos Mendes",
      ocupacao: "Professor",
      especialidade: "Educação infantil",
      interesses: ["educação infantil", "cinema autoral", "teatro", "música"],
      postsFavoritos: ["pais-filhos-legado-espelho", "tempo-como-oportunidade"],
      bio: "Professor e pesquisador em metodologias lúdicas.",
      foto: "src/images/carlosfake-img.png",
      link: "#"
    },
    {
      id: "eco3",
      nome: "Daniela Rocha",
      ocupacao: "Psicanalista",
      especialidade: "Adolescência",
      interesses: ["literatura", "cinema autoral", "séries de drama", "arte"],
      postsFavoritos: ["maes-devoradoras-horror-arquetipico", "amor-que-nao-se-cura"],
      bio: "Clínica com foco em processos de identidade.",
      foto: "src/images/danielafake-img.png",
      link: "#"
    },
    {
      id: "eco4",
      nome: "Eduardo Silva",
      ocupacao: "Psicólogo",
      especialidade: "Terapia familiar",
      interesses: ["família", "música", "séries de comédia", "cinema autoral"],
      postsFavoritos: ["quando-amar-e-o-que-importa", "pais-filhos-legado-espelho"],
      bio: "Mediação de conflitos e vínculos familiares.",
      foto: "src/images/eduardofake-img.png",
      link: "#"
    },
    {
      id: "eco5",
      nome: "Fernanda Souza",
      ocupacao: "Psicóloga",
      especialidade: "Educação infantil",
      interesses: ["educação infantil", "música", "literatura", "tecnologia educacional"],
      postsFavoritos: ["cicatriz-da-infancia", "infantilizacao-adultizacao", "tempo-como-oportunidade"],
      bio: "Apoio socioemocional em contextos escolares.",
      foto: "src/images/fernandafake-img.png",
      link: "#"
    },
    {
      id: "eco6",
      nome: "Gustavo Lima",
      ocupacao: "Terapeuta ocup.",
      especialidade: "Integ. sensorial",
      interesses: ["jogos educativos", "música", "educação infantil"],
      postsFavoritos: ["tempo-como-oportunidade"],
      bio: "Estimulação de desenvolvimento motor e cognitivo.",
      foto: "src/images/gustavofake-img.png",
      link: "#"
    },
    {
      id: "eco7",
      nome: "Helena Duarte",
      ocupacao: "Psicóloga",
      especialidade: "Psicologia infantil",
      interesses: ["educação infantil", "contação de histórias", "literatura", "arte"],
      postsFavoritos: ["maes-devoradoras-horror-arquetipico", "cicatriz-da-infancia"],
      bio: "Escuta clínica de crianças e famílias.",
      foto: "src/images/helenafake-img.png",
      link: "#"
    },
    {
      id: "eco8",
      nome: "Igor Pires",
      ocupacao: "Neuropsicólogo",
      especialidade: "Avaliação cognitiva",
      interesses: ["pesquisa", "música", "séries de comédia"],
      postsFavoritos: ["monstro-no-espelho"],
      bio: "Foco em funções executivas e desenvolvimento.",
      foto: "src/images/igorfake-img.png",
      link: "#"
    }
  ]
};

// Pesos dos critérios
const WEIGHTS = {
  ocupacao: 0.25,
  especialidade: 0.25,
  interesses: 0.25,
  posts: 0.25
};

const state = {
  ecosRaw: [],
  ecosComScore: [],
  ordem: 'afinidade',
  filtros: {
    busca: '',
    ocupacao: '',
    especialidade: '',
    minAfinidade: 0
  },
  perfilBase: null
};

// -------- Utilidades --------
function normalizaTexto(t) { return (t || '').toLowerCase().trim(); }

function jaccard(arrA = [], arrB = []) {
  const setA = new Set(arrA.map(normalizaTexto));
  const setB = new Set(arrB.map(normalizaTexto));
  if (setA.size === 0 && setB.size === 0) return 0;
  let inter = 0;
  for (const v of setA) if (setB.has(v)) inter++;
  const uniao = setA.size + setB.size - inter;
  return uniao === 0 ? 0 : inter / uniao;
}

function calculaAfinidade(perfilBase, outro) {
  const sameOcupacao = normalizaTexto(perfilBase.ocupacao) === normalizaTexto(outro.ocupacao) ? 1 : 0;
  const sameEspecialidade = normalizaTexto(perfilBase.especialidade) === normalizaTexto(outro.especialidade) ? 1 : 0;
  const interessesScore = jaccard(perfilBase.interesses, outro.interesses);
  const postsScore = jaccard(perfilBase.postsFavoritos, outro.postsFavoritos);
  const score =
    WEIGHTS.ocupacao * sameOcupacao +
    WEIGHTS.especialidade * sameEspecialidade +
    WEIGHTS.interesses * interessesScore +
    WEIGHTS.posts * postsScore;
  return {
    score: score * 100,
    breakdown: { ocupacao: sameOcupacao, especialidade: sameEspecialidade, interesses: interessesScore, posts: postsScore }
  };
}

// -------- Renderização --------
function limpaGrid() { document.getElementById('ecosGrid').innerHTML = ''; }
function formataPercent(v) { return v.toFixed(0) + '%'; }
function criaChip(texto) {
  const span = document.createElement('span');
  span.className = 'chip';
  span.textContent = texto;
  return span;
}

function renderCards(lista) {
  const grid = document.getElementById('ecosGrid');
  limpaGrid();
  if (!lista.length) {
    document.getElementById('estadoVazio').hidden = false;
    return;
  }
  document.getElementById('estadoVazio').hidden = true;

  const tpl = document.getElementById('tplCard');
  let corIndex = 0;

  lista.forEach(item => {
    corIndex = (corIndex % 4) + 1;
    const nó = tpl.content.cloneNode(true);
    const card = nó.querySelector('.eco-card');
    card.dataset.color = String(corIndex);

    const img = card.querySelector('img.foto');
    img.src = item.foto || 'imgs/perfis/placeholder.jpg';
    img.alt = `Foto de ${item.nome}`;

    card.querySelector('h2').textContent = item.nome;
    card.querySelector('.ocupacao').textContent = item.ocupacao;
    card.querySelector('.especialidade').textContent = item.especialidade;

    const chipsBox = card.querySelector('.interesses-chips');
    (item.interesses || []).slice(0, 6).forEach(i => chipsBox.appendChild(criaChip(i)));

    const barSpan = card.querySelector('.afinidade-bar span');
    requestAnimationFrame(() => { barSpan.style.width = item.afinidade.score.toFixed(2) + '%'; });

    card.querySelector('.afinidade-score').textContent =
      'Afinidade: ' + formataPercent(item.afinidade.score);

    card.querySelector('.secao-interesses').innerHTML =
      '<strong>Interesses:</strong> ' + (item.interesses || []).join(', ');

    card.querySelector('.secao-posts').innerHTML =
      '<strong>Posts fav.:</strong> ' + (item.postsFavoritos || []).slice(0, 5).join(', ');

    const linkPerfil = card.querySelector('.btn-perfil');
    linkPerfil.href = item.link || '#';

    grid.appendChild(card);
  });
}

function aplicaOrdenacao(lista) {
  switch (state.ordem) {
    case 'afinidade':
      return [...lista].sort((a, b) => b.afinidade.score - a.afinidade.score);
    case 'nome':
      return [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    case 'ocupacao':
      return [...lista].sort((a, b) =>
        a.ocupacao.localeCompare(b.ocupacao, 'pt-BR') ||
        b.afinidade.score - a.afinidade.score
      );
    default:
      return lista;
  }
}

function passaFiltros(item) {
  const { busca, ocupacao, especialidade, minAfinidade } = state.filtros;
  if (minAfinidade && item.afinidade.score < minAfinidade) return false;
  if (ocupacao && normalizaTexto(item.ocupacao) !== normalizaTexto(ocupacao)) return false;
  if (especialidade && normalizaTexto(item.especialidade) !== normalizaTexto(especialidade)) return false;

  if (busca) {
    const b = normalizaTexto(busca);
    const campos = [
      item.nome,
      item.ocupacao,
      item.especialidade,
      ...(item.interesses || []),
      ...(item.postsFavoritos || [])
    ].map(normalizaTexto).join(' ');
    if (!campos.includes(b)) return false;
  }
  return true;
}

function atualiza() {
  const filtrados = state.ecosComScore.filter(passaFiltros);
  const ordenados = aplicaOrdenacao(filtrados);
  renderCards(ordenados);
}

// -------- Filtros / Eventos --------
function populaSelects() {
  const ocupacaoSelect = document.getElementById('filtroOcupacao');
  const especialidadeSelect = document.getElementById('filtroEspecialidade');

  const ocupacoes = [...new Set(state.ecosRaw.map(e => e.ocupacao).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const especialidades = [...new Set(state.ecosRaw.map(e => e.especialidade).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

  ocupacoes.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o; opt.textContent = o;
    ocupacaoSelect.appendChild(opt);
  });

  especialidades.forEach(es => {
    const opt = document.createElement('option');
    opt.value = es; opt.textContent = es;
    especialidadeSelect.appendChild(opt);
  });
}

function adicionaEventos() {
  document.getElementById('busca').addEventListener('input', e => {
    state.filtros.busca = e.target.value;
    atualiza();
  });
  document.getElementById('filtroOcupacao').addEventListener('change', e => {
    state.filtros.ocupacao = e.target.value;
    atualiza();
  });
  document.getElementById('filtroEspecialidade').addEventListener('change', e => {
    state.filtros.especialidade = e.target.value;
    atualiza();
  });

  // Troca: input de number para range
  const minAfinidadeSlider = document.getElementById('minAfinidade');
  const minAfinidadeValue = document.getElementById('minAfinidade-value');
  minAfinidadeSlider.addEventListener('input', e => {
    let val = Number(e.target.value) || 0;
    // Garante sempre múltiplo de 5 (se alguém manipular manualmente)
    val = Math.round(val / 5) * 5;
    e.target.value = val;
    minAfinidadeValue.textContent = val + '%';
    state.filtros.minAfinidade = val;
    atualiza();
  });
  // Inicializa valor
  minAfinidadeValue.textContent = minAfinidadeSlider.value + '%';

  document.getElementById('btnLimpar').addEventListener('click', () => {
    state.filtros = { busca: '', ocupacao: '', especialidade: '', minAfinidade: 0 };
    document.getElementById('busca').value = '';
    document.getElementById('filtroOcupacao').value = '';
    document.getElementById('filtroEspecialidade').value = '';
    document.getElementById('minAfinidade').value = 0;
    document.getElementById('minAfinidade-value').textContent = '0%';
    atualiza();
  });
  document.querySelectorAll('.opcoes-ordenacao button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.opcoes-ordenacao button').forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      state.ordem = btn.dataset.ordem;
      atualiza();
    });
  });
}

// -------- Inicialização --------
function inicializa() {
  state.perfilBase = DATA.perfilBase;
  state.ecosRaw = DATA.ecos;
  state.ecosComScore = state.ecosRaw.map(e => ({
    ...e,
    afinidade: calculaAfinidade(state.perfilBase, e)
  }));
  populaSelects();
  atualiza();
}

document.addEventListener('DOMContentLoaded', () => {
  adicionaEventos();
  inicializa();
});
