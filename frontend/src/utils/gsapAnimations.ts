import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export class GSAPAnimations {
  // Hero section animations
  static animateHeroSection() {
    const tl = gsap.timeline();
    
    // Animate background waves
    tl.fromTo('.hero-bg-wave', 
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 0.1, duration: 2, ease: 'power2.out' }
    )
    .fromTo('.hero-bg-wave-2', 
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 0.05, duration: 2.5, ease: 'power2.out' }, '-=1.5'
    );

    // Animate text with split reveal
    const heroTitle = new SplitType('.hero-title', { types: 'chars' });
    tl.fromTo(heroTitle.chars, 
      { y: 100, opacity: 0, rotationX: 90 },
      { y: 0, opacity: 1, rotationX: 0, duration: 1, stagger: 0.02, ease: 'back.out(1.7)' }
    );

    // Animate subtitle
    tl.fromTo('.hero-subtitle', 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }, '-=0.5'
    );

    // Animate buttons
    tl.fromTo('.hero-buttons', 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.3'
    );

    // Animate icon with glow effect
    tl.fromTo('.hero-icon', 
      { scale: 0, rotation: 180 },
      { scale: 1, rotation: 0, duration: 1.2, ease: 'back.out(1.7)' }, '-=0.8'
    );

    // Continuous glow animation
    gsap.to('.hero-icon', {
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });
  }

  // Feature cards animations
  static animateFeatureCards() {
    gsap.utils.toArray('.feature-card').forEach((card: any, index) => {
      gsap.fromTo(card, 
        { y: 100, opacity: 0, scale: 0.8 },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1, 
          duration: 0.8, 
          delay: index * 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Hover animations
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
        gsap.to(card.querySelector('.card-icon'), { 
          rotation: 360, 
          duration: 0.6, 
          ease: 'power2.out' 
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, { scale: 1, duration: 0.3, ease: 'power2.out' });
        gsap.to(card.querySelector('.card-icon'), { 
          rotation: 0, 
          duration: 0.6, 
          ease: 'power2.out' 
        });
      });
    });
  }

  // Scroll-triggered animations
  static animateOnScroll() {
    // Parallax effect for background elements
    gsap.utils.toArray('.parallax-bg').forEach((element: any) => {
      gsap.to(element, {
        yPercent: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    // Text reveal animations
    gsap.utils.toArray('.text-reveal').forEach((element: any) => {
      const text = new SplitType(element, { types: 'lines' });
      gsap.fromTo(text.lines, 
        { y: 100, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1, 
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }

  // Form input animations
  static animateFormInputs() {
    gsap.utils.toArray('.animated-input').forEach((input: any) => {
      input.addEventListener('focus', () => {
        gsap.to(input, { 
          scale: 1.02, 
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
          duration: 0.3 
        });
        gsap.to(input.parentElement.querySelector('.input-glow'), {
          opacity: 1,
          scale: 1.1,
          duration: 0.3
        });
      });

      input.addEventListener('blur', () => {
        gsap.to(input, { 
          scale: 1, 
          boxShadow: '0 0 0px rgba(59, 130, 246, 0)',
          duration: 0.3 
        });
        gsap.to(input.parentElement.querySelector('.input-glow'), {
          opacity: 0,
          scale: 1,
          duration: 0.3
        });
      });
    });
  }

  // Progress ring animation
  static animateProgressRing(progress: number, duration: number = 2) {
    const ring = document.querySelector('.progress-ring');
    if (!ring) return;

    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    gsap.set(ring, {
      strokeDasharray: strokeDasharray,
      strokeDashoffset: circumference
    });

    gsap.to(ring, {
      strokeDashoffset: strokeDashoffset,
      duration: duration,
      ease: 'power2.out'
    });
  }

  // Result display animations
  static animateResult(result: 'safe' | 'fraud' | 'suspicious') {
    const resultElement = document.querySelector('.result-display');
    if (!resultElement) return;

    const colors = {
      safe: '#10B981',
      fraud: '#EF4444',
      suspicious: '#F59E0B'
    };

    gsap.fromTo(resultElement, 
      { scale: 0, opacity: 0 },
      { 
        scale: 1, 
        opacity: 1, 
        duration: 0.8, 
        ease: 'back.out(1.7)' 
      }
    );

    gsap.to(resultElement, {
      backgroundColor: colors[result],
      boxShadow: `0 0 30px ${colors[result]}40`,
      duration: 0.5,
      delay: 0.3
    });
  }

  // Page transition animations
  static pageTransitionIn() {
    const tl = gsap.timeline();
    
    tl.fromTo('.page-content', 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
    );

    return tl;
  }

  static pageTransitionOut() {
    const tl = gsap.timeline();
    
    tl.to('.page-content', 
      { y: -50, opacity: 0, duration: 0.5, ease: 'power2.in' }
    );

    return tl;
  }

  // Initialize all animations
  static init() {
    this.animateHeroSection();
    this.animateFeatureCards();
    this.animateOnScroll();
    this.animateFormInputs();
  }
}
