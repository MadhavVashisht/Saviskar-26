"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// 5 interrelated sequential moments of the SAME stadium venue with progressive fireworks (optimized WebP)
const TEXTURE_PATHS = [
  "/images/concert-stadium.webp",             // 0. Hero stadium scene (opening crowd & stage lights)
  "/images/firework-launch.webp",             // 1. Fireworks rocket launch sequence over stage roof
  "/images/scene-realms-stage.webp",          // 2. Fireworks blooming in magenta & purple above the stage
  "/images/scene-starnight-show.webp",        // 3. Concert lasers and golden/purple fireworks canopy
  "/images/scene-finale-celebration.webp",    // 4. Grand pyrotechnic golden cascade finale
];

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uScrollSpeed;
  uniform float uProgress;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Theatrical amphitheater IMAX curve proportioned to the aspect-fitted mesh
    float curveX = pow(abs(uv.x - 0.5) * 1.3, 2.0) * 10.0;
    float curveY = pow(abs(uv.y - 0.5) * 1.1, 2.0) * 4.0;
    pos.z -= (curveX + curveY);

    // Subtle acoustic wave vibration across the stadium
    float wave = sin(uv.x * 6.28 + uTime * 0.8) * cos(uv.y * 6.28 + uTime * 0.6) * 0.35;
    pos.z += wave;

    vPosition = pos;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTex0;
  uniform sampler2D uTex1;
  uniform sampler2D uTex2;
  uniform sampler2D uTex3;
  uniform sampler2D uTex4;
  uniform float uProgress;
  uniform float uScrollSpeed;
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying vec3 vPosition;

  // Sample with chromatic lens dispersion during scroll momentum
  vec4 sampleChromatic(sampler2D tex, vec2 uv, float aberration) {
    if (aberration <= 0.0001) {
      return texture2D(tex, uv);
    }
    vec2 offset = (uv - 0.5) * aberration;
    float r = texture2D(tex, uv + offset * 1.1).r;
    float g = texture2D(tex, uv).g;
    float b = texture2D(tex, uv - offset * 1.1).b;
    float a = texture2D(tex, uv).a;
    return vec4(r, g, b, a);
  }

  // Cinematic cross-dissolve with pyrotechnic luminosity preservation
  vec4 videoBlend(vec4 fromCol, vec4 toCol, float t) {
    vec4 base = mix(fromCol, toCol, t);
    float burst = sin(t * 3.14159265) * 0.14;
    vec3 bloom = max(vec3(0.0), toCol.rgb - 0.45) * burst;
    return vec4(base.rgb + bloom, base.a);
  }

  void main() {
    // The mesh is already aspect-fitted to cover the frustum with 5% bleed for mouse parallax
    vec2 uv = vUv;

    // Smooth tactile mouse parallax on UV coordinates
    uv += (uMouse * 0.008) * (1.0 - length(uv - 0.5));

    // Chromatic dispersion during camera movement (strictly 0.0 when stationary for tack-sharp 8K)
    float aberration = clamp(abs(uScrollSpeed) * 0.015, 0.0, 0.008);

    // Continuous smooth transition across the 5 interrelated moments of the fireworks sequence
    float p = clamp(uProgress * 4.0, 0.0, 4.0);
    vec4 col = vec4(0.0);

    if (p < 1.0) {
      float t = smoothstep(0.0, 1.0, p);
      vec4 c0 = sampleChromatic(uTex0, uv, aberration);
      vec4 c1 = sampleChromatic(uTex1, uv, aberration);
      col = videoBlend(c0, c1, t);
    } else if (p < 2.0) {
      float t = smoothstep(0.0, 1.0, p - 1.0);
      vec4 c1 = sampleChromatic(uTex1, uv, aberration);
      vec4 c2 = sampleChromatic(uTex2, uv, aberration);
      col = videoBlend(c1, c2, t);
    } else if (p < 3.0) {
      float t = smoothstep(0.0, 1.0, p - 2.0);
      vec4 c2 = sampleChromatic(uTex2, uv, aberration);
      vec4 c3 = sampleChromatic(uTex3, uv, aberration);
      col = videoBlend(c2, c3, t);
    } else {
      float t = smoothstep(0.0, 1.0, p - 3.0);
      vec4 c3 = sampleChromatic(uTex3, uv, aberration);
      vec4 c4 = sampleChromatic(uTex4, uv, aberration);
      col = videoBlend(c3, c4, t);
    }

    // Dynamic Concert Stage Lighting Model
    // 1. Twilight & Dusk Haze
    vec3 duskTint = vec3(0.52, 0.25, 0.88) * (1.0 - uProgress * 0.5) * 0.15;

    // 2. High-energy concert spotlights
    float concertIntensity = smoothstep(0.2, 0.7, uProgress) * (1.0 - smoothstep(0.85, 1.0, uProgress));
    float spotBeam1 = pow(max(0.0, 1.0 - distance(uv, vec2(0.35 + sin(uTime * 0.7) * 0.12, 0.65))), 3.5);
    float spotBeam2 = pow(max(0.0, 1.0 - distance(uv, vec2(0.65 + cos(uTime * 0.6) * 0.12, 0.60))), 3.5);
    vec3 spotViolet = vec3(0.65, 0.28, 1.0) * spotBeam1 * concertIntensity * 0.32;
    vec3 spotCyan = vec3(0.18, 0.72, 1.0) * spotBeam2 * concertIntensity * 0.26;

    // 3. Finale pyrotechnic glow
    float finaleGlow = smoothstep(0.7, 1.0, uProgress);
    vec3 goldenSparks = vec3(1.0, 0.7, 0.25) * finaleGlow * 0.20;

    // Master unified lighting integration
    col.rgb = col.rgb * 0.92 + duskTint + spotViolet + spotCyan + goldenSparks;

    // Gentle theatrical concert vignette (non-destructive)
    float distFromCenter = distance(uv, vec2(0.5, 0.5));
    float vignette = smoothstep(0.92, 0.30, distFromCenter);
    col.rgb *= vignette;

    // Soft edge mask
    float verticalMask = smoothstep(0.0, 0.05, uv.y) * smoothstep(1.0, 0.95, uv.y);
    col.rgb *= (0.85 + 0.15 * verticalMask);

    gl_FragColor = vec4(col.rgb, 0.92);
  }
