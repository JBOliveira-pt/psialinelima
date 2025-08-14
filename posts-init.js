document.addEventListener('DOMContentLoaded', async () => {
  const track = document.getElementById('carouselTrack');
  // posts.js precisa estar carregado e ter a função renderPosts(posts, containerId)
  if (!track || typeof renderPosts !== 'function') return;

  try {
    const res = await fetch('posts.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const posts = await res.json();

    // Renderiza dentro da esteira do carrossel
    renderPosts(posts, 'carouselTrack');

    // Liga o botão "ler mais" via delegação (funciona para elementos dinâmicos)
    track.addEventListener('click', (e) => {
      const btn = e.target.closest('.read-more-btn');
      if (!btn) return;
      const post = btn.closest('.post');
      const content = post?.querySelector('.post-content');
      if (!content) return;

      const expanded = content.classList.toggle('expanded');
      btn.classList.toggle('expanded', expanded);
      btn.setAttribute('aria-expanded', String(expanded));
      btn.setAttribute('aria-label', expanded ? 'Recolher' : 'Expandir');
    });

    // === DELEGAÇÃO DE EVENTO PARA HASHTAG ===
    track.addEventListener('click', (e) => {
      const hashtagLink = e.target.closest('.hashtag-link');
      if (!hashtagLink) return;
      e.preventDefault();
      const hashtag = hashtagLink.dataset.hashtag;
      if (hashtag) {
        window.location.href = `pesquisa.html?hashtag=${encodeURIComponent(hashtag)}`;
      }
    });
    // === FIM DELEGAÇÃO DE HASHTAG ===

    // Se outro script (ex.: o do carrossel) precisar saber, emitimos um evento:
    document.dispatchEvent(new CustomEvent('postsRendered', { detail: { count: posts.length } }));
  } catch (err) {
    console.error('Erro ao carregar posts.json:', err);
    track.innerHTML = '<p style="color:#fff">Não foi possível carregar os posts.</p>';
  }
});