import '@babel/polyfill'
import { displayMap } from './mapbox';
import { signUp } from './signup';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';


const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signUpForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations)
}

if (loginForm) {
    document.querySelector('.form--login').addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value
        login(email, password)
})}
    
if (signUpForm) {
document.querySelector('.form--signup').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value
    const name = document.getElementById('name').value;
    const passwordConfirm = document.getElementById('password-confirm').value
    signUp(name, email, password, passwordConfirm)
})}

if (logOutBtn) logOutBtn.addEventListener('click', logout)

if (userDataForm) 
    userDataForm.addEventListener('submit', async e => {
    e.preventDefault();
    const form = new FormData()
    form.append('name', document.getElementById('name').value)
    form.append('email', document.getElementById('email').value)
    form.append('photo', document.getElementById('photo').files[0])
    await updateSettings(form, 'data')
    location.reload(true)
})

if (userPasswordForm) 
    userPasswordForm.addEventListener('submit', async e => {
e.preventDefault();
document.querySelector('.btn--save-password').textContent = 'Updating...'
const currentPassword = document.getElementById('password-current').value;
const newPassword = document.getElementById('password').value;
const newPasswordConfirm = document.getElementById('password-confirm').value;
await updateSettings({currentPassword, newPassword, newPasswordConfirm}, 'password')

document.querySelector('.btn--save-password').textContent = 'Save password'
document.getElementById('password-current').value = ''
document.getElementById('password').value = ''
document.getElementById('password-confirm').value = ''
})

if(bookBtn) {
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...'
        const { tourId } = e.target.dataset;
        bookTour(tourId)
    })
}

window.scrollTo(0, 0);