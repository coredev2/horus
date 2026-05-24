import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password, button) => {
  const originalButtonText = button.textContent;
  button.textContent = 'Logging in...';
  button.disabled = true;

  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (error) {
    button.textContent = originalButtonText;
    button.disabled = false;

    const errorMessage = error.response?.data?.message;
    showAlert(
      'error',
      errorMessage || 'Something went wrong. Please try again.',
    );
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if (res.data.status === 'success')
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
  } catch (err) {
    showAlert('error', 'Error logging out! Try again');
  }
};
