// meuperfil.js
// Script principal da página de perfil: foto, edição de "Sobre mim", interesses e carrossel de favoritos.

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------
  // FOTO DE PERFIL (POPUP)
  // -------------------------------------------------
  const picContainer = document.querySelector('.custom-profile-picture-container');
  const btnEditar = document.getElementById('btnEditarFoto');
  if (picContainer && btnEditar) {
    picContainer.addEventListener('mouseenter', () => btnEditar.classList.add('show'));
    picContainer.addEventListener('mouseleave', () => btnEditar.classList.remove('show'));
    btnEditar.addEventListener('click', () => {
      document.getElementById('popupModal').classList.add('open');
    });
  }
  const closePopupBtn = document.getElementById('closePopup');
  const cancelPopupBtn = document.getElementById('cancelPopup');
  function fecharModal() {
    document.getElementById('popupModal').classList.remove('open');
  }
  if (closePopupBtn) closePopupBtn.onclick = fecharModal;
  if (cancelPopupBtn) cancelPopupBtn.onclick = fecharModal;

  let newProfileImageFile = null;
  const profileImageInput = document.getElementById('profileImage');
  const previewImg = document.getElementById('preview');
  if (profileImageInput && previewImg) {
    profileImageInput.onchange = (evt) => {
      const [file] = evt.target.files;
      if (file) {
        newProfileImageFile = file;
        previewImg.src = URL.createObjectURL(file);
      }
    }
  }
  const savePopupBtn = document.getElementById('savePopup');
  const mainProfilePicture = document.getElementById('mainProfilePicture') || document.querySelector('.profile-picture');
  if (savePopupBtn && mainProfilePicture) {
    savePopupBtn.addEventListener('click', () => {
      if (newProfileImageFile) {
        mainProfilePicture.src = URL.createObjectURL(newProfileImageFile);
        if (profileImageInput) profileImageInput.value = '';
        newProfileImageFile = null;
        if (previewImg) previewImg.src = mainProfilePicture.src;
      }
      fecharModal();
    });
  }

  // -------------------------------------------------
  // INTERESSES (Adicionar / Remover)
  // -------------------------------------------------
  const addBtn = document.getElementById('addInteresseBtn');
  const popover = document.getElementById('addInteressePopover');
  const closeBtn = document.getElementById('closePopoverBtn');
  const select = document.getElementById('interestFilterPopover');
  const pillsWrapper = document.querySelector('.interesses-pills-wrapper');

  if (addBtn && popover && pillsWrapper) {
    addBtn.addEventListener('click', () => {
      popover.style.display = 'block';
      const rect = addBtn.getBoundingClientRect();
      const baseRect = pillsWrapper.getBoundingClientRect();
      popover.style.left = (rect.left - baseRect.left) + 'px';
    });
  }
  if (closeBtn && popover) {
    closeBtn.addEventListener('click', () => { popover.style.display = 'none'; });
  }
  if (select && pillsWrapper && addBtn && popover) {
    select.addEventListener('change', () => {
      const selected = select.options[select.selectedIndex];
      if (selected && selected.value) {
        const existe = Array.from(document.querySelectorAll('.interesse-pill'))
          .some(el => el.textContent.replace('×','').trim() === selected.textContent.trim());
        if (!existe) {
          const span = document.createElement('span');
            span.className = 'interesse-pill';
            span.innerHTML = `
              ${selected.textContent}
              <button class="remove-pill" title="Remover interesse" aria-label="Remover interesse">&times;</button>
            `;
          pillsWrapper.insertBefore(span, addBtn);
        }
        popover.style.display = 'none';
        select.selectedIndex = 0;
      }
    });
  }
  if (pillsWrapper) {
    pillsWrapper.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-pill')) {
        const pill = e.target.closest('.interesse-pill');
        if (pill) pill.remove();
      }
    });
  }
  document.addEventListener('mousedown', (evt) => {
    if (popover && addBtn && !popover.contains(evt.target) && !addBtn.contains(evt.target)) {
      popover.style.display = 'none';
    }
  });

  // -------------------------------------------------
  // SOBRE MIM (Edição)
  // -------------------------------------------------
  const editBtnAbout = document.getElementById('editAboutBtn');
  const saveBtnAbout = document.getElementById('saveEditAbout');
  const cancelBtnAbout = document.getElementById('cancelEditAbout');
  const viewMode = document.getElementById('viewMode');
  const editMode = document.getElementById('editMode');
  const aboutMeText = document.getElementById('aboutMeText');
  const aboutMeInput = document.getElementById('aboutMeInput');

  if (editBtnAbout && saveBtnAbout && cancelBtnAbout && viewMode && editMode && aboutMeText && aboutMeInput) {
    editBtnAbout.addEventListener('click', () => {
      aboutMeInput.value = aboutMeText.textContent.trim();
      viewMode.style.display = 'none';
      editMode.style.display = 'block';
    });
    cancelBtnAbout.addEventListener('click', () => {
      editMode.style.display = 'none';
      viewMode.style.display = 'block';
    });
    saveBtnAbout.addEventListener('click', () => {
      aboutMeText.textContent = aboutMeInput.value;
      editMode.style.display = 'none';
      viewMode.style.display = 'block';
    });
  }

  // -------------------------------------------------
  // POSTS FAVORITOS (Dados + Renderização - mesmo padrão do index)
  // -------------------------------------------------
  const FAVORITE_TITLES = [
    "Mães devoradoras e o horror arquetípico",
    "Infantilização e adultização",
    "A cicatriz da infância",
    "Quando amar é o que Importa",
    "Amor que não se cura",
    "O monstro no espelho",
    "O tempo como oportunidade",
    "Pais, filhos e o legado do espelho"
  ];

  const posts = [
    {
      "titulo": "Mães devoradoras e o horror arquetípico",
      "data": "22/08/2025",
      "imagem": "src/images/joaoemaria-facaelavoltar-img.png",
      "video": "",
      "poster": "",
      "conteudo": [
        "Em seu livro “A Psicanálise dos Contos de Fadas”, Bruno Bettelheim sugere que a história de “João e Maria” não é simplesmente sobre pais negligentes, mas sim uma profunda alegoria sobre as angústias infantis.",
        "A bruxa, nesse contexto, representa o arquétipo da “mãe má” e os aspectos devoradores do complexo oral.",
        "Sua crueldade se manifesta principalmente pela manipulação, materializando o medo primordial da criança de ser consumida por uma relação simbiótica e patológica com a figura materna.",
        "Essa análise de Bettelheim ressoa fortemente no filme “Faça Ela Voltar”.",
        "A trama é um pouco similar: dois irmãos vulneráveis após a morte do pai são acolhidos por uma tutora cuja gentileza esconde uma natureza ameaçadora.",
        "O filme explora a face mais sombria do luto, mostrando Laura, a tutora, disposta a sacrificar qualquer coisa para reviver a filha morta.",
        "Assim como a bruxa de “João e Maria”, ela manipula e alimenta a menina Piper com a ilusão de ser seu único porto seguro para, no fim, entregá-la a um demônio.",
        "Ambas exploram o horror de um “amor” que, em sua forma pervertida, ilude, consome e busca devorar o outro com o único propósito de preencher um imenso vazio interior.",
        "Com elementos do conto dos irmãos Grimm, “Faça ela voltar” leva os medos arquetípicos da infância para o horror contemporâneo, provando assim a universalidade e atemporalidade desses conflitos."
      ],
      "hashtags": ["facaelavoltar","bringherback","cinema","hollywood","a24","bettelheim","joaoemaria","contosdefadas","arquetipos","maema","complexooral","horror","bodyhorror","infancia"]
    },
    {
      "titulo": "Infantilização e adultização",
      "data": "21/08/2025",
      "imagem": "",
      "video": "src/images/tonierdmman-vid.mp4",
      "poster": "src/images/tonierdmman-img.png",
      "conteudo": [
        "Precisamos falar sobre como a infantilização excessiva dos adultos leva à adultização precoce das crianças.",
        "Quando um adulto se recusa a amadurecer, buscando apenas prazer imediato e fugindo de responsabilidades, ele deixa um vazio.",
        "Esse vazio é preenchido pela criança, que é forçada a assumir um papel de adulto para compensar a imaturidade dos pais.",
        "“Toni Erdmann”, um belíssimo filme alemão, é um exemplo perfeito dessa dinâmica.",
        "Aparentemente, a narrativa gira em torno da reconciliação entre um pai e uma filha.",
        "No entanto, ao observarmos outras camadas, percebemos que a transformação de Ines numa executiva extremamente pragmática foi o mecanismo de sobrevivência encontrado para lidar com o comportamento infantil do próprio pai.",
        "Enquanto Winfried vive por meio de um excesso de brincadeiras absurdas, Ines é forçada desde cedo a ser a responsável, tentando gerenciar até mesmo as intrusões paternas em sua vida adulta.",
        "Essa inversão, onde o adulto se infantiliza e a criança se adultifica, não é mais uma exceção patológica, mas um sintoma cultural amplificado pelos valores da pós-modernidade.",
        "A infantilização do adulto é incentivada por um sistema capitalista que venera o consumo imediato, o culto à juventude eterna, a fuga de qualquer desconforto, entre outros.",
        "A reflexão que fica é angustiante: estamos criando uma geração de “minis Ines”.",
        "Crianças com cronogramas e ansiedades de adultos, e uma hiper-racionalidade que serve como escudo porque, no fundo, se sentem sempre desamparadas.",
        "As “crianças precoces” podem encontrar duas saídas, aparentemente opostas, mas que são igualmente problemáticas:",
        "Ou elas se tornam incapazes de confiar e criar laços afetivos, ou, no outro extremo, procuram relações codependentes numa tentativa desesperada de preencher o vazio deixado na infância."
      ],
      "hashtags": ["tonierdmann","cinema","cult","sandrahuller","infantilizacao","adultizacao","posmodernidade","familia","responsabilidade","capitalismo","criançasprecoces","reflexao"]
    },
    {
      "titulo": "A cicatriz da infância",
      "data": "18/07/2025",
      "imagem": "",
      "video": "src/images/ToyStory-vid.mp4",
      "poster": "src/images/ToyStory-img.png",
      "conteudo": [
        "A saída da infância é dolorosa porque significa romper com um estado de completude ilusória, onde a criança acredita ser o centro do próprio universo.",
        "Entrar no mundo adulto exige submeter-se ao “Princípio da Realidade”, um território de frustrações, limites e da descoberta da falta que nos constitui.",
        "Essa transição revela a perda de um paraíso primordial, onde a satisfação parecia absoluta.",
        "Para Lacan, é essa falta que funda o desejo, mas seu custo é a nostalgia de uma plenitude que nunca mais se recupera.",
        "A cena em que Andy doa seus brinquedos a Bonnie ou essa do rapaz que chora ao se despedir deles ao completar 18 anos não é sobre os objetos em si, mas sobre o que eles simbolizam (ou deixaram de simbolizar).",
        "O choro do adolescente (e o nosso) não é só por saudade, mas por uma perda inconsciente: a de que ele mesmo já não acredita na magia que esses objetos um dia representaram.",
        "Quando Andy entrega Woody a Bonnie, ele não está só repassando um brinquedo, mas também ratificando sua entrada em um mundo onde os objetos perdem o encanto e se reduzem à sua utilidade.",
        "Renuncia-los é assinar um pacto social que nos obriga a trocar um mundo onde tudo era possível pela negociação constante com a realidade.",
        "E, por mais que saibamos que é preciso seguir em frente, a criança que fomos não desaparece; fica apenas escondidinha em algum canto dentro de nós, rindo e chorando em cada (in)decisão da vida adulta.",
        "A infância não é uma fase que simplesmente abandonamos como se nunca tivesse existido.",
        "É uma cicatriz."
      ],
      "hashtags": ["infancia","lacan","principiodarealidade","desejo","simbolico","toystory","pixar","cinema","hollywood","ritodepassagem","perda","encantamento","memoria"]
    },
    {
      "titulo": "Quando amar é o que Importa",
      "data": "28/06/2025",
      "imagem": "src/images/AmarImporta-img.png",
      "video": "",
      "poster": "",
      "conteudo": [
        "Ontem, enquanto acompanhava mais um episódio de “The Bear”, fui profundamente tocada pela cena em que Carmy liga para a irmã pedindo desculpas por ainda não ter conhecido a sobrinha.",
        "No mesma ligação, Sugar deixa escapar a memória da partida do irmão para Nova York: aquele misto de tristeza e alegria ao ver nele, pela primeira vez, o brilho de quem finalmente encontrara seu lugar no mundo.",
        "Ela diz: “Você encontrou algo que ama, e não tem problema se você não amar mais, porque o mais especial nisso tudo é saber que você é capaz de amar.”",
        "A série, nesse diálogo, não explora apenas o desamor e seu luto, mas celebra a própria potência do desejo...",
        "Mais do que encontrar e acertar o alvo, amar pode ser um exercício contínuo de tentativa e, principalmente, de recomeço."
      ],
      "hashtags": ["thebear","ourso","serie","amor","desejo","recomeco","potencia","desapego","trauma","capacidadedeamar"]
    },
    {
      "titulo": "Amor que não se cura",
      "data": "20/05/2025",
      "imagem": "src/images/AmorNaoCura-img.png",
      "video": "",
      "poster": "",
      "conteudo": [
        "“Espero que, se você tiver um filho, seja melhor que eu.”",
      "Nessa frase, Joel não está apenas expressando um desejo. Ele revive, a partir de outro lugar, uma cena traumática de sua própria história, revelando sua dolorosa identificação com a figura paterna.",
      "O amor de pai, aqui, se revela um sintoma: um resto impossível de digerir, que se repete como um destino e que, sem querer, ele transmite a Ellie.",
      "E assim, o ciclo segue. Quase que inescapável. Porque, às vezes, amor é apenas o nome que damos ao que nunca se curou.",
      "(É muito triste quando um pai que te protege do mundo todo, por mais que queira, não consegue te proteger dele mesmo)"
      ],
      "hashtags": ["thelastofus","serie","joel","ellie","paternidade","amor","trauma","ciclosfamiliares","herancapsiquica","destino"]
    },
    {
      "titulo": "O monstro no espelho",
      "data": "06/03/2025",
      "imagem": "src/images/MonstroNoEspelho-img.png",
      "video": "",
      "poster": "",
      "conteudo": [
        "Para uma mãe que, inconscientemente, projeta suas próprias angústias mal elaboradas no filho, o mundo pode se transformar em um campo minado, onde cada gesto alheio pode parecer uma ameaça à sua integridade.",
    "Para um aluno decepcionado com seu professor, a figura que deveria guiá-lo se torna uma sombra que cresce, até se transformar em algo horrível, refletindo não só as falhas do outro, mas também as suas próprias inseguranças.",
    "Para uma criança, os limites entre fantasia e realidade podem ser tão frágeis que o sonho e a vigília se misturam, tornando-se quase impossível distingui-los.",
    "A realidade nunca é imaculada. Ela está sempre mediada pelo olhar de quem a observa, como um caleidoscópio que reproduz experiências, medos e desejos.",
    "Sendo assim, afinal, quem é, de fato, o “monstro”?",
    "Será ele realmente o outro, ou apenas um reflexo das sombras que carregamos dentro de nós, espalhadas pelo mundo?",
    "Talvez, quem sabe, o “monstro” seja apenas a parte de nós que ainda não aprendemos a acolher…"
      ],
      "hashtags": ["monster","cinema","hirokazu","cult","projecao","sombra","realidade","fantasia","autoacolhimento","inseguranca","infancia","reflexao"]
    },
    {
      "titulo": "O tempo como oportunidade",
      "data": "31/01/2025",
      "imagem": "src/images/ocasteloanimado-img.png",
      "video": "",
      "poster": "",
      "conteudo": [
        "Nesta semana, estamos em recesso escolar em Portugal, e tenho aproveitado para assistir a filmes dos Estúdios Ghibli com meus filhos todos os dias.",
    "Hoje, quero destacar um em particular: a história de Sophie, uma jovem que é “amaldiçoada” e transformada em uma mulher de 90 anos (chama-se “O Castelo Animado”, por aqui).",
    "Essa metamorfose não é apenas mais um elemento fantástico da trama, mas, principalmente, uma metáfora sobre o valor do tempo e as mudanças psíquicas que ele acarreta.",
    "No início, Sophie luta contra sua nova aparência, porém, ao longo da história, ela começa a aceitar sua nova condição.",
    "Assim, a velhice é frequentemente ressignificada pela personagem durante a narrativa. Se, no início, ela se mostra insegura sobre sua identidade, em sua nova forma, descobre sabedoria e coragem.",
    "Sophie percebe que a juventude física não define seu valor, já que sua essência permanece a mesma, independentemente da aparência.",
    "Por meio do lúdico, como só Hayao Miyazaki consegue fazer, o filme sugere que envelhecer não deve ser temido, mas sim compreendido como uma parte natural da vida que potencializa nossas experiências e possibilita um reconhecimento mais profundo das relações e do mundo.",
    "Mostrando que a passagem do tempo, longe de ser uma maldição, representa uma oportunidade para nos conectarmos com aquilo que realmente pode ser significativo para nós."

      ],
      "hashtags": ["ocasteloanimado","cinema","ghibli","miyazaki","envelhecer","tempo","sabedoria","metamorfose","familia","reflexao"]
    },
    {
      "titulo": "Pais, filhos e o legado do espelho",
      "data": "06/01/2025",
      "imagem": "src/images/paisfilhoselegadoespelho-img.png",
      "video": "",
      "poster": "",
      "conteudo": [
        "A influência dos pais sobre seus filhos é um tema labiríntico e carregado de nuances, que deve ser sempre ouvido no um a um.",
    "Freud comparou os filhos a um espelho, onde os pais projetam seus próprios desejos e medos, uma extensão do seu narcisismo.",
    "Essa dinâmica é poderosíssima e pode se tornar tanto uma fonte de inspiração, quanto de aprisionamento.",
    "A complexidade de tal legado molda (querendo ou não) parte de nossa identidade e direciona (até certo ponto) nossos caminhos pela vida.",
    "É um processo contínuo: construção, desconstrução, reconstrução. E, em cada etapa, todo novo sujeito pode (e deve) adicionar sua própria camada de significado.",
    "A cada geração, a herança pode ser reinterpretada e adaptada, enquanto um pouco da sua essência permanece.",
    "Tornando-se algo que, paradoxalmente, se repete, mas nunca é exatamente o mesmo.",
    "Quando transmitida de forma amorosa e, principalmente, respeitosa, torna-se uma bela dança de se admirar entre o eu e o nós, o ontem, o hoje e o amanhã.",
    "Viva as Fernandas! 🤍"
      ],
      "hashtags": ["fernandamontenegro","fernandatorres","oscar2025","cinema","cinemanacional","aindaestouaqui","paisefilhos","legado","narcisismo","heranca","freud","identidade","familia","reconstrucao","reflexao"]
    }
  ];

  function renderPosts(postsList, trackId) {
    const track = document.getElementById(trackId);
    if (!track) return;
    track.innerHTML = '';
    postsList.forEach(post => {
      let midia = '';
      if (post.imagem) {
        midia = `<img src="${post.imagem}" alt="${post.titulo}">`;
      } else if (post.video) {
        midia = `
          <div class="video-wrapper" style="position:relative; display:inline-block;">
            <video loop muted playsinline preload="none" data-src="${post.video}" poster="${post.poster || ''}" style="width:100%; display:block; cursor:pointer;" tabindex="0"></video>
            <div class="video-overlay">▶ reproduzir vídeo</div>
          </div>
        `;
      }
      track.innerHTML += `
        <article class="post">
          <div class="post-content">
            <h2>${post.titulo}</h2>
            <h4>${post.data}</h4>
            ${midia}
            ${post.conteudo.map(p => `<p>${p}</p>`).join('')}
          </div>
          <div class="post-footer">
            <div class="hashtags">
              ${post.hashtags.map(h => `<a class="hashtag-link" data-hashtag="${h}">#${h}</a>`).join(' ')}
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
  }

  const favoritos = posts.filter(p => FAVORITE_TITLES.includes(p.titulo));
  renderPosts(favoritos, 'favCarouselTrack');

  // -------------------------------------------------
  // Vídeos (Reproduzir on hover/click - compatível com padrão)
  // -------------------------------------------------
  function handleVideoEvent(e) {
    const wrapper = e.target.closest('.video-wrapper');
    if (!wrapper) return;
    const video = wrapper.querySelector('video[data-src]');
    if (!video) return;
    document.querySelectorAll('.video-wrapper video').forEach(v => {
      if (v !== video) {
        v.pause(); v.currentTime = 0;
        v.parentNode.classList.remove('playing');
      }
    });
    if (!video.src) video.src = video.dataset.src;
    video.play();
    wrapper.classList.add('playing');
  }
  document.body.addEventListener('mouseover', handleVideoEvent, true);
  document.body.addEventListener('click', handleVideoEvent, true);

  // -------------------------------------------------
  // Botão "ler mais" sem ser aplicado
  // -------------------------------------------------
  //document.addEventListener('click', (e) => {
  //  const btn = e.target.closest('.read-more-btn');
  //  if (!btn) return;
  //  const post = btn.closest('.post');
  //  if (!post) return;
  //  const content = post.querySelector('.post-content');
  //  btn.classList.toggle('expanded');
  //  content.classList.toggle('expanded');
  // });

  // -------------------------------------------------
  // CARROSSEL FAVORITOS (Estilo index + avanço de até 3 posts)
  // -------------------------------------------------
  const track = document.getElementById('favCarouselTrack');
  const prevBtn = document.getElementById('favPrevBtn');
  const nextBtn = document.getElementById('favNextBtn');
  let currentIndex = 0;

  function getCardMetrics() {
    const cards = Array.from(track.querySelectorAll('.post'));
    if (!cards.length) return {cards, cardWidth:0, gap:0};
    const first = cards[0];
    const style = window.getComputedStyle(first);
    const marginLeft = parseFloat(style.marginLeft) || 0;
    const marginRight = parseFloat(style.marginRight) || 0;
    const totalWidth = first.getBoundingClientRect().width;
    const cardWidth = totalWidth; // já inclui padding/border
    const gap = marginLeft + marginRight; // caso queira usar
    return { cards, cardWidth, gap };
  }

  function cardsPerView() {
    const viewport = document.getElementById('favViewport');
    const { cardWidth } = getCardMetrics();
    if (!cardWidth) return 1;
    const vw = viewport.getBoundingClientRect().width;
    // arredonda para baixo
    return Math.max(1, Math.floor(vw / cardWidth));
  }

  function updateButtons() {
    const { cards } = getCardMetrics();
    const total = cards.length;
    const perView = cardsPerView();
    // Esconde ambos se não há rolagem
    if (total <= perView) {
      prevBtn.style.visibility = 'hidden';
      nextBtn.style.visibility = 'hidden';
      return;
    }
    prevBtn.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';
    nextBtn.style.visibility = (currentIndex + perView) < total ? 'visible' : 'hidden';
  }

  function goToIndex(newIndex) {
    const { cards } = getCardMetrics();
    const total = cards.length;
    const perView = cardsPerView();
    currentIndex = Math.max(0, Math.min(newIndex, Math.max(0, total - perView)));
    // deslocamento baseado na posição do card atual
    if (cards[currentIndex]) {
      const offsetLeft = cards[currentIndex].offsetLeft;
      track.style.transform = `translateX(-${offsetLeft}px)`;
    }
    updateButtons();
  }

  function step(direction) {
    const perView = cardsPerView();
    const stepSize = Math.min(3, perView); // movimenta até 3
    if (direction === 'next') {
      goToIndex(currentIndex + stepSize);
    } else {
      goToIndex(currentIndex - stepSize);
    }
  }

  if (prevBtn && nextBtn && track) {
    prevBtn.addEventListener('click', () => step('prev'));
    nextBtn.addEventListener('click', () => step('next'));
    window.addEventListener('resize', () => {
      // Recalcula alinhamento preservando o "grupo" em que está
      goToIndex(currentIndex);
    });
    // Inicial
    goToIndex(0);
  }

  // -------------------------------------------------
  // Integração hipotética fetchPublicMembers (caso exista global)
  // -------------------------------------------------
  if (typeof fetchPublicMembers !== 'undefined') {
    async function loadMembers() {
      const interest = document.getElementById('interestFilter')?.value;
      const data = await fetchPublicMembers({ interest });
      const grid = document.getElementById('membersGrid');
      if (grid) {
        grid.innerHTML = data.map(m => `
          <article class="member-card">
            <img src="${m.foto_url || '/img/avatar-placeholder.png'}" alt="">
            <h3>${m.name}</h3>
            <p>${(m.bio || '').slice(0,120)}</p>
            <a href="/membros/${m.username_publico}.html">Ver perfil</a>
          </article>
        `).join('');
      }
    }
    document.getElementById('interestFilter')?.addEventListener('change', loadMembers);
    document.getElementById('btnLogin')?.addEventListener('click', signInWithFacebook);
    loadMembers();
  }
});

