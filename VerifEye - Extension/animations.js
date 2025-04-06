/**
 * animations.js - Handles dynamic animations for Web Risk Scanner
 * Creates particle effects and initializes animations
 */

// Create and manage particle animations
class ParticleSystem {
  constructor(options = {}) {
    this.options = {
      container: document.body,
      count: options.count || 20,
      minSize: options.minSize || 2,
      maxSize: options.maxSize || 8,
      minDuration: options.minDuration || 15,
      maxDuration: options.maxDuration || 30,
      minDrift: options.minDrift || -100,
      maxDrift: options.maxDrift || 100,
      zIndex: options.zIndex || -1
    };
    
    this.init();
  }
  
  init() {
    // Create container for particles
    this.particlesContainer = document.createElement('div');
    this.particlesContainer.className = 'particles-container';
    this.particlesContainer.style.zIndex = this.options.zIndex;
    
    // Append container to the specified element or body
    if (typeof this.options.container === 'string') {
      this.container = document.querySelector(this.options.container);
    } else {
      this.container = this.options.container;
    }
    
    this.container.appendChild(this.particlesContainer);
    
    // Create particles
    this.createParticles();
    
    // Start animation loop
    this.animate();
  }
  
  createParticles() {
    for (let i = 0; i < this.options.count; i++) {
      this.createParticle();
    }
  }
  
  createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random size
    const size = Math.random() * (this.options.maxSize - this.options.minSize) + this.options.minSize;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random position
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    
    // Random animation duration
    const duration = Math.random() * (this.options.maxDuration - this.options.minDuration) + this.options.minDuration;
    particle.style.setProperty('--particle-duration', `${duration}s`);
    
    // Random drift (horizontal movement)
    const drift = Math.random() * (this.options.maxDrift - this.options.minDrift) + this.options.minDrift;
    particle.style.setProperty('--particle-drift', `${drift}px`);
    
    // Add to container
    this.particlesContainer.appendChild(particle);
    
    // Remove and recreate particle after animation completes
    setTimeout(() => {
      if (particle.parentNode === this.particlesContainer) {
        this.particlesContainer.removeChild(particle);
        this.createParticle();
      }
    }, duration * 1000);
  }
  
  animate() {
    // This method can be extended for more complex animations
    requestAnimationFrame(() => this.animate());
  }
  
  // Add more particles
  addParticles(count) {
    for (let i = 0; i < count; i++) {
      this.createParticle();
    }
    this.options.count += count;
  }
  
  // Remove all particles and stop
  destroy() {
    this.particlesContainer.remove();
  }
}

// Initialize entrance animations for elements
function initEntranceAnimations() {
  // Add fade-in class to elements that should animate in
  const animateElements = document.querySelectorAll('.animate-on-load');
  animateElements.forEach(el => {
    el.classList.add('fade-in');
  });
  
  // Add staggered animations to lists and grids
  const staggerContainers = document.querySelectorAll('.stagger-on-load');
  staggerContainers.forEach(container => {
    container.classList.add('stagger-fade-in');
  });
}

// Initialize hover animations
function initHoverAnimations() {
  // Add hover-lift class to cards
  const cards = document.querySelectorAll('.card, .modern-card');
  cards.forEach(card => {
    if (!card.classList.contains('hover-lift')) {
      card.classList.add('hover-lift');
    }
  });
  
  // Add glow-focus class to inputs
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    if (!input.classList.contains('glow-focus')) {
      input.classList.add('glow-focus');
    }
  });
  
  // Add ripple effect to buttons
  const buttons = document.querySelectorAll('button:not(.no-ripple)');
  buttons.forEach(button => {
    if (!button.classList.contains('ripple')) {
      button.classList.add('ripple');
    }
  });
}

// Initialize background effects
function initBackgroundEffects() {
  // Add grid background to containers
  const gridContainers = document.querySelectorAll('.container, .dashboard-main');
  gridContainers.forEach(container => {
    if (!container.classList.contains('grid-bg')) {
      container.classList.add('grid-bg');
    }
  });
  
  // Add gradient background to headers
  const headers = document.querySelectorAll('.header-container, .dashboard-header');
  headers.forEach(header => {
    if (!header.classList.contains('gradient-bg')) {
      header.classList.add('gradient-bg');
    }
  });
  
  // Add digital noise effect to body
  document.body.classList.add('digital-noise');
}

// Initialize all animations
function initAnimations() {
  // Create particle system
  const particles = new ParticleSystem({
    count: 25,
    minSize: 2,
    maxSize: 6,
    minDuration: 20,
    maxDuration: 30
  });
  
  // Initialize other animations
  initEntranceAnimations();
  initHoverAnimations();
  initBackgroundEffects();
  
  // Store particle system in window for access
  window.particleSystem = particles;
  
  // Add boot sequence animation to body
  document.body.classList.add('boot-sequence');
}

// Run animations when DOM is loaded
document.addEventListener('DOMContentLoaded', initAnimations);

// Export functions for use in other scripts
window.Animations = {
  ParticleSystem,
  initEntranceAnimations,
  initHoverAnimations,
  initBackgroundEffects,
  initAnimations
};