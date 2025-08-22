let postsGlobais = [];
let ultimosFiltrados = [];
let pesquisaCurrentPage = 0;
const pesquisaPostsPerPage = 3;

// Render posts no carrossel
function renderPostsPesquisa(posts, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  posts.forEach(post => {
    let midia = '';
    if (post.imagem) {
      midia = `<img src="${post.imagem}" alt="${post.titulo}">`;
    } else if (post.video) {
      midia = `
        <div class="video-wrapper" style="position:relative; display:inline-block;">
          <video 
            loop 
            muted 
            playsinline 
            preload="none" 
            data-src="${post.video}" 
            poster="${post.poster || ''}" 
            style="width:100%; display:block; cursor:pointer;"
            tabindex="0"
          ></video>
          <div class="video-overlay">
            ▶ reproduzir vídeo
          </div>
        </div>
      `;
    }
    container.innerHTML += `
      <article class="post">
        <div class="post-content">
          <h2>${post.titulo}</h2>
          <h4>${post.data}</h4>
          ${midia}
          ${post.conteudo.map(par => `<p>${par}</p>`).join('')}
        </div>
        <div class="post-footer">
          <div class="hashtags">
            ${post.hashtags.map(h => `<span>#${h}</span>`).join(' ')}
          </div>
          <button class="read-more-btn" aria-label="Expandir ou recolher">
            <span class="arrow-lines">
              <span class="aline"></span>
              <span class="aline"></span>
              <span class="aline"></span>
            </span>
          </button>
        </div>
      </article>
    `;
  });

  inicializaLeiaMaisPesquisa();
  if (posts.length === 0) {
    container.innerHTML = `<p style="padding: 32px;text-align:center;">Nenhum post encontrado.</p>`;
  }
}

// Atualiza carrossel conforme página
function updatePesquisaCarousel() {
  const track = document.getElementById('posts-container');
  const posts = Array.from(track.children);
  const prevBtn = document.getElementById('prevPesquisaBtn');
  const nextBtn = document.getElementById('nextPesquisaBtn');
  const totalPages = Math.ceil(posts.length / pesquisaPostsPerPage);

  // Só mostra botões se houver mais de uma página de posts
  if (ultimosFiltrados.length === 0 || posts.length <= pesquisaPostsPerPage) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  } else {
    prevBtn.style.display = (pesquisaCurrentPage > 0) ? 'flex' : 'none';
    nextBtn.style.display = (pesquisaCurrentPage < totalPages - 1) ? 'flex' : 'none';
  }

  if (window.innerWidth <= 900) {
    track.style.transform = 'none';
    posts.forEach(p => p.style.display = '');
    return;
  }

  // Exibir posts da página atual
  posts.forEach((post, i) => {
    const start = pesquisaCurrentPage * pesquisaPostsPerPage;
    const end = start + pesquisaPostsPerPage;
    post.style.display = (i >= start && i < end) ? '' : 'none';
  });
}

// Navegação do carrossel
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('prevPesquisaBtn').onclick = () => {
    if (pesquisaCurrentPage > 0) {
      recolherTodosPostsPesquisa();
      pesquisaCurrentPage--;
      updatePesquisaCarousel();
    }
  };
  document.getElementById('nextPesquisaBtn').onclick = () => {
    const track = document.getElementById('posts-container');
    const posts = Array.from(track.children);
    const totalPages = Math.ceil(posts.length / pesquisaPostsPerPage);
    if (pesquisaCurrentPage < totalPages - 1) {
      recolherTodosPostsPesquisa();
      pesquisaCurrentPage++;
      updatePesquisaCarousel();
    }
  };
  // Detectar hashtag pela URL
  const params = new URLSearchParams(window.location.search);
  const hashtagUrl = params.get('hashtag');
  if (hashtagUrl) {
    document.getElementById('pesquisaTipo').value = 'hashtag';
    // Atualiza opções do select, depois seleciona e dispara o filtro
    atualizaOpcoes();
    // timeout para garantir que o select foi preenchido (pode ser melhorado para callback)
    setTimeout(() => {
      document.getElementById('pesquisaOpcoes').value = hashtagUrl;
      filtraPostsPesquisa();
    }, 100);
  }
});

// Leia mais
function inicializaLeiaMaisPesquisa() {
  document.querySelectorAll('.read-more-btn').forEach(button => {
    button.removeEventListener('click', leiaMaisHandlerPesquisa);
    button.addEventListener('click', leiaMaisHandlerPesquisa);
  });
}
function leiaMaisHandlerPesquisa() {
  const post = this.closest('.post');
  const content = post.querySelector('.post-content');
  const isExpanded = content.classList.toggle('expanded');
  this.classList.toggle('expanded', isExpanded);
  if (isExpanded) {
    post.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
function recolherTodosPostsPesquisa() {
  document.querySelectorAll('.post-content.expanded').forEach(content => {
    content.classList.remove('expanded');
    const btn = content.parentElement.querySelector('.read-more-btn');
    if (btn) btn.classList.remove('expanded');
  });
}

// Filtro: só mostra posts depois de selecionar filtro
function filtraPostsPesquisa() {
  const tipo = document.getElementById('pesquisaTipo').value;
  const valor = document.getElementById('pesquisaOpcoes').value;
  if (!valor) {
    document.getElementById('posts-lista').style.display = 'none';
    ultimosFiltrados = [];
    pesquisaCurrentPage = 0;
    updatePesquisaCarousel();
    return;
  }
  let filtrados = postsGlobais.filter(post => {
    if (tipo === 'titulo') return post.titulo === valor;
    if (tipo === 'data') return post.data === valor;
    if (tipo === 'hashtag') return post.hashtags.map(h => h.toLowerCase()).includes(valor.replace(/^#/, '').toLowerCase());
    return false;
  });
  document.getElementById('posts-lista').style.display = '';
  ultimosFiltrados = filtrados;
  pesquisaCurrentPage = 0;
  renderPostsPesquisa(filtrados, "posts-container");
  updatePesquisaCarousel();
}

// Preenche opções de filtro
function atualizaOpcoes() {
  const tipo = document.getElementById('pesquisaTipo').value;
  const select = document.getElementById('pesquisaOpcoes');
  select.innerHTML = "";
  const defaultOption = document.createElement('option');
  defaultOption.value = "";
  defaultOption.textContent = "Selecione...";
  select.appendChild(defaultOption);

 let opcoes = [];
  if (tipo === 'titulo') {
    opcoes = [...new Set(postsGlobais.map(p => p.titulo))];
    opcoes.sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));
  } else if (tipo === 'data') {
    opcoes = [...new Set(postsGlobais.map(p => p.data))];
    // Ordenação correta de datas no formato dd/mm/yyyy
    opcoes.sort((a, b) => {
      // Converte para yyyy-mm-dd para comparação
      const [da, ma, ya] = a.split('/');
      const [db, mb, yb] = b.split('/');
      const strA = `${ya.padStart(4, '0')}-${ma.padStart(2, '0')}-${da.padStart(2, '0')}`;
      const strB = `${yb.padStart(4, '0')}-${mb.padStart(2, '0')}-${db.padStart(2, '0')}`;
      if (strA < strB) return 1;
      if (strA > strB) return -1;
      return 0;
    });
  } else if (tipo === 'hashtag') {
    opcoes = [...new Set(postsGlobais.flatMap(p => p.hashtags))];
    opcoes.sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));
  }
  opcoes.forEach(opcao => {
    const option = document.createElement('option');
    option.value = opcao;
    option.textContent = tipo === 'hashtag' ? `#${opcao}` : opcao;
    select.appendChild(option);
  });

  // Esconde posts ao trocar tipo
  document.getElementById('posts-lista').style.display = 'none';
  ultimosFiltrados = [];
  pesquisaCurrentPage = 0;
  updatePesquisaCarousel();
}

// Botão limpar filtro
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('limpaFiltroBtn').addEventListener('click', () => {
    document.getElementById('pesquisaOpcoes').selectedIndex = 0;
    document.getElementById('posts-lista').style.display = 'none';
    ultimosFiltrados = [];
    pesquisaCurrentPage = 0;
    updatePesquisaCarousel();
  });
});

// Inicialização principal
function inicializaFiltroPesquisa(posts) {
  postsGlobais = posts;
  ultimosFiltrados = [];
  atualizaOpcoes();
  document.getElementById('pesquisaTipo').addEventListener('change', atualizaOpcoes);
  document.getElementById('pesquisaOpcoes').addEventListener('change', filtraPostsPesquisa);
  document.getElementById('posts-lista').style.display = 'none';
  pesquisaCurrentPage = 0;
  updatePesquisaCarousel();
}

// Responsividade: atualiza carrossel ao redimensionar
window.addEventListener('resize', updatePesquisaCarousel);

// Expondo função para o fetch inicial
window.inicializaFiltroPesquisa = inicializaFiltroPesquisa;

