const canvas = document.querySelector(".hero-3d");

function cssColor(name) {
   return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function addRevealAnimations() {
   const revealTargets = document.querySelectorAll(
      ".section-heading, .info-card, .stats-grid article, .program-card, .practice-visual, .feature-list article, .campus, .logo-grid span, .news-card, .admissions, .page-card, .download-card, .funnel-card"
   );

   revealTargets.forEach((item) => item.classList.add("reveal"));

   const observer = new IntersectionObserver(
      (entries) => {
         entries.forEach((entry) => {
            if (entry.isIntersecting) {
               entry.target.classList.add("is-visible");
               observer.unobserve(entry.target);
            }
         });
      },
      { threshold: 0.18 }
   );

   revealTargets.forEach((item) => observer.observe(item));
}

function addParallaxMotion() {
   const parallaxItems = document.querySelectorAll("[data-parallax]");
   if (!parallaxItems.length) return;

   let ticking = false;

   function update() {
      const viewportHeight = window.innerHeight || 1;
      parallaxItems.forEach((item) => {
         const rect = item.getBoundingClientRect();
         const strength = Number(item.dataset.parallax || 18);
         const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
         item.style.setProperty("--parallax-y", `${progress * strength * -1}px`);
      });
      ticking = false;
   }

   function requestUpdate() {
      if (!ticking) {
         requestAnimationFrame(update);
         ticking = true;
      }
   }

   update();
   window.addEventListener("scroll", requestUpdate, { passive: true });
   window.addEventListener("resize", requestUpdate);
}

function drawFallbackModel() {
   if (!canvas) return;

   const ctx = canvas.getContext("2d");
   const state = { width: 0, height: 0, dpr: 1 };
   canvas.dataset.renderer = "fallback-2d";

   function resize() {
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.width = canvas.clientWidth;
      state.height = canvas.clientHeight;
      canvas.width = state.width * state.dpr;
      canvas.height = state.height * state.dpr;
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
   }

   function frame(time) {
      const accent = cssColor("--ai-blue") || "#C3E3EB";
      const cx = state.width * 0.68;
      const cy = state.height * 0.46;
      const scale = Math.min(state.width, state.height) * 0.2;
      ctx.clearRect(0, 0, state.width, state.height);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.00025);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = 0.78;

      for (let i = 0; i < 4; i += 1) {
         ctx.rotate(Math.PI / 4);
         ctx.strokeRect(-scale * 0.42, -scale * 0.42, scale * 0.84, scale * 0.84);
      }

      ctx.globalAlpha = 0.42;
      for (let i = 0; i < 34; i += 1) {
         const angle = i * 0.48 + time * 0.00035;
         const r = scale * (0.65 + (i % 5) * 0.12);
         ctx.beginPath();
         ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r * 0.42, 2, 0, Math.PI * 2);
         ctx.fillStyle = accent;
         ctx.fill();
      }

      ctx.restore();
      canvas.dataset.frames = String(Math.floor(time / 16));
      requestAnimationFrame(frame);
   }

   resize();
   window.addEventListener("resize", resize);
   requestAnimationFrame(frame);
}

