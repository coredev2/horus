import axios from 'axios'
import { showAlert } from './alerts'
// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
    try {
        const url = type === 'password' ? '/api/v1/users/updateMyPassword':'/api/v1/users/updateMe'

        const res = await axios({
            method: 'PATCH',
            url,
            data
        })

        if (res.data.status === 'success') {
            showAlert('success', `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`)
        }
    } catch (err) {
        if (err.response) {
            showAlert('error', err.response.data.message)
    }
}
}