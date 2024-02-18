routerAdd("POST", "/log/:token", (c) => {
    const body = $apis.requestInfo(c).data

    let token = c.pathParam("token")

    const record = $app.dao().findRecordById("tokens", token);
    const collection = $app.dao().findCollectionByNameOrId("logs");

    $app.dao().saveRecord(
        new Record(collection, {
            "icon": body.icon,
            "data": body.title,
            "source": body.source,
            "channel": record.get('channel'),
        })
    );

    return c.json(200, { "response": "OK" })
})