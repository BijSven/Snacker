routerAdd("GET", "/api/name/:id", (c) => {
    let id = c.pathParam("id");

    var username = $app.dao().findRecordById("users", id);

    return c.json(200, { "name": username.get("name") })
});

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