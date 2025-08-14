function renderPosts(posts, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  posts.forEach(post => {
    let midia = '';
    if (post.imagem) {
      midia = `<img src="${post.imagem}" alt="${post.titulo}">`;
    } else if (post.video) {
      midia = `<video autoplay loop muted playsinline src="${post.video}"></video>`;
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
            ${post.hashtags.map(h => `<a href="#" class="hashtag-link" data-hashtag="${h}">#${h}</a>`).join(' ')}
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