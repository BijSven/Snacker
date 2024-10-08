<script>
    import PocketBase from '$lib/pb';
    import Grid, { GridItem } from 'svelte-grid-extended';
    import { toast } from 'svelte-sonner';

    import { VisXYContainer, VisLine, VisAxis } from '@unovis/svelte'

    let data = [
        { x: 0, y: 0 },
        { x: 1, y: 100 },
        { x: 2, y: 50 },
    ]

    const pb = new PocketBase();

    let items = [];
    let init = false;
    let gridController;

    async function loadItems() {
        const navProject = sessionStorage.getItem('NAV_PROJECT');
        if (navProject) {
            const storedItems = localStorage.getItem(`DATA_DB-${navProject}`);
            if (storedItems) {
                items = JSON.parse(storedItems);
            } else {
                let serverItems = await pb.collection('channels').getFullList({
                    filter: `project.id = "${sessionStorage.getItem('NAV_PROJECT')}"`,
                    sort: '-created',
                    $autoCancel: false
                });

                items = serverItems.map((item, index) => {
                    return {
                        x: index %  4,
                        y: Math.floor(index /  4),
                        data: {
                            text: item.id
                        }
                    };
                });
            }
        }
    }

    window.addEventListener('UPDATE_DASHBOARD', async (event) => {
        try {
            const storedItems = localStorage.getItem(`DATA_DB-${event.key}`);

            if (storedItems) {
                items = JSON.parse(storedItems);
            }

            sessionStorage.removeItem('LAST_REQUEST_LOGS');
            sessionStorage.removeItem('LAST_REQUEST');

            let serverItems = await pb.collection('channels').getFullList({
                filter: `project.id = "${sessionStorage.getItem('NAV_PROJECT')}"`,
                sort: '-created',
                $autoCancel: false,
            });

            const serverItemsSet = new Set(serverItems.map(item => item.id));
            const currentItemsSet = new Set(items.map(item => item.data.text));

            items = items.filter(item => serverItemsSet.has(item.data.text));

            serverItems.forEach((serverItem, index) => {
                if (!currentItemsSet.has(serverItem.id)) {
                    const newPosition = gridController.getFirstAvailablePosition();
                    items.push({
                        x: newPosition.x,
                        y: newPosition.y,
                        data: {
                            text: serverItem.id
                        }
                    });
                }
            });

            items = items;

            toast.dismiss(event.toast);
            localStorage.setItem(`DATA_DB-${sessionStorage.getItem('NAV_PROJECT')}`, JSON.stringify(items));
            toast.success('Dashboard has been updated!');
        } catch (e) {
            toast.error('Something went wrong')
            console.error(e);
        }
    });

    window.addEventListener('storage', function(event) {
        if(event.key == "NAV_PROJECT") {
            loadItems();
        }
    }, false);

    $: { loadItems() }
    $: if(init = true) { localStorage.setItem(`DATA_DB-${sessionStorage.getItem('NAV_PROJECT')}`, JSON.stringify(items)) };

    const itemSize = { width: 250, height: 150 };
</script>

<Grid bind:controller={gridController} collision="push" {itemSize}>
	{#each items as item}
		<GridItem resizable={true} class="flex flex-col gap-4 rounded-sm p-5 place-items-center rounded-s rounded-e bg-stone-200 dark:bg-stone-800 overflow-hidden" bind:w={item.w} bind:h={item.h} bind:x={item.x} bind:y={item.y}>
                <h1 class="text-xl">
                    {#await (async () => {
                        let cached = sessionStorage.getItem('LAST_REQUEST');
                        let response;
                        if (cached) {
                            try {
                                cached = JSON.parse(cached);
                            } catch (error) {
                                console.error('Error loading cache:', error);
                                cached = {};
                            }
                        } else {
                            cached = {};
                        }
                    
                        if (!cached.hasOwnProperty(item.data.text)) {
                            response = await pb.collection('channels').getOne(item.data.text, { $autoCancel: false });
                            cached[item.data.text] = response;
                            sessionStorage.setItem('LAST_REQUEST', JSON.stringify(cached));
                            return response.name;
                        } else {
                            return cached[item.data.text].name;
                        }
                    })() then response}
                    {(() => {
                        if (response) {
                            return response;
                        } else {
                            return 'Loading';
                        }
                    })()}
                {/await}
            </h1>
            {#await (async () => {
                console.log('Creating table...');
                let records = await pb.collection('logs').getFullList({ filter: `channel.id = "${sessionStorage.getItem('NAV_CHANNEL')}"`, sort: '-created', $autoCancel: false });
                console.log(records);
                let data = [];
                for (let record of records) {
                    let x = record.created;
                    let y = (await pb.collection('logs').getFullList({ filter: `channel.id = "${sessionStorage.getItem('NAV_CHANNEL')}" & created = "${x}"`, sort: '-created', $autoCancel: false })).length;
                    console.log(x, y);
                    data.push({ x: x, y: y });
                }
                return data;
            }) then data}
                <VisXYContainer class="h-[90%] w-[100%]">
                    <VisLine {data} x={data.x} y={data.y}/>
                    <VisAxis type="x"/>
                    <VisAxis type="y"/>
                </VisXYContainer>
            {/await}
            <!-- <h1 class="size-12 rounded-sm flex justify-center items-center text-2xl select-none">✨</h1>
             <div>
                <h1 class="text-xl">
                    {#await (async () => {
                        let cached = sessionStorage.getItem('LAST_REQUEST');
                        let response;
                        if (cached) {
                            try {
                                cached = JSON.parse(cached);
                            } catch (error) {
                                console.error('Error loading cache:', error);
                                cached = {};
                            }
                        } else {
                            cached = {};
                        }
                    
                        if (!cached.hasOwnProperty(item.data.text)) {
                            response = await pb.collection('channels').getOne(item.data.text, { $autoCancel: false });
                            cached[item.data.text] = response;
                            sessionStorage.setItem('LAST_REQUEST', JSON.stringify(cached));
                            return response.name;
                        } else {
                            return cached[item.data.text].name;
                        }
                    })() then response}
                    {(() => {
                        if (response) {
                            return response;
                        } else {
                            return 'Loading';
                        }
                    })()}
                    {/await}
                </h1>
                <p class="text-muted-foreground">
                    {#await (async () => {
                        let cached = sessionStorage.getItem('LAST_REQUEST_LOGS');
                        let response;
                        if (cached) {
                            try {
                                cached = JSON.parse(cached);
                            } catch (error) {
                                console.error('Error loading cache:', error);
                                cached = {};
                            }
                        } else {
                            cached = {};
                        }
                    
                        const channelId = item.data.text;
                        if (!cached.hasOwnProperty(channelId)) {
                            response = await pb.collection('logs').getFullList({
                                filter: `channel.id = "${channelId}"`,
                                sort: '-created',
                                $autoCancel: false,
                            });
                            cached[channelId] = response;
                            sessionStorage.setItem('LAST_REQUEST_LOGS', JSON.stringify(cached));
                            return response.length;
                        } else {
                            return cached[channelId].length;
                        }
                    })() then response}
                    {(() => {
                        if (response !== undefined) {
                            return `${response} logs`;
                        } else {
                            return 'Loading';
                        }
                    })()}
                    {/await}
                </p>
            </div> -->
		</GridItem>
	{/each}
</Grid>