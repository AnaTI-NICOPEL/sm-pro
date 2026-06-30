const axios = require('axios');

async function test() {
    try {
        const apiKey = '5f2ae804-4878-402f-a9d5-83acbdc6d255'; // User provided this in the prompt
        
        console.log("Fetching tags...");
        const tagsRes = await axios.get('https://api.smclick.com.br/contacts/tag', {
            headers: { 'x-api-key': apiKey }
        });
        console.log("Tags:", tagsRes.data.slice(0, 2)); // Print first 2 tags

        console.log("Fetching contacts...");
        const contactsRes = await axios.get('https://api.smclick.com.br/contacts?search=11964055251', {
            headers: { 'x-api-key': apiKey }
        });
        console.log("Contacts data structure:", typeof contactsRes.data.results !== 'undefined' ? "Has results array" : "No results array");
        if (contactsRes.data.results) {
             console.log("Contacts count:", contactsRes.data.results.length);
             if (contactsRes.data.results.length > 0) {
                 console.log("First contact ID:", contactsRes.data.results[0].id);
             }
        }
    } catch (e) {
        console.log("Error status:", e.response?.status);
        console.log("Error data:", e.response?.data);
    }
}
test();
