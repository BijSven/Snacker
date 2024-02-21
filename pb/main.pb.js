routerAdd("GET", "/api/name/:id", (c) => {
    let id = c.pathParam("id");

    var username = $app.dao().findRecordById("users", id);

    $app.logger().info(
        `GET /api/name/${id}`,
    )

    return c.json(200, { "name": username.get("name") })
});

routerAdd("GET", "/api/project/:id", (c) => {
    let id = c.pathParam("id");

    var projects = $app.dao().findRecordById("projects", id);

    $app.logger().info(
        `GET /api/project/${id}`,
    )

    return c.json(200, { "name": projects.get("name") })
});

routerAdd("POST", "/log/:token", (c) => {
    const body = $apis.requestInfo(c).data

    let token = c.pathParam("token")

    const Token = $app.dao().findRecordById("tokens", token);
    const collection = $app.dao().findCollectionByNameOrId("logs");
    const record = new Record(collection);
    const form = new RecordUpsertForm($app, record);

    form.loadData({
        "icon": body.icon,
        "data": body.title,
        "source": body.source,
        "channel": Token.get('channel'),
    })

    form.submit();
    

    $app.logger().info(
        `POST /log/${token}`,
        "icon", body.icon,
        "data", body.title,
        "source", body.source,
        "channel", record.get('channel'),
    )

    return c.json(200, { "response": "OK" })
})