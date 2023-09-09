import axios from 'axios';

async function fetchData() {
	try {
		const response = await axios.get('/api/v1');
		// Handle the successful response here
		console.log('Data:', response.data);
	} catch (error) {
		// Handle any errors here
		console.error('Error:', error);
	}
}
fetchData();