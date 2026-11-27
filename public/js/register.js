document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('register');
});

async function handleRegisterSubmit(event) {
  event.preventDefault();
  const nameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const passInput = document.getElementById('reg-password');
  const roleInput = document.getElementById('reg-role');
  const deptInput = document.getElementById('reg-dept');

  const btn = document.getElementById('register-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');

  [nameInput, emailInput, passInput].forEach(i => i.classList.remove('is-invalid'));

  let valid = true;
  if (!nameInput.value.trim()) { nameInput.classList.add('is-invalid'); valid = false; }
  if (!emailInput.value.trim() || !emailInput.value.includes('@')) { emailInput.classList.add('is-invalid'); valid = false; }
  if (!passInput.value.trim()) { passInput.classList.add('is-invalid'); valid = false; }
  if (!valid) return;

  btn.disabled = true;
  btnText.textContent = 'Registering...';
  btnSpinner.classList.remove('d-none');

  try {
    const data = await API.fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passInput.value,
        role: roleInput.value,
        department: deptInput.value.trim()
      })
    });

    API.setToken(data.token);
    API.setUser(data.user);
    showToast('Registration successful! Welcome to Campus Events.', 'success');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btnText.textContent = 'Create Account';
    btnSpinner.classList.add('d-none');
  }
}
