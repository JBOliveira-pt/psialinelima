function renderPosts(posts, containerId) {
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

// --- Video Interaction with performance improvement: only one video playing at a time ---
document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('mouseover', handleVideoEvent, true);
  document.body.addEventListener('click', handleVideoEvent, true);
});

function handleVideoEvent(e) {
  const wrapper = e.target.closest('.video-wrapper');
  if (!wrapper) return;
  const video = wrapper.querySelector('video[data-src]');
  if (!video) return;

  // Pause all other videos
  document.querySelectorAll('.video-wrapper video').forEach(v => {
    if (v !== video) {
      v.pause();
      v.currentTime = 0;
      v.parentNode.classList.remove('playing');
    }
  });

  // Load and play the selected video
  if (!video.src) {
    video.src = video.dataset.src;
  }
  video.play();
  wrapper.classList.add('playing');
}
