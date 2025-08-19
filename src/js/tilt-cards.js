// Flip 3D do card inteiro (.post) com direção vinculada à borda "pegada"
// - Mouse: cursor "grab" nas bordas; só gira ao arrastar nelas
// - Touch/pen: deduz borda pelo lado tocado (usa meio como fallback)
// - Cada gesto vira 180° no sentido da borda e pode repetir indefinidamente
// - Mantém o scale do :hover compondo com rotateY
// - Verso vazio (sem espelhamento da frente) para conteúdo futuro
(function () {
  const STYLE_ID = 'tilt-cards-style';
  const ANGLE_STEP = 180;     // cada gesto vira 180°
  const SNAP_DEG = 90;        // limiar p/ completar ou cancelar o flip
  const EDGE_W = 42;          // zona de borda (px) p/ "pegar" com mouse
  const MOVE_THRESHOLD = 6;   // px p/ considerar arrasto
  const TRANSITION_MS = 900;  // mais lento a pedido

  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    const css = `
      .tilt-card {
        transform-style: preserve-3d;
      }
      .tilt-card .card-face {
        backface-visibility: hidden;
        transform-style: preserve-3d;
      }
      /* Frente fica no fluxo normal, com transform 3D explícito para backface funcionar */
      .tilt-card .card-front {
        position: relative;
        transform: rotateY(0deg);
      }
      /* Verso vazio, sobreposto, pronto para conteúdo futuro */
      .tilt-card .card-back {
        position: absolute;
        inset: 0;
        transform: rotateY(180deg);
        pointer-events: none; /* evita capturar cliques por engano enquanto estiver vazio */
      }
    `;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function ensurePerspective(post) {
    const parent = post.parentElement;
    if (parent && getComputedStyle(parent).perspective === 'none') {
      parent.style.perspective = '1000px';
      parent.style.perspectiveOrigin = '50% 50%';
    }
  }

  function inEdgeZone(post, clientX) {
    const r = post.getBoundingClientRect();
    const x = clientX - r.left;
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

    // Se ângulo alvo é múltiplo de 180 e não está arrastando nem hovered, libere o :hover do CSS
    if (!st.dragging && (st.angleTarget % ANGLE_STEP === 0) && !st.hovered) {
      if (st.angleTarget === 0) {
        post.style.transform = '';
        return;
      }
    }

    const scale = st.hovered ? (st.hoverScale || 1) : 1;
    const angle = st.dragging ? st.currentAngle : st.angleTarget;
    post.style.transform = `scale(${scale}) rotateY(${angle}deg)`;
  }

  function startDrag(post, e, requireEdgeForMouse) {
    const isMouse = e.pointerType === 'mouse';

    // Determina a borda de início
    let side = inEdgeZone(post, e.clientX);
    if (isMouse && requireEdgeForMouse && !side) {
      // mouse só inicia na borda
      return;
    }
    if (!side) {
      // touch/pen ou mouse fora da borda: deduz pelo lado mais próximo
      side = nearestSide(post, e.clientX);
    }

    const st = post.__tilt;
    st.dragging = true;
    st.startX = e.clientX;
    st.startAngle = st.angleTarget;          // …,-360,-180,0,180,360,…
    st.currentAngle = st.startAngle;
    st.dirSign = (side === 'left') ? +1 : -1; // esquerda: E→D (ângulo cresce), direita: D→E (ângulo diminui)
    st.movedEnough = false;

    post.style.transition = 'none';
    post.style.touchAction = 'pan-y';
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

    const rect = post.getBoundingClientRect();
    // Progresso projetado apenas no sentido permitido (0 → 1)
    let prog = (st.dirSign * dx) / (rect.width / 2); // meia largura = 180°
    if (prog < 0) prog = 0;
    if (prog > 1) prog = 1;

    const angle = st.startAngle + st.dirSign * (prog * ANGLE_STEP);
    st.currentAngle = angle;

    applyTransform(post);
    e.preventDefault();
  }

  function endDrag(post, e) {
    const st = post.__tilt;
    if (!st.dragging) return;
    st.dragging = false;

    // Decide se completa o meio-giro (>= 90° no sentido da borda) ou volta ao início
    const moved = Math.abs(st.currentAngle - st.startAngle);
    const complete = moved >= SNAP_DEG;
    const target = complete
      ? (st.startAngle + st.dirSign * ANGLE_STEP)
      : st.startAngle;

    st.angleTarget = target;

    post.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(.4,0,.2,1)`;
    applyTransform(post);

    try { post.releasePointerCapture(e.pointerId); } catch {}

    // Se voltou a 0° e não está hovered, libere o transform inline após animar
    setTimeout(() => {
      if (post.__tilt && post.__tilt.angleTarget === 0 && !post.__tilt.hovered) {
        post.style.transition = '';
        post.style.transform = '';
      }
    }, TRANSITION_MS + 40);

    e.preventDefault();
  }

  function enhancePost(post) {
    if (!post || post.__tilt) return;

    // Preparar card para flip do próprio .post
    post.classList.add('tilt-card');
    post.style.transformOrigin = 'center center';
    // Queremos ver o verso do card (sem conteúdo espelhado)
    post.style.backfaceVisibility = 'visible';
    if (getComputedStyle(post).position === 'static') {
      post.style.position = 'relative';
    }
    ensurePerspective(post);

    // Criar faces: frente recebe conteúdo atual; verso vazio
    const front = document.createElement('div');
    front.className = 'card-face card-front';

    const back = document.createElement('div');
    back.className = 'card-face card-back';
    // Você poderá popular .card-back depois com comentários

    const nodes = Array.from(post.childNodes);
    nodes.forEach(n => front.appendChild(n));
    post.appendChild(front);
    post.appendChild(back);

    post.__tilt = {
      angleTarget: 0,      // múltiplos de 180 permitidos (…,-360,-180,0,180,360,…)
      currentAngle: 0,
      startAngle: 0,
      startX: 0,
      dirSign: +1,         // +1: E→D; -1: D→E
      dragging: false,
      movedEnough: false,
      hovered: false,
      hoverScale: 1
    };

    // Eventos de gesto
    const onPointerDown = (e) => {
      // Evita conflito com "leia mais"
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

    // Hover: medir scale do CSS para compor com rotateY quando na frente
    post.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      post.__tilt.hovered = true;

      if (post.__tilt.angleTarget === 0) {
        const saved = post.style.transform;
        post.style.transform = '';
        post.__tilt.hoverScale = getComputedScale(post);
        post.style.transform = saved;
      }
      applyTransform(post);
    }, { passive: true });

    post.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      post.__tilt.hovered = false;

      if (!post.__tilt.dragging && post.__tilt.angleTarget === 0) {
        post.style.transform = '';
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
  }

  document.addEventListener('DOMContentLoaded', initAll);
})();
