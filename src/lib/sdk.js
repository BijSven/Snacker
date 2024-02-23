class Snacker {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    track(icon, title, body, source) {
        const requestBody = {
            icon: icon,
            title: title,
            body: body,
            source: source
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        };

        fetch(`https://snacker.db.orae.one/log/${this.apiKey}`, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error(`[SNACKER] Some error occured, are you connected to internet?`);
            console.error(`Error: ${error}`);
        });
    }
}

export default Snacker;