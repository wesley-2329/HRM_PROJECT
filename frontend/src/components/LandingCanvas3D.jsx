import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const LandingCanvas3D = ({ scrollProgress }) => {
  const mountRef = useRef(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // --- 1. Scene Setup ---
    const scene = new THREE.Scene();
    
    // Warm light theme fog matching the dashboard background (#faf8f5)
    scene.fog = new THREE.FogExp2(0xfaf8f5, 0.025);

    const camera = new THREE.PerspectiveCamera(
      45,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    // Position camera for a tilted grid overview perspective
    camera.position.set(0, 3, 11);
    camera.lookAt(0, -1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    // --- 2. Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    // Dynamic point light that follows the mouse (Cyan glow highlight)
    const cursorPointLight = new THREE.PointLight(0x00f2ff, 5.0, 15);
    scene.add(cursorPointLight);

    // Secondary colored light (Pink/Magenta) for color balance
    const pinkLight = new THREE.DirectionalLight(0xdb2777, 0.6);
    pinkLight.position.set(-5, 6, 2);
    scene.add(pinkLight);

    // Primary Indigo directional light
    const indigoLight = new THREE.DirectionalLight(0x4f46e5, 0.7);
    indigoLight.position.set(5, 6, 2);
    scene.add(indigoLight);

    // --- 3. Interactive Floating Attractor Core ---
    // A small glowing sphere that follows the cursor and hovers over the grid
    const coreGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f2ff,
      transparent: true,
      opacity: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // --- 4. Checkerboard Grid Floor ---
    // Tilted grid helper representing the board base, slow rotating
    const gridHelper = new THREE.GridHelper(26, 26, 0xcbd5e1, 0xcbd5e1);
    gridHelper.position.set(0, -2.4, -1);
    gridHelper.rotation.x = Math.PI / 24;
    scene.add(gridHelper);

    // --- 5. Mouse Coordinates Track ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- 6. Resize Event ---
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- 7. Animation & Physics Loop ---
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Project mouse coordinates into 3D grid space
      const lightX = mouse.x * 5.2;
      const lightY = -2.25 + mouse.y * 0.4; // Hover slightly above grid
      const lightZ = mouse.y * 4.5;

      // Position the glowing point light and core indicator sphere
      cursorPointLight.position.set(lightX, lightY + 0.3, lightZ);
      coreMesh.position.set(lightX, lightY + 0.1, lightZ);

      // Rotate the grid floor slowly (gravity drift)
      gridHelper.rotation.y = elapsedTime * 0.03;

      // React to scroll progress (slow camera translation/zoom)
      const scroll = scrollRef.current;
      camera.position.z = 11 - scroll * 2.0;
      camera.position.y = 3 - scroll * 1.0;
      camera.lookAt(0, -1 - scroll * 0.3, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement.parentNode) {
        currentMount.removeChild(renderer.domElement);
      }
      // Clean up geometries and materials
      coreGeo.dispose();
      coreMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="webgl-canvas-container"
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default LandingCanvas3D;