`;

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl") ||
        canvas.getContext("webgl2"))
    );
  } catch {
    return false;
  }
}

export default function ScrollEngine3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasWebGLError, setHasWebGLError] = useState(() => !checkWebGLSupport());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;
    let isDisposed = false;

    // Detect device performance tier
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const isLowPower =
      isMobile ||
      (typeof navigator !== "undefined" &&
        navigator.hardwareConcurrency != null &&
        navigator.hardwareConcurrency <= 4);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isLowPower,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      console.warn("WebGL initialization failed, falling back to atmospheric poster background:", e);
      requestAnimationFrame(() => {
        setHasWebGLError(true);
      });
      return;
    }

    const gl = renderer.getContext();
    if (!gl) {
      requestAnimationFrame(() => {
        setHasWebGLError(true);
      });
      return;
    }

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animationFrameId);
    };
    const handleContextRestored = () => {
      // Context restored
    };
    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

    const maxPixelRatio = isLowPower ? 1.25 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    // Scene & Perspective Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.005);

    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const cameraDist = 80;
    camera.position.set(0, 0, cameraDist);

    // Texture Loader with Anisotropic Filtering
    const textureLoader = new THREE.TextureLoader();
    const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), isLowPower ? 2 : 8);

    const textures: THREE.Texture[] = TEXTURE_PATHS.map((path) => {
      const tex = textureLoader.load(path);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    });

    // Compute exact frustum fit for the 16:9 8K stadium scene (eliminates excessive zoom!)
    const computeFrustumFit = (cam: THREE.PerspectiveCamera, dist: number, imgAspect = 7680 / 4286) => {
      const vFovRad = (cam.fov * Math.PI) / 180;
      const frustumHeight = 2.0 * Math.tan(vFovRad / 2.0) * dist;
      const frustumWidth = frustumHeight * cam.aspect;
      const bleed = 1.05; // 5% bleed allows comfortable mouse parallax without exposing edges
      let width: number;
      let height: number;
      if (cam.aspect > imgAspect) {
        width = frustumWidth * bleed;
        height = width / imgAspect;
      } else {
        height = frustumHeight * bleed;
        width = height * imgAspect;
      }
      return { width, height };
    };

    // 3D Curved Stadium Amphitheater Mesh (Aspect-fitted to viewport frustum)
    const meshGeometry = new THREE.PlaneGeometry(1, 1, 64, 64);
    const meshMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTex0: { value: textures[0] },
        uTex1: { value: textures[1] },
        uTex2: { value: textures[2] },
        uTex3: { value: textures[3] },
        uTex4: { value: textures[4] },
        uProgress: { value: 0.0 },
        uScrollSpeed: { value: 0.0 },
        uTime: { value: 0.0 },
        uAspect: { value: window.innerWidth / window.innerHeight },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      transparent: true,
      depthWrite: false,
    });

    const stadiumMesh = new THREE.Mesh(meshGeometry, meshMaterial);
    const initialFit = computeFrustumFit(camera, cameraDist);
    stadiumMesh.scale.set(initialFit.width, initialFit.height, 1);
    stadiumMesh.position.set(0, 0, 0);
    scene.add(stadiumMesh);

    // 3D Floating Embers & Stage Dust Motes in Depth
    const particleCount = isLowPower ? 300 : 750;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleOriginals = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 170;
      const y = (Math.random() - 0.5) * 110;
      const z = (Math.random() - 0.5) * 90 + 25;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      particleOriginals[i * 3] = x;
      particleOriginals[i * 3 + 1] = y;
      particleOriginals[i * 3 + 2] = z;

      particleSpeeds[i] = 1.2 + Math.random() * 1.8;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    // Generate soft circular glow sprite for glowing embers
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const ctx = spriteCanvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(245, 230, 255, 1)");
      grad.addColorStop(0.3, "rgba(168, 85, 247, 0.8)");
      grad.addColorStop(0.7, "rgba(124, 58, 237, 0.2)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(spriteCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 2.2,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.72,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 3D Moving Sweeper Lasers (Ceiling Beams)
    const laserGroup = new THREE.Group();
    const laserMaterial1 = new THREE.LineBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.4,
    });
    const laserMaterial2 = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    });

    const laserLines: THREE.Line[] = [];
    for (let i = 0; i < 8; i++) {
      const pts = [
        new THREE.Vector3(-90 + i * 26, 50, -25),
        new THREE.Vector3((i - 3.5) * 35, -50, 45),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(
        lineGeo,
        i % 2 === 0 ? laserMaterial1 : laserMaterial2
      );
      laserLines.push(line);
      laserGroup.add(line);
    }
    scene.add(laserGroup);

    // Physical Stage Spotlights & Ambient Glow
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const spotViolet = new THREE.SpotLight(0xa855f7, 3.2, 220, Math.PI / 4, 0.55);
    spotViolet.position.set(-45, 55, 65);
    scene.add(spotViolet);

    const spotCyan = new THREE.SpotLight(0x06b6d4, 2.6, 220, Math.PI / 4, 0.55);
    spotCyan.position.set(45, -35, 65);
    scene.add(spotCyan);

    // Tracking state & Accessibility
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let targetProgress = 0;
    let currentProgress = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let lastScrollY = window.scrollY;
    let scrollSpeed = 0;

    const handleScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const currentY = window.scrollY;
      targetProgress = Math.max(0, Math.min(1, currentY / maxScroll));

      if (prefersReducedMotion) {
        scrollSpeed = 0;
      } else {
        scrollSpeed = (currentY - lastScrollY) * 0.0025;
      }
      lastScrollY = currentY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleResize = () => {
      if (!canvas || isDisposed) return;
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      const fit = computeFrustumFit(camera, cameraDist);
      stadiumMesh.scale.set(fit.width, fit.height, 1);

      meshMaterial.uniforms.uAspect.value = width / height;

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);

    handleScroll();

    // Animation Loop with modern THREE.Timer (replacing deprecated THREE.Clock)
    const timer = new THREE.Timer();

    const animate = () => {
      if (isDisposed) return;

      timer.update();
      const delta = timer.getDelta();
      const elapsedTime = timer.getElapsed();

      // Smooth LERP Dampening (immediate if reduced motion requested)
      if (prefersReducedMotion) {
        currentProgress = targetProgress;
        currentMouseX = 0;
        currentMouseY = 0;
        scrollSpeed = 0;
      } else {
        currentProgress += (targetProgress - currentProgress) * 0.085;
        currentMouseX += (targetMouseX - currentMouseX) * 0.06;
        currentMouseY += (targetMouseY - currentMouseY) * 0.06;
        scrollSpeed *= 0.88;
      }

      // Update Shader Uniforms
      meshMaterial.uniforms.uProgress.value = currentProgress;
      meshMaterial.uniforms.uScrollSpeed.value = scrollSpeed;
      meshMaterial.uniforms.uTime.value = prefersReducedMotion ? 0 : elapsedTime;
      meshMaterial.uniforms.uMouse.value.set(currentMouseX, currentMouseY);

      // --- Steady Theatrical Concert-Cam Trajectory (eliminates excessive zoom!) ---
      // Camera distance remains steady with only a gentle 4-unit push-in, perfectly framing the whole stadium bowl
      const targetZ = cameraDist - currentProgress * 4.0;
      // Camera pans gently to follow the rising pyrotechnics in the sky
      const targetY = -currentProgress * 2.0;
      const targetPitch = currentProgress * 0.04;

      camera.position.z = targetZ + currentMouseY * 1.5;
      camera.position.y = targetY - currentMouseY * 2.0;
      camera.position.x = currentMouseX * 3.0;

      // Perspective tilt with mouse and flight path
      camera.rotation.y = -currentMouseX * 0.030;
      camera.rotation.x = targetPitch + currentMouseY * 0.024;

      // Animate 3D Particles with Spatial Parallax
      const positions = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += delta * particleSpeeds[i];
        positions[i3] += Math.sin(elapsedTime * 0.6 + i) * 0.03;

        if (positions[i3 + 1] > 65) {
          positions[i3 + 1] = -65;
          positions[i3] = particleOriginals[i3] + (Math.random() - 0.5) * 20;
        }

        positions[i3 + 2] += scrollSpeed * 22.0;
        if (positions[i3 + 2] > 95) positions[i3 + 2] = 15;
        if (positions[i3 + 2] < 15) positions[i3 + 2] = 95;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Animate Sweeper Lasers
      laserLines.forEach((line, idx) => {
        const osc = Math.sin(elapsedTime * 1.1 + idx * 0.7);
        line.rotation.z = osc * 0.18;
        line.rotation.y = Math.cos(elapsedTime * 0.8 + idx) * 0.09;
      });

      // Orbit Spotlights
      spotViolet.position.x = -45 + Math.sin(elapsedTime * 0.75) * 18;
      spotViolet.position.y = 55 + Math.cos(elapsedTime * 0.6) * 12;
      spotCyan.position.x = 45 + Math.cos(elapsedTime * 0.85) * 18;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      // Cleanup
      timer.dispose();
      meshGeometry.dispose();
      meshMaterial.dispose();
      textures.forEach((t) => t.dispose());
      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
      laserLines.forEach((l) => l.geometry.dispose());
      laserMaterial1.dispose();
      laserMaterial2.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-black"
    >
      {hasWebGLError ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
          style={{ backgroundImage: "url('/images/concert-stadium.webp')" }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          className="h-full w-full object-cover"
        />
      )}

      {/* Subtle atmospheric vignette and stage contrast */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/35" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.20)_75%,#000000_100%)]" />
    </div>
  );
}