async function initHeroModel() {
   if (!canvas) return;

   let THREE;
   try {
      THREE = await import("https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js");
   } catch (error) {
      drawFallbackModel();
      return;
   }

   const scene = new THREE.Scene();
   const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
   const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
   });

   renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
   renderer.setClearColor(0x000000, 0);
   canvas.dataset.renderer = "three";

   const pointer = new THREE.Vector2();
   const campus = new THREE.Group();
   const ringGroup = new THREE.Group();
   const connectionGroup = new THREE.Group();
   const buildingGroup = new THREE.Group();
   const accent = new THREE.Color(cssColor("--ai-blue") || "#C3E3EB");
   const navy = new THREE.Color("#031142");
   const silver = new THREE.Color("#edf2f7");

   scene.add(campus);
   campus.add(ringGroup, connectionGroup, buildingGroup);

   const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
   const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
   const rimLight = new THREE.PointLight(accent, 4.2, 18);
   keyLight.position.set(-3, 4, 6);
   rimLight.position.set(3.2, 1.4, 2.8);
   scene.add(ambientLight, keyLight, rimLight);

   const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: silver,
      metalness: 0.18,
      roughness: 0.2,
      transmission: 0.26,
      transparent: true,
      opacity: 0.8,
      emissive: accent,
      emissiveIntensity: 0.1,
   });

   const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: accent,
      metalness: 0.5,
      roughness: 0.15,
      emissive: accent,
      emissiveIntensity: 0.32,
      transparent: true,
      opacity: 0.92,
   });

   const navyMaterial = new THREE.MeshStandardMaterial({
      color: navy,
      metalness: 0.28,
      roughness: 0.38,
      emissive: navy,
      emissiveIntensity: 0.08,
   });

   const lineMaterial = new THREE.LineBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.54,
   });

   const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.72, 0), coreMaterial);
   core.rotation.z = Math.PI / 4;
   campus.add(core);

   const coreEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(core.geometry),
      new THREE.LineBasicMaterial({ color: silver, transparent: true, opacity: 0.82 })
   );
   core.add(coreEdges);

   const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(2.55, 2.95, 0.08, 6),
      new THREE.MeshStandardMaterial({
         color: navy,
         metalness: 0.46,
         roughness: 0.22,
         transparent: true,
         opacity: 0.64,
      })
   );
   platform.position.y = -1.05;
   platform.rotation.y = Math.PI / 6;
   campus.add(platform);

   const buildingData = [
      [-1.65, -0.64, 0.52, 0.42, 1.3],
      [-0.85, -0.7, -0.24, 0.36, 0.98],
      [0.92, -0.68, 0.34, 0.4, 1.15],
      [1.72, -0.72, -0.45, 0.38, 0.84],
      [-0.05, -0.58, 0.92, 0.48, 1.5],
   ];

   buildingData.forEach(([x, y, z, width, height], index) => {
      const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, width), glassMaterial);
      building.position.set(x, y + height / 2, z);
      buildingGroup.add(building);

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(building.geometry), lineMaterial.clone());
      edges.material.opacity = 0.42 + index * 0.04;
      building.add(edges);

      const connection = new THREE.BufferGeometry().setFromPoints([
         new THREE.Vector3(x, y + height + 0.05, z),
         new THREE.Vector3(0, 0.25, 0),
      ]);
      connectionGroup.add(new THREE.Line(connection, lineMaterial.clone()));
   });

   for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(
         new THREE.TorusGeometry(1.2 + i * 0.45, 0.008, 8, 128),
         new THREE.MeshBasicMaterial({
            color: accent,
            transparent: true,
            opacity: 0.4 - i * 0.08,
         })
      );
      ring.rotation.x = Math.PI / 2 + i * 0.34;
      ring.rotation.y = i * 0.66;
      ringGroup.add(ring);
   }

   const particleCount = 180;
   const positions = new Float32Array(particleCount * 3);
   for (let i = 0; i < particleCount; i += 1) {
      const radius = 1.4 + Math.random() * 2.8;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.8;
      positions[i * 3 + 2] = Math.sin(angle) * radius * 0.58;
   }

   const particleGeometry = new THREE.BufferGeometry();
   particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
   const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
         color: accent,
         size: 0.022,
         transparent: true,
         opacity: 0.72,
         depthWrite: false,
      })
   );
   campus.add(particles);

   const grid = new THREE.GridHelper(6.5, 24, accent, accent);
   grid.material.transparent = true;
   grid.material.opacity = 0.14;
   grid.position.y = -1.1;
   campus.add(grid);

   camera.position.set(0, 0.55, 7.2);
   campus.position.set(1.65, -0.1, 0);
   campus.rotation.set(-0.12, -0.36, 0.04);

   function resize() {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);

      if (width < 760) {
         campus.position.set(0.2, -0.4, 0);
         campus.scale.setScalar(0.74);
      } else {
         campus.position.set(1.65, -0.1, 0);
         campus.scale.setScalar(1);
      }
   }

   function syncThemeColors() {
      accent.set(cssColor("--ai-blue") || "#C3E3EB");
      coreMaterial.color.copy(accent);
      coreMaterial.emissive.copy(accent);
      rimLight.color.copy(accent);
      lineMaterial.color.copy(accent);
      ringGroup.children.forEach((ring) => ring.material.color.copy(accent));
      particles.material.color.copy(accent);
      grid.material.color.copy(accent);
   }

   let frameCount = 0;

   function sampleRenderedPixels() {
      const gl = renderer.getContext();
      const sampleWidth = Math.min(260, renderer.domElement.width);
      const sampleHeight = Math.min(260, renderer.domElement.height);
      const x = Math.max(0, Math.floor(renderer.domElement.width * 0.66 - sampleWidth / 2));
      const y = Math.max(0, Math.floor(renderer.domElement.height * 0.48 - sampleHeight / 2));
      const pixels = new Uint8Array(sampleWidth * sampleHeight * 4);
      let nonBlank = 0;

      gl.readPixels(x, y, sampleWidth, sampleHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      for (let i = 3; i < pixels.length; i += 4) {
         if (pixels[i] > 0) nonBlank += 1;
      }

      canvas.dataset.nonblankPixels = String(nonBlank);
   }

   function animate(time) {
      const t = time * 0.001;
      frameCount += 1;
      campus.rotation.y = -0.36 + Math.sin(t * 0.45) * 0.16 + pointer.x * 0.12;
      campus.rotation.x = -0.12 + Math.sin(t * 0.35) * 0.05 - pointer.y * 0.08;
      core.rotation.y += 0.008;
      core.rotation.x += 0.004;
      ringGroup.children.forEach((ring, index) => {
         ring.rotation.z = t * (0.18 + index * 0.08);
         ring.rotation.y += 0.002 + index * 0.001;
      });
      particles.rotation.y = -t * 0.06;
      buildingGroup.children.forEach((building, index) => {
         building.position.y += Math.sin(t * 1.2 + index) * 0.0008;
      });
      renderer.render(scene, camera);
      canvas.dataset.frames = String(frameCount);
      if (frameCount % 5 === 0) {
         sampleRenderedPixels();
      }
      requestAnimationFrame(animate);
   }

   window.addEventListener("resize", resize);
   window.addEventListener("pointermove", (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
   });

   const themeObserver = new MutationObserver(syncThemeColors);
   themeObserver.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });

   resize();
   syncThemeColors();
   requestAnimationFrame(animate);
}

addRevealAnimations();
addParallaxMotion();
initHeroModel();
