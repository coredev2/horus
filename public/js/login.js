import axios from 'axios';
import { showAlert } from './alerts';
import { resetButtonLoading, setButtonLoading } from './buttonLoading';

export const login = async (email, password, button) => {
  setButtonLoading(button, 'Logging in...');

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
    resetButtonLoading(button);

    if (error.response) {
      showAlert('error', error.response.data.message);
    }
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
