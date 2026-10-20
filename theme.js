try {
  const theme=localStorage.getItem('quickpop-theme');
  if(theme==='dark'||theme==='light') document.documentElement.dataset.theme=theme;
} catch {}
