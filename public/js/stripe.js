import axios from 'axios'
import { showAlert } from './alerts';

export const bookTour = async tourId => {
    try{
        
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`)
        window.location = session.data.session.url

    } catch (err) {
        if (err.response) {
            showAlert('error', err.response.data.message)
    }
}
}