document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('profile');

  // Check auth
  if (!API.getToken()) {
    window.location.href = 'login.html';
    return;
  }

  const profileLoading = document.getElementById('profileLoading');
  const profileForm = document.getElementById('profileForm');
  const profileEmail = document.getElementById('profileEmail');
  const profileRole = document.getElementById('profileRole');
  const profileName = document.getElementById('profileName');
  const profileDepartment = document.getElementById('profileDepartment');
  const profilePassword = document.getElementById('profilePassword');
  const profileConfirmPassword = document.getElementById('profileConfirmPassword');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const saveSpinner = document.getElementById('saveSpinner');
  const resetProfileBtn = document.getElementById('resetProfileBtn');
  const profileHeaderAvatar = document.getElementById('profileHeaderAvatar');
  const roleDisplayBadge = document.getElementById('roleDisplayBadge');

  let initialUserData = null;

  async function loadProfile() {
    try {
      profileLoading.classList.remove('d-none');
      profileForm.classList.add('d-none');

      const res = await API.fetch('/api/users/profile');
      initialUserData = res.user;

      profileEmail.value = res.user.email || '';
      profileRole.value = res.user.role || '';
      profileName.value = res.user.name || '';
      profileDepartment.value = res.user.department || '';
      profilePassword.value = '';
      profileConfirmPassword.value = '';

      if (profileHeaderAvatar && res.user.name) {
        profileHeaderAvatar.textContent = res.user.name.charAt(0).toUpperCase();
      }
      if (roleDisplayBadge && res.user.role) {
        roleDisplayBadge.textContent = res.user.role;
        roleDisplayBadge.className = `badge ${res.user.role === 'Admin' ? 'bg-warning text-dark' : res.user.role === 'Organizer' ? 'bg-info text-dark' : 'bg-primary text-white'} px-3 py-2`;
      }

      profileLoading.classList.add('d-none');
      profileForm.classList.remove('d-none');
    } catch (err) {
      profileLoading.classList.add('d-none');
      showToast(err.message || 'Failed to load user profile', 'danger');
    }
  }

  resetProfileBtn.addEventListener('click', () => {
    if (initialUserData) {
      profileName.value = initialUserData.name || '';
      profileDepartment.value = initialUserData.department || '';
      profilePassword.value = '';
      profileConfirmPassword.value = '';
      profileForm.classList.remove('was-validated');
    }
  });

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    profileForm.classList.remove('was-validated');

    const name = profileName.value.trim();
    const department = profileDepartment.value.trim();
    const password = profilePassword.value;
    const confirmPassword = profileConfirmPassword.value;

    let isValid = true;

    if (!name) {
      profileName.classList.add('is-invalid');
      isValid = false;
    } else {
      profileName.classList.remove('is-invalid');
    }

    if (password) {
      if (password.length < 6) {
        profilePassword.classList.add('is-invalid');
        isValid = false;
      } else {
        profilePassword.classList.remove('is-invalid');
      }

      if (password !== confirmPassword) {
        profileConfirmPassword.classList.add('is-invalid');
        isValid = false;
      } else {
        profileConfirmPassword.classList.remove('is-invalid');
      }
    } else {
      profilePassword.classList.remove('is-invalid');
      profileConfirmPassword.classList.remove('is-invalid');
    }

    if (!isValid) return;

    try {
      saveProfileBtn.disabled = true;
      saveSpinner.classList.remove('d-none');

      const body = { name, department };
      if (password) {
        body.password = password;
      }

      const res = await API.fetch('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(body)
      });

      // Update stored user
      const currentUser = API.getUser();
      if (currentUser) {
        currentUser.name = res.user.name;
        currentUser.department = res.user.department;
        API.setUser(currentUser);
        renderNavbar('profile');
      }

      if (profileHeaderAvatar && res.user.name) {
        profileHeaderAvatar.textContent = res.user.name.charAt(0).toUpperCase();
      }

      showToast('Profile updated successfully!', 'success');
      initialUserData = res.user;
      profilePassword.value = '';
      profileConfirmPassword.value = '';
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'danger');
    } finally {
      saveProfileBtn.disabled = false;
      saveSpinner.classList.add('d-none');
    }
  });

  await loadProfile();
});
