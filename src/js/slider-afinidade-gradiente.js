// Customiza o track do slider via CSS dinâmico para Chrome/Safari/Edge

document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById('minAfinidade');
  if (!slider) return;

  // Cria ou obtém o style dinâmico
  let styleEl = document.getElementById('slider-afinidade-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'slider-afinidade-style';
    document.head.appendChild(styleEl);
  }

  function atualizarTrack() {
    const value = Number(slider.value);
    const min = Number(slider.min);
    const max = Number(slider.max);
    const percent = ((value - min) / (max - min)) * 100;

    // Gradiente dinâmico para o track (webkit)
    styleEl.textContent = `
      #afinidade-slider-container input[type="range"]::-webkit-slider-runnable-track {
        background: linear-gradient(90deg, #3a3a42 ${percent}%, #e1e1e1 ${percent}%);
      }
    `;
  }

  slider.addEventListener('input', atualizarTrack);
  atualizarTrack();
});
