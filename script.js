const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function startFinanceScene(canvas) {
  if (!canvas || prefersReducedMotion) return false;

  try {
    const THREE = await import("https://unpkg.com/three@0.160.0/build/three.module.js");
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.35, 8);

    const group = new THREE.Group();
    scene.add(group);

    const gold = new THREE.MeshStandardMaterial({ color: 0xb98a3a, roughness: 0.34, metalness: 0.62 });
    const blue = new THREE.MeshStandardMaterial({ color: 0x2b7dab, roughness: 0.42, metalness: 0.28 });
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xdceff2,
      transparent: true,
      opacity: 0.34,
      roughness: 0.12,
      metalness: 0.08,
      transmission: 0.24
    });

    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.018, 12, 128), gold);
    ring.rotation.x = Math.PI * 0.52;
    group.add(ring);

    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.014, 12, 96), glass);
    innerRing.rotation.x = Math.PI * 0.5;
    innerRing.rotation.y = Math.PI * 0.12;
    group.add(innerRing);

    const bars = [];
    for (let i = 0; i < 9; i += 1) {
      const height = 0.42 + (i % 4) * 0.28 + i * 0.035;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.18, height, 0.18), i % 3 === 0 ? gold : blue);
      bar.position.set((i - 4) * 0.34, -1.35 + height / 2, 0.1 * Math.sin(i));
      group.add(bar);
      bars.push(bar);
    }

    const nodes = [];
    for (let i = 0; i < 16; i += 1) {
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.045, 18, 18), i % 4 === 0 ? gold : glass);
      const angle = (i / 16) * Math.PI * 2;
      node.position.set(Math.cos(angle) * 2.25, Math.sin(angle) * 0.72, Math.sin(angle) * 0.65);
      group.add(node);
      nodes.push(node);
    }

    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 4, 5);
    scene.add(key);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    let raf = 0;
    function animate(time) {
      resize();
      const t = time * 0.001;
      group.rotation.y = t * 0.22;
      group.rotation.x = Math.sin(t * 0.4) * 0.08;
      ring.rotation.z = t * 0.18;
      innerRing.rotation.z = -t * 0.26;
      bars.forEach((bar, i) => {
        bar.scale.y = 1 + Math.sin(t * 1.4 + i) * 0.08;
      });
      nodes.forEach((node, i) => {
        node.position.y += Math.sin(t + i) * 0.0008;
      });
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(animate);
    }

    canvas.dataset.renderMode = "three";
    raf = window.requestAnimationFrame(animate);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pagehide", () => window.cancelAnimationFrame(raf), { once: true });
    return true;
  } catch (error) {
    canvas.dataset.renderMode = "fallback";
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    function drawFallback() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * window.devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(rect.height * window.devicePixelRatio));
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.strokeStyle = "rgba(185, 138, 58, .72)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(rect.width * 0.5, rect.height * 0.5, rect.width * 0.24, rect.height * 0.18, -0.28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(220, 239, 242, .38)";
      for (let i = 0; i < 9; i += 1) {
        const h = 28 + i * 9;
        ctx.fillRect(rect.width * 0.31 + i * 24, rect.height * 0.68 - h, 12, h);
      }
    }
    drawFallback();
    window.addEventListener("resize", drawFallback, { passive: true });
    return false;
  }
}

document.querySelectorAll("[data-finance-canvas]").forEach((canvas) => {
  startFinanceScene(canvas);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  });
}, { threshold: 0.14 });

document.querySelectorAll(".service-card, .price-card, .page-link-grid a, .service-detail-grid article, .service-detail-grid a, .process-grid article, .industry-grid article, .case-grid article, .trust-grid article, .faq-grid article").forEach((item) => {
  item.classList.add("reveal-item");
  revealObserver.observe(item);
});
