// Flip 3D do card inteiro (.post) com direção vinculada à borda "pegada"
// Correções p/ mobile: perspectiva local (transform: perspective()), eixo central estável
// - Mouse: cursor "grab" nas bordas; só gira ao arrastar e cruzar o centro
// - Touch/pen: deduz borda pelo lado tocado; só gira ao cruzar o centro
// - Cada gesto adiciona 180° no sentido da borda (E→D pela esquerda, D→E pela direita), infinitamente
// - Mantém o scale do :hover compondo com rotateY
// - Verso vazio (sem espelhamento da frente)
(function () {
  const STYLE_ID = 'tilt-cards-style';
  const ANGLE_STEP = 180;         // cada gesto vira 180°
  const EDGE_W_DESKTOP = 42;      // zona de borda p/ mouse
  const EDGE_W_MOBILE  = 56;      // zona de borda p/ touch (um pouco maior)
  const MOVE_THRESHOLD = 6;       // px p/ distinguir toque acidental
  const MS_DESKTOP = 900;         // duração da animação em desktop
  const MS_MOBILE  = 1050;        // em mobile, um pouco mais longa

  function isMobileLike() {
    return window.matchMedia('(max-width: 600px)').matches;
  }
  function getEdgeZone() {
    return isMobileLike() ? EDGE_W_MOBILE : EDGE_W_DESKTOP;
  }
  function getTransitionMs() {
    return isMobileLike() ? MS_MOBILE : MS_DESKTOP;
  }
  function computeLocalPerspective(pxWidth) {
    // Quanto maior o valor, menor a distorção. Em telas pequenas aumentamos mais.
    const factor = isMobileLike() ? 10.5 : 8.5; // ajustado p/ estabilidade visual
    return Math.round(Math.max(280, pxWidth) * factor);
  }

   function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    const css = `
      .tilt-card {
        transform-style: preserve-3d;
        -webkit-transform-style: preserve-3d;
        transform-origin: center center;
        -webkit-transform-origin: center center;
        transform-box: border-box; /* usa a caixa do card como referência */
        will-change: transform;
        position: relative; /* necessário p/ .card-back absoluta */
      }

      /* Faces: não isole pintura (sem contain: paint) e preserve 3D */
      .tilt-card .card-face {
        transform-style: preserve-3d;
        -webkit-transform-style: preserve-3d;
      }

      /* Aplique backface-visibility em TODAS as camadas dentro das faces */
      .tilt-card .card-face,
      .tilt-card .card-face * {
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }

      /* Frente mantém fluxo e ativa backface corretamente */
      .tilt-card .card-front {
        position: relative;
        transform: rotateY(0deg);
        -webkit-transform: rotateY(0deg);
      }

      /* Verso vazio, cobre toda a área quando visível (em 180°) */
      .tilt-card .card-back {
        position: absolute;
        inset: 0;
        transform: rotateY(180deg);
        -webkit-transform: rotateY(180deg);
        pointer-events: none;
      }
    `;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function inEdgeZone(post, clientX) {
    const r = post.getBoundingClientRect();
    const x = clientX - r.left;
    const EDGE_W = getEdgeZone();
    if (x <= EDGE_W) return 'left';
    if (x >= r.width - EDGE_W) return 'right';
    return null;
  }
  function nearestSide(post, clientX) {
    const r = post.getBoundingClientRect();
    const x = clientX - r.left;
    return x < r.width / 2 ? 'left' : 'right';
  }
  function getComputedScale(el) {
    const t = getComputedStyle(el).transform;
    if (!t || t === 'none') return 1;
    if (t.startsWith('matrix3d(')) {
      const m = t.slice(9, -1).split(',').map(parseFloat);
      return Math.hypot(m[0], m[1], m[2]) || 1;
    } else if (t.startsWith('matrix(')) {
      const m = t.slice(7, -1).split(',').map(parseFloat);
      return Math.hypot(m[0], m[1]) || 1;
    }
    return 1;
  }

  function applyTransform(post) {
    const st = post.__tilt;
    if (!st) return;

    // Libera o :hover nativo quando estiver 0, 360, 720... e sem gesto/hover
    if (!st.dragging && (st.angleTarget % 360 === 0) && !st.hovered) {
      post.style.transform = '';
      post.style.webkitTransform = '';
      post.style.transition = '';
      post.style.webkitTransition = '';
      return;
    }

    const scale = st.hovered ? (st.hoverScale || 1) : 1;
    const angle = st.dragging ? st.currentAngle : st.angleTarget;
    const ms = getTransitionMs();

    // perspectiva local por card (alinha o eixo ao centro do próprio card)
    const persp = st.localPersp;

    if (!st.dragging) {
      post.style.transition = `transform ${ms}ms cubic-bezier(.4,0,.2,1)`;
      post.style.webkitTransition = `-webkit-transform ${ms}ms cubic-bezier(.4,0,.2,1)`;
    }
    // Ordem: perspective -> rotateY -> scale (reduz distorção e deslocamentos)
    const tf = `perspective(${persp}px) rotateY(${angle}deg) scale(${scale})`;
    post.style.transform = tf;
    post.style.webkitTransform = tf;
  }

  function triggerFlip(post, e) {
    const st = post.__tilt;
    if (st.flipTriggered) return;
    st.flipTriggered = true;
    st.dragging = false;

    st.angleTarget = st.startAngle + st.dirSign * ANGLE_STEP;
    applyTransform(post);

    try { post.releasePointerCapture(e.pointerId); } catch {}
    const ms = getTransitionMs();
    setTimeout(() => {
      if (!post.__tilt) return;
      if (post.__tilt.angleTarget % 360 === 0 && !post.__tilt.hovered) {
        post.style.transition = '';
        post.style.webkitTransition = '';
        post.style.transform = '';
        post.style.webkitTransform = '';
      }
    }, ms + 60);
  }

  function startDrag(post, e, requireEdgeForMouse) {
    const isMouse = e.pointerType === 'mouse';

    let side = inEdgeZone(post, e.clientX);
    if (isMouse && requireEdgeForMouse && !side) return; // mouse só na borda
    if (!side) side = nearestSide(post, e.clientX);

    const r = post.getBoundingClientRect();

    const st = post.__tilt;
    st.dragging = true;
    st.flipTriggered = false;
    st.startX = e.clientX;
    st.centerX = r.left + r.width / 2;
    st.startAngle = st.angleTarget;          // …,-360,-180,0,180,360,…
    st.currentAngle = st.startAngle;
    st.dirSign = (side === 'left') ? +1 : -1; // esquerda = E→D; direita = D→E
    st.movedEnough = false;
    st.localPersp = computeLocalPerspective(r.width);

    // Desliga transição durante gesto e melhora UX
    post.style.transition = 'none';
    post.style.webkitTransition = 'none';
    post.style.touchAction = 'pan-y';
    post.style.cursor = isMouse ? 'grabbing' : '';

    try { post.setPointerCapture(e.pointerId); } catch {}
    e.preventDefault();
  }

  function onMove(post, e) {
    const st = post.__tilt;
    if (!st.dragging) {
      if (e.pointerType === 'mouse') {
        const zone = inEdgeZone(post, e.clientX);
        post.style.cursor = zone ? 'grab' : '';
      }
      return;
    }

    const dx = e.clientX - st.startX;
    if (!st.movedEnough && Math.abs(dx) > MOVE_THRESHOLD) st.movedEnough = true;

    // Só dispara flip ao cruzar o centro no sentido correto
    const crossedCenter =
      (st.dirSign > 0 && e.clientX >= st.centerX) || // E→D
      (st.dirSign < 0 && e.clientX <= st.centerX);   // D→E

    if (crossedCenter) {
      triggerFlip(post, e);
      post.style.cursor = '';
    }

    e.preventDefault();
  }

  function endDrag(post, e) {
    const st = post.__tilt;
    if (!st.dragging) return;
    st.dragging = false;

    // Não cruzou o centro => não gira
    post.style.cursor = '';
    try { post.releasePointerCapture(e.pointerId); } catch {}

    if (st.angleTarget % 360 === 0 && !st.hovered) {
      post.style.transition = '';
      post.style.webkitTransition = '';
      post.style.transform = '';
      post.style.webkitTransform = '';
    }
    e.preventDefault();
  }

  function enhancePost(post) {
    if (!post || post.__tilt) return;

    // Prepara o card; a rotação é no próprio .post (card inteiro)
    post.classList.add('tilt-card');
    if (getComputedStyle(post).position === 'static') {
      post.style.position = 'relative';
    }

    // Faces: frente recebe conteúdo atual; verso vazio (sem espelhamento)
    const front = document.createElement('div');
    front.className = 'card-face card-front';
    const back = document.createElement('div');
    back.className = 'card-face card-back';
    const nodes = Array.from(post.childNodes);
    nodes.forEach(n => front.appendChild(n));
    post.appendChild(front);
    post.appendChild(back);

    // Estado
    post.__tilt = {
      angleTarget: 0,      // múltiplos de 180 (…,-360,-180,0,180,360,…)
      currentAngle: 0,
      startAngle: 0,
      startX: 0,
      centerX: 0,
      dirSign: +1,         // +1: E→D; -1: D→E
      dragging: false,
      movedEnough: false,
      flipTriggered: false,
      hovered: false,
      hoverScale: 1,
      localPersp: computeLocalPerspective(post.getBoundingClientRect().width)
    };

    // Observa resize do próprio card para atualizar a perspectiva local
    const ro = new ResizeObserver(() => {
      if (post.__tilt) {
        const w = post.getBoundingClientRect().width || post.offsetWidth || 320;
        post.__tilt.localPersp = computeLocalPerspective(w);
        // Reaplica transform atual para refletir novo valor
        applyTransform(post);
      }
    });
    ro.observe(post);

    // Eventos de gesto
    const onPointerDown = (e) => {
      if (e.target.closest('.read-more-btn')) return;
      if (e.pointerType === 'mouse') startDrag(post, e, true);
      else startDrag(post, e, false);
    };
    const onPointerMove = (e) => onMove(post, e);
    const onPointerUp = (e) => endDrag(post, e);

    post.addEventListener('pointerdown', onPointerDown, { passive: false });
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('pointercancel', onPointerUp, { passive: false });

    // Hover (desktop): mede o scale do :hover para compor com o rotateY
    post.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      post.__tilt.hovered = true;

      if (post.__tilt.angleTarget % 360 === 0) {
        const saved = post.style.transform;
        post.style.transform = '';
        post.style.webkitTransform = '';
        post.__tilt.hoverScale = getComputedScale(post);
        post.style.transform = saved;
        post.style.webkitTransform = saved;
      }
      applyTransform(post);
    }, { passive: true });

    post.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      post.__tilt.hovered = false;

      if (!post.__tilt.dragging && post.__tilt.angleTarget % 360 === 0) {
        post.style.transition = '';
        post.style.webkitTransition = '';
        post.style.transform = '';
        post.style.webkitTransform = '';
        post.style.cursor = '';
      } else {
        applyTransform(post);
        post.style.cursor = '';
      }
    }, { passive: true });
  }

  function initAll() {
    injectCSS();
    document.querySelectorAll('.post').forEach(enhancePost);

    // Observa posts dinâmicos (home/pesquisa)
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches?.('.post')) enhancePost(n);
          n.querySelectorAll?.('.post').forEach(enhancePost);
        });
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    // Atualiza perspectiva local ao mudar breakpoint/orientação
    const mq = window.matchMedia('(max-width: 600px)');
    mq.addEventListener?.('change', () => {
      document.querySelectorAll('.post.tilt-card').forEach(p => {
        if (p.__tilt) {
          const w = p.getBoundingClientRect().width || p.offsetWidth || 320;
          p.__tilt.localPersp = computeLocalPerspective(w);
          applyTransform(p);
        }
      });
    });
    window.addEventListener('orientationchange', () => {
      document.querySelectorAll('.post.tilt-card').forEach(p => {
        if (p.__tilt) {
          const w = p.getBoundingClientRect().width || p.offsetWidth || 320;
          p.__tilt.localPersp = computeLocalPerspective(w);
          applyTransform(p);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initAll);
})();
