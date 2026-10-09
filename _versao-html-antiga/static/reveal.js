(() => {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('reveal-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

  function register(selector, step = 80, image = false) {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (element.classList.contains('reveal-item')) return;
      element.classList.add('reveal-item');
      if (image) element.classList.add('reveal-image');
      element.style.setProperty('--reveal-delay', `${Math.min(index % 5, 3) * step}ms`);
      observer.observe(element);
    });
  }

  function refresh() {
    register('#sobre .about-images, #sobre .about-copy, .section-top > div, .section-top > p, .contact-grid > div, .cta-band .container > div, .cta-band .btn, .statement .container > *', 90);
    register('.benefits > div, .modality-card, .plan-card, .day-column, .team-card, .faq details, .hours-strip > div, .contact-methods > div', 75);
    register('.about-main, .about-small, .team-photo', 70, true);
  }

  refresh();
  ['plans-grid', 'schedule-list', 'team-grid'].forEach(id => {
    const container = document.getElementById(id);
    if (container) new MutationObserver(refresh).observe(container, { childList: true });
  });
})();
