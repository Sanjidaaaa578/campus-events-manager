document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('login');
  if (API.getToken()) {
    window.location.href = 'index.html';
  }
});

async function handleLoginSubmit(event) {
  event.preventDefault();
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const btn = document.getElementById('login-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');

  emailInput.classList.remove('is-invalid');
  passInput.classList.remove('is-invalid');

  let valid = true;
  if (!emailInput.value || !emailInput.value.includes('@')) {
    emailInput.classList.add('is-invalid');
    valid = false;
  }
  if (!passInput.value) {
    passInput.classList.add('is-invalid');
    valid = false;
  }
  if (!valid) return;

  btn.disabled = true;
  btnText.textContent = 'Signing in...';
  btnSpinner.classList.remove('d-none');

  try {
    const data = await API.fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: emailInput.value, password: passInput.value })
    });

    API.setToken(data.token);
    API.setUser(data.user);
    showToast('Signed in successfully! Redirecting...', 'success');

    setTimeout(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      window.location.href = redirect ? decodeURIComponent(redirect) : 'index.html';
    }, 800);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btnText.textContent = 'Sign In';
    btnSpinner.classList.add('d-none');
  }
}
