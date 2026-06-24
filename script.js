const storageKeys = {
  users: 'sq_users',
  session: 'sq_session',
  blogs: 'sq_blogs'
};

async function renderBlogs() {
  const list = document.getElementById('blog-list');
  if (!list) return;

  try {
    const response = await fetch('posts.json', { cache: 'no-store' });
    const blogs = await response.json();

    list.innerHTML = blogs
      .slice()
      .reverse()
      .map(blog => `
        <article class="blog-card">
          <div class="blog-meta">
            <span>${escapeHtml(blog.topic)}</span>
            <span>${blog.date}</span>
          </div>
          <h3>${escapeHtml(blog.title)}</h3>
          <p>${escapeHtml(blog.excerpt || blog.body)}</p>
          <a href="blog/${blog.slug}.html">Read article <i class="fas fa-arrow-right"></i></a>
        </article>
      `)
      .join('');
  } catch (error) {
    list.innerHTML = '<p>Articles are loading…</p>';
  }
}

const starterBlogs = [
  {
    title: 'How I approach Flutter app architecture',
    topic: 'Flutter',
    body: 'A reliable mobile app starts with clear boundaries: data, domain logic, UI, and services should each have a focused job. This keeps features easier to test, ship, and maintain.',
    author: 'Shahzad Qamar',
    date: '2026-06-17'
  },
  {
    title: 'Automation scripts that remove repeated admin work',
    topic: 'Automation',
    body: 'The best scripts are small, predictable, and easy to run. Report generation, reminders, imports, exports, and cleanups are perfect places to save hours every week.',
    author: 'Shahzad Qamar',
    date: '2026-06-17'
  }
];

const getJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    return fallback;
  }
};

const setJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const currentUser = () => getJson(storageKeys.session, null);

function initCounters() {
  document.querySelectorAll('.count').forEach(el => {
    const target = Number(el.dataset.target || 0);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 55));
    const interval = setInterval(() => {
      current = Math.min(target, current + step);
      el.textContent = current;
      if (current >= target) clearInterval(interval);
    }, 24);
  });
}

function initBackground() {
  const canvas = document.getElementById('neural-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let nodes = [];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = window.innerWidth < 700 ? 34 : 72;
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.42,
      vy: (Math.random() - 0.5) * 0.42
    }));
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nodes.forEach((node, index) => {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

      ctx.fillStyle = '#63d6d1';
      ctx.fillRect(node.x, node.y, 2, 2);

      for (let i = index + 1; i < nodes.length; i++) {
        const other = nodes[i];
        const distance = Math.hypot(node.x - other.x, node.y - other.y);
        if (distance < 125) {
          ctx.strokeStyle = `rgba(240, 191, 95, ${0.16 - distance / 1000})`;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(animate);
  };

  window.addEventListener('resize', resize);
  resize();
  animate();
}

function initAuth() {
  const modal = document.getElementById('auth-modal');
  const form = document.getElementById('auth-form');
  if (!modal || !form) return;

  const title = document.getElementById('auth-title');
  const nameInput = document.getElementById('auth-name');
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const message = document.getElementById('auth-message');
  const tabs = document.querySelectorAll('[data-auth-tab]');
  let mode = 'login';

  const setMode = nextMode => {
    mode = nextMode;
    title.textContent = mode === 'signup' ? 'Sign up' : 'Login';
    nameInput.style.display = mode === 'signup' ? 'block' : 'none';
    nameInput.required = mode === 'signup';
    message.textContent = '';
    tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.authTab === mode));
  };

  const open = nextMode => {
    setMode(nextMode);
    modal.hidden = false;
    setTimeout(() => (mode === 'signup' ? nameInput : emailInput).focus(), 20);
  };

  document.querySelectorAll('[data-open-auth]').forEach(button => {
    button.addEventListener('click', () => open(button.dataset.openAuth));
  });

  tabs.forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.authTab)));
  document.querySelector('.close-modal').addEventListener('click', () => (modal.hidden = true));
  modal.addEventListener('click', event => {
    if (event.target === modal) modal.hidden = true;
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const users = getJson(storageKeys.users, []);
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (mode === 'signup') {
      if (users.some(user => user.email === email)) {
        message.textContent = 'An account already exists for this email.';
        return;
      }
      const user = {
        name: nameInput.value.trim() || email.split('@')[0],
        email,
        password
      };
      users.push(user);
      setJson(storageKeys.users, users);
      setJson(storageKeys.session, { name: user.name, email: user.email });
      message.textContent = 'Account created. You can publish now.';
    } else {
      const user = users.find(item => item.email === email && item.password === password);
      if (!user) {
        message.textContent = 'No matching account found. Please sign up first.';
        return;
      }
      setJson(storageKeys.session, { name: user.name, email: user.email });
      message.textContent = 'Logged in. You can publish now.';
    }

    form.reset();
    updateAuthStatus();
    setTimeout(() => (modal.hidden = true), 650);
  });

  setMode('login');
}

function updateAuthStatus() {
  const status = document.getElementById('auth-status');
  const user = currentUser();
  if (!status) return;
  status.textContent = user ? `Publishing as ${user.name}` : 'Login required';
}

function renderBlogs1() {
  const list = document.getElementById('blog-list');
  if (!list) return;

  const blogs = getJson(storageKeys.blogs, starterBlogs);
  if (!localStorage.getItem(storageKeys.blogs)) setJson(storageKeys.blogs, blogs);

  list.innerHTML = blogs
    .slice()
    .reverse()
    .map(blog => `
      <article class="blog-card">
        <div class="blog-meta">
          <span>${blog.topic}</span>
          <span>${blog.date}</span>
          <span>${blog.author}</span>
        </div>
        <h3>${escapeHtml(blog.title)}</h3>
        <p>${escapeHtml(blog.body)}</p>
      </article>
    `)
    .join('');
}

function initPublisher() {
  const form = document.getElementById('blog-form');
  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const user = currentUser();
    if (!user) {
      document.querySelector('[data-open-auth="login"]').click();
      return;
    }

    const title = document.getElementById('blog-title').value.trim();
    const topic = document.getElementById('blog-topic').value.trim();
    const body = document.getElementById('blog-body').value.trim();
    if (!title || !topic || !body) return;

    const blogs = getJson(storageKeys.blogs, starterBlogs);
    blogs.push({
      title,
      topic,
      body,
      author: user.name,
      date: new Date().toISOString().slice(0, 10)
    });
    setJson(storageKeys.blogs, blogs);
    form.reset();
    renderBlogs();
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}

initCounters();
initBackground();
initAuth();
updateAuthStatus();
renderBlogs();
initPublisher();
