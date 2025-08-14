const colunas = 21;
    const linhas = 8;
    const quadroW = 120, quadroH = 150;
    const imagemURL = "images/backgroud-img.png";
    const filmeBg = document.getElementById('filme-bg');
    const cols = [];
    let quadros = [];
    for (let j = 0; j < colunas; j++) {
      const coluna = document.createElement('div');
      coluna.className = 'coluna';
      filmeBg.appendChild(coluna);
      for (let i = 0; i < linhas; i++) {
        const quadro = document.createElement('div');
        quadro.className = 'quadro';
        coluna.appendChild(quadro);
        quadros.push({ el: quadro, x: j, y: i });
      }
      cols.push({ coluna, sentido: j % 2 === 0 ? 1 : -1 });
    }
    function aplicarImagem(url) {
      const larguraTotal = colunas * quadroW;
      const alturaTotal = linhas * quadroH;
      quadros.forEach(({ el, x, y }) => {
        el.style.backgroundImage = `url("${url}")`;
        el.style.backgroundSize = `${larguraTotal}px ${alturaTotal}px`;
        el.style.backgroundPosition = `-${x * quadroW}px -${y * quadroH}px`;
      });
    }
    aplicarImagem(imagemURL);
    let t = 0;
    function animar() {
      t += 0.008;
      cols.forEach(({coluna, sentido}, j) => {
        const deslocamentoY = Math.sin(t + j) * 20 * sentido;
        coluna.style.transform = `translateY(${deslocamentoY}px)`;
      });
      requestAnimationFrame(animar);
    }
    animar();