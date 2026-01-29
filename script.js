document.querySelectorAll('.card, .project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.background =
      `radial-gradient(circle at ${x}px ${y}px, rgba(106,227,255,0.15), #12172a)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.background = '#12172a';
  });
});
