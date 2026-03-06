import axios from 'axios';
import FormData from 'form-data';

async function run() {
    const form = new FormData();
    form.append('id', '6');
    form.append('title', 'Test meeting updated');
    form.append('meeting_date', '2026-04-03');
    form.append('start_time', '08:00');
    form.append('end_time', '10:00');
    form.append('location_name', 'Some location');
    
    try {
        const res = await axios.post('http://127.0.0.1:5001/api/admin/meetings', form, {
            headers: form.getHeaders((header) => {
                // mock auth
            })
        });
        console.log(res.data);
    } catch(err) {
        console.log("Error:", err.response ? err.response.data : err.message);
    }
}
run();
