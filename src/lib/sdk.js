class Snacker {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = `https://snacker.db.orae.one/log/`;
    }

    sendLog(icon, title, source) {
        const requestBody = {
            icon: icon,
            title: title,
            source: source
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        };

        fetch(`${this.apiUrl}${this.apiKey}`, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error(`[SNACKER] Some error occured!`);
            console.error(`[SNACKER] -> SDK -> ERROR: ${error}`);
        });
    }
}

export default Snacker;