import axios from 'axios';
const API_EXTERNAL_ENDPOINT = import.meta.env.VITE_API_EXTERNAL_ENDPOINT;

export const fetchReferences = async () => {
    try {
        const response = await axios.get(`${API_EXTERNAL_ENDPOINT}/READ/mostrarReferencias.php`);
        console.log(response)
        if (!response.data.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = response.data.respuesta;
        return data;
    } catch (error) {
        console.error('Error fetching references:', error);
        throw error;
    }
}