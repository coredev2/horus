import axios from 'axios'
import { showAlert } from './alerts';

export const signUp = async (name, email, password, passwordConfirm) => {
    try {
    const res = await axios({
        method: 'POST',
        url: 'http://127.0.0.1:8000/api/v1/users/signup',
        data: {
            name,
            email,
            password,
            passwordConfirm
        }
    });


    if(res.data.status === 'success') {
        showAlert('success', 'Signed Up successfully!');
        window.setTimeout(() => {
            location.assign('/');
        }, 500)
    }
} catch (error) {
if (error.response.data.message.startsWith('User validation failed: passwordConfirm')) {
    showAlert('error', 'Passwords are not the same!')
} else if (error.response.data.message.startsWith('E11000')) {
    showAlert('error', 'Email already exists!')
} else {
    showAlert('error', error.response.data.message)
}
  }
}




