// Tudo só depois que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // POSTS / CARROSSEL
  const postsPerPage = 3;
  let currentPage = 0;

  const track =
    document.getElementById('carouselTrack') ||
    document.querySelector('.carousel-track');

  const prevBtn = document.getElementById('prevPostsBtn');
  const nextBtn = document.getElementById('nextPostsBtn');

  // Sempre pega os cards atuais (posts são injetados dinamicamente)
  function getCards() {
    return track ? Array.from(track.querySelectorAll('.post')) : [];
  }

  function recolherTodosPosts() {
    document.querySelectorAll('.post-content.expanded').forEach(content => {
      content.classList.remove('expanded');
      const btn = content.closest('.post')?.querySelector('.read-more-btn');
      if (btn) {
        btn.classList.remove('expanded');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Expandir');
      }
    });
  }

  function updateCarousel() {
    if (!track || !prevBtn || !nextBtn) return;

    const cards = getCards();

    // Modo responsivo (<=900px): carrossel vira grid/coluna
    if (window.innerWidth <= 900) {
      track.style.transform = 'none';
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      return;
    }

    // Sem cards ainda: esconder botões e não transformar
    if (cards.length === 0) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      track.style.transform = 'translateX(0)';
      return;
    }

    // Calcular largura do card incluindo margens
    const card = cards[0];
    const cardStyle = getComputedStyle(card);
    const cardWidth =
      card.offsetWidth +
      parseFloat(cardStyle.marginRight) +
      parseFloat(cardStyle.marginLeft);

    // Aplicar deslocamento
    track.style.transform = `translateX(-${currentPage * postsPerPage * cardWidth}px)`;

    // Mostrar/ocultar botões
    const totalPages = Math.ceil(cards.length / postsPerPage);
    prevBtn.style.display = currentPage > 0 ? '' : 'none';
    nextBtn.style.display = currentPage < totalPages - 1 ? '' : 'none';
  }

  window.addEventListener('resize', updateCarousel);

  // Botões do carrossel
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 0) {
        recolherTodosPosts();
        currentPage--;
        updateCarousel();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(getCards().length / postsPerPage);
      if (currentPage < totalPages - 1) {
        recolherTodosPosts();
        currentPage++;
        updateCarousel();
      }
    });
  }

  // Chamada inicial (vai esconder botões até os posts carregarem)
  updateCarousel();

  // Quando os posts forem renderizados dinamicamente (posts-init.js dispara este evento)
  document.addEventListener('postsRendered', () => {
    currentPage = 0;
    updateCarousel();
  });

  // HAMBURGER MENU
  const hamburgerBtn = document.querySelector('.hamburger');
  const menuOverlay = document.getElementById('menu-overlay');
  const bodyEl = document.body;

  function toggleMenu(open) {
    if (!hamburgerBtn || !menuOverlay) return;
    hamburgerBtn.classList.toggle('open', open);
    menuOverlay.classList.toggle('open', open);
    bodyEl.classList.toggle('menu-open', open);
    hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuOverlay.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  if (hamburgerBtn && menuOverlay) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = hamburgerBtn.classList.contains('open');
      toggleMenu(!isOpen);
    });

    menuOverlay.addEventListener('click', (e) => {
      if (e.target === menuOverlay) {
        toggleMenu(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOverlay.classList.contains('open')) {
        toggleMenu(false);
      }
    });

    menuOverlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });
  }
});

