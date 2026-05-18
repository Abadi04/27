/**
 * تحسينات تفاعلية اختيارية للواجهة الرئيسية
 * يمكن إضافة هذا الملف بعد app.js للحصول على تأثيرات إضافية
 * 
 * للاستخدام: أضف هذا السطر في index.html بعد app.js
 * <script src="enhancements.js"></script>
 */

(function() {
  'use strict';

  // ========================================
  // تأثير Parallax للشعار
  // ========================================
  
  function initParallax() {
    const heroMark = document.querySelector('.hero-mark');
    if (!heroMark) return;

    heroMark.setAttribute('data-parallax', '');

    document.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      
      heroMark.style.setProperty('--parallax-y', `${y}px`);
      heroMark.style.transform = `translateY(${y}px) translateX(${x}px)`;
    });
  }

  // ========================================
  // تأثير Ripple للأزرار
  // ========================================
  
  function initRipple() {
    const buttons = document.querySelectorAll('.start-btn, .viral-action, .copy-code-btn, .copy-link-btn');
    
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // ========================================
  // تأثير Typing للعنوان
  // ========================================
  
  function initTypingEffect() {
    const tagline = document.querySelector('.hero-tagline');
    if (!tagline) return;

    const text = tagline.textContent;
    tagline.textContent = '';
    tagline.classList.add('typing-effect');
    
    let i = 0;
    const speed = 100;
    
    function type() {
      if (i < text.length) {
        tagline.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        setTimeout(() => {
          tagline.classList.remove('typing-effect');
        }, 1000);
      }
    }
    
    setTimeout(type, 500);
  }

  // ========================================
  // تأثير Smooth Scroll
  // ========================================
  
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // ========================================
  // تأثير Loading للزر
  // ========================================
  
  function addLoadingState(button) {
    if (!button) return;
    
    button.classList.add('loading');
    button.disabled = true;
    
    return () => {
      button.classList.remove('loading');
      button.disabled = false;
    };
  }

  // ========================================
  // تأثير Success للزر
  // ========================================
  
  function addSuccessState(button, duration = 2000) {
    if (!button) return;
    
    const originalText = button.textContent;
    button.classList.add('success');
    button.textContent = '✓';
    
    setTimeout(() => {
      button.classList.remove('success');
      button.textContent = originalText;
    }, duration);
  }

  // ========================================
  // تأثير Error للحقل
  // ========================================
  
  function addErrorState(input, duration = 500) {
    if (!input) return;
    
    input.classList.add('error');
    
    setTimeout(() => {
      input.classList.remove('error');
    }, duration);
  }

  // ========================================
  // تأثير Gradient Text للعنوان
  // ========================================
  
  function initGradientText() {
    const tagline = document.querySelector('.hero-tagline');
    if (!tagline) return;
    
    // يمكن تفعيله بإضافة class
    // tagline.classList.add('gradient-text');
  }

  // ========================================
  // تأثير Intersection Observer للعناصر
  // ========================================
  
  function initIntersectionObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, options);
    
    const elements = document.querySelectorAll('.viral-action, .profile-code-card, .chat-item');
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

  // ========================================
  // تأثير Focus Trap للـ Modal
  // ========================================
  
  function initFocusTrap(modalElement) {
    if (!modalElement) return;
    
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    modalElement.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    });
  }

  // ========================================
  // تأثير Keyboard Shortcuts
  // ========================================
  
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K: Focus على حقل الإدخال
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('codeInput');
        if (input) input.focus();
      }
      
      // Ctrl/Cmd + Enter: إرسال
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const startBtn = document.getElementById('startBtn');
        if (startBtn && !startBtn.disabled) {
          startBtn.click();
        }
      }
      
      // Escape: إغلاق Modal
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
        modals.forEach(modal => {
          if (!modal.hidden) {
            const closeBtn = modal.querySelector('[aria-label*="إغلاق"], [aria-label*="Close"]');
            if (closeBtn) closeBtn.click();
          }
        });
      }
    });
  }

  // ========================================
  // تأثير Auto-resize للـ Textarea
  // ========================================
  
  function initAutoResize() {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
      textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
      });
    });
  }

  // ========================================
  // تأثير Copy Feedback
  // ========================================
  
  function enhanceCopyButtons() {
    const copyButtons = document.querySelectorAll('[id*="copy"], [id*="Copy"]');
    
    copyButtons.forEach(button => {
      button.addEventListener('click', function() {
        const originalText = this.textContent;
        this.textContent = '✓ تم النسخ';
        this.style.background = 'rgba(52, 211, 153, 0.2)';
        
        setTimeout(() => {
          this.textContent = originalText;
          this.style.background = '';
        }, 2000);
      });
    });
  }

  // ========================================
  // تأثير Vibration للتفاعلات
  // ========================================
  
  function initVibration() {
    if (!('vibrate' in navigator)) return;
    
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        navigator.vibrate(10);
      });
    });
  }

  // ========================================
  // تأثير Dark Mode Toggle (إضافي)
  // ========================================
  
  function initDarkModeToggle() {
    // التطبيق داكن بالفعل، لكن يمكن إضافة وضع أفتح
    const toggle = document.createElement('button');
    toggle.textContent = '🌙';
    toggle.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
      color: #ffffff;
      font-size: 1.5rem;
      cursor: pointer;
      z-index: 1000;
      transition: all 0.3s ease;
    `;
    
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('lighter-mode');
      toggle.textContent = document.body.classList.contains('lighter-mode') ? '☀️' : '🌙';
    });
    
    // يمكن تفعيله بإلغاء التعليق
    // document.body.appendChild(toggle);
  }

  // ========================================
  // تأثير Performance Monitoring
  // ========================================
  
  function initPerformanceMonitoring() {
    if (!('performance' in window)) return;
    
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('⚡ Performance Metrics:');
      console.log(`  DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
      console.log(`  Load Complete: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
      console.log(`  Total Load Time: ${perfData.loadEventEnd - perfData.fetchStart}ms`);
    });
  }

  // ========================================
  // تأثير Accessibility Enhancements
  // ========================================
  
  function initAccessibility() {
    // إضافة aria-labels للعناصر التفاعلية
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
      if (!button.getAttribute('aria-label') && button.textContent) {
        button.setAttribute('aria-label', button.textContent.trim());
      }
    });
    
    // إضافة role للعناصر التفاعلية
    const clickables = document.querySelectorAll('[onclick]:not([role])');
    clickables.forEach(el => {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
    });
  }

  // ========================================
  // التهيئة الرئيسية
  // ========================================
  
  function init() {
    // تحقق من تفضيلات المستخدم
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // التأثيرات الأساسية (تعمل دائمًا)
    initSmoothScroll();
    initKeyboardShortcuts();
    initAutoResize();
    enhanceCopyButtons();
    initAccessibility();
    
    // التأثيرات المتحركة (فقط إذا لم يفضل المستخدم تقليل الحركة)
    if (!prefersReducedMotion) {
      // يمكن تفعيل أي من هذه التأثيرات حسب الحاجة
      // initParallax();
      // initRipple();
      // initTypingEffect();
      // initIntersectionObserver();
      // initVibration();
    }
    
    // التأثيرات الاختيارية
    // initDarkModeToggle();
    // initPerformanceMonitoring();
    
    console.log('✨ Enhancements loaded successfully!');
  }

  // ========================================
  // تصدير الدوال للاستخدام الخارجي
  // ========================================
  
  window.UIEnhancements = {
    addLoadingState,
    addSuccessState,
    addErrorState,
    initFocusTrap,
    initParallax,
    initRipple,
    initTypingEffect,
    initIntersectionObserver
  };

  // ========================================
  // التشغيل عند تحميل الصفحة
  // ========================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/**
 * أمثلة الاستخدام:
 * 
 * 1. إضافة حالة loading للزر:
 *    const stopLoading = UIEnhancements.addLoadingState(button);
 *    // بعد انتهاء العملية
 *    stopLoading();
 * 
 * 2. إضافة حالة success للزر:
 *    UIEnhancements.addSuccessState(button);
 * 
 * 3. إضافة حالة error للحقل:
 *    UIEnhancements.addErrorState(input);
 * 
 * 4. تفعيل تأثير parallax:
 *    UIEnhancements.initParallax();
 * 
 * 5. تفعيل تأثير ripple:
 *    UIEnhancements.initRipple();
 */
