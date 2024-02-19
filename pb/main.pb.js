routerAdd("GET", "/api/name/:id", (c) => {
    let id = c.pathParam("id");

    var username = $app.dao().findRecordById("users", id);

    $app.logger().info(
        `/api/name/${id}`,
    )

    return c.json(200, { "name": username.get("name") })
});

routerAdd("GET", "/api/project/:id", (c) => {
    let id = c.pathParam("id");

    var projects = $app.dao().findRecordById("projects", id);

    $app.logger().info(
        `/api/project/${id}`,
    )

    return c.json(200, { "name": projects.get("name") })
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

    $app.logger().info(
        `/log/${token}`,
        "icon", body.icon,
        "data", body.title,
        "source", body.source,
        "channel", record.get('channel'),
    )

    return c.json(200, { "response": "OK" })
})