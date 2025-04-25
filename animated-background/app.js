// Initialize Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg-canvas'),
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Create particle system
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 5000;
const posArray = new Float32Array(particlesCount * 3);
const scaleArray = new Float32Array(particlesCount);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100;
}

for(let i = 0; i < particlesCount; i++) {
    scaleArray[i] = Math.random();
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));

// Custom shader material
const particlesMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        attribute float scale;
        varying vec3 vColor;
        
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = scale * 2.0 * (300.0 / -mvPosition.z);
            vColor = vec3(scale/2.0 + 0.5, scale/3.0 + 0.3, 0.8);
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        
        void main() {
            float strength = distance(gl_PointCoord, vec2(0.5));
            strength = 1.0 - strength;
            strength = pow(strength, 3.0);
            
            vec3 color = mix(vec3(0.0), vColor, strength);
            gl_FragColor = vec4(color, strength);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Mouse movement effect
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2);
    mouseY = (event.clientY - window.innerHeight / 2);
});

// Touch movement
document.addEventListener('touchmove', (event) => {
    event.preventDefault();
    mouseX = (event.touches[0].clientX - window.innerWidth / 2);
    mouseY = (event.touches[0].clientY - window.innerHeight / 2);
}, { passive: false });

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth mouse movement
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    
    particlesMesh.rotation.x += 0.01 * (targetY - particlesMesh.rotation.x);
    particlesMesh.rotation.y += 0.01 * (targetX - particlesMesh.rotation.y);
    
    // Wave animation
    const positions = particlesGeometry.attributes.position.array;
    for(let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        positions[i + 1] = y + Math.sin(elapsedTime + x/10) * 0.1;
    }
    particlesGeometry.attributes.position.needsUpdate = true;

    // Rotate entire scene
    scene.rotation.y = elapsedTime * 0.05;
    
    renderer.render(scene, camera);
}

animate();

// Add post-processing glitch effect
const glitchText = document.querySelector('.glitch');
setInterval(() => {
    if(Math.random() > 0.95) {
        glitchText.style.textShadow = `
            ${Math.random() * 10}px ${Math.random() * 10}px ${Math.random() * 30}px rgba(0,255,255,0.8),
            ${-Math.random() * 10}px ${-Math.random() * 10}px ${Math.random() * 30}px rgba(255,0,255,0.8)
        `;
        setTimeout(() => {
            glitchText.style.textShadow = '';
        }, 50);
    }
}, 50); 