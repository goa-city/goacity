const axios = require('axios');
const FormData = require('form-data');

async function run() {
    const form = new FormData();
    form.append('id', '6');
    form.append('title', 'Test meeting updated 2');
    form.append('meeting_date', '2026-04-03');
    form.append('start_time', '08:00');
    form.append('end_time', '10:00');
    form.append('location_name', 'Test Place');
    form.append('is_paid', '0');
    form.append('archived', '0');
    
    try {
        const res = await axios.post('http://127.0.0.1:5001/api/admin/meetings', form, {
            headers: form.getHeaders()
        });
        console.log(res.data);
    } catch(err) {
        console.log("Error:", err.response ? err.response.data : err.message);
    }
}
run();
