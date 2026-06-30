const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('https://api.smclick.com.br/contacts', {
            name: "Alex",
            telephone: "11964055251",
            tags: ["TESTE"],
            country: "BR"
        }, {
            headers: {
                'x-api-key': '469a3e09-7e9b-4310-889a-c436cf8e9e0b',
                'Content-Type': 'application/json'
            }
        });
        console.log("Success:", res.data);
    } catch (e) {
        console.log("Error status:", e.response?.status);
        console.log("Error data:", e.response?.data);
        console.log("Error headers:", e.response?.headers);
    }
}
test();
