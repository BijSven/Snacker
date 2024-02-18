<script>
    import ShowActivity from '$lib/components/activity/activityShow.svelte';
    import GridView from '$lib/components/dynamic/viewer.svelte';

    import * as Table from "$lib/components/ui/table";
    import * as Popover from "$lib/components/ui/popover";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import * as Select from "$lib/components/ui/select";
    import { Button } from '$lib/components/ui/button';

    import PocketBase from '$lib/pb';

    import { JsonView } from '@zerodevx/svelte-json-view'
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';
    

    const pb = new PocketBase();
    pb.autoCancellation(false);

    let records = [];
    let tokens = [];
    let channels = [];
    let allProjects = [];
    let location = {};
    

    let pageType;

    async function updateData() {
        let loadingToast = toast.loading('Showing logs...');

        records = await pb.collection('logs').getFullList({
            filter: `channel.id = "${sessionStorage.getItem('NAV_CHANNEL')}"`,
            sort: '-created',
        });

        channels = await pb.collection('channels').getFullList({
            filter: `project.id = "${sessionStorage.getItem('NAV_PROJECT')}"`,
            sort: '-created',
        });

        tokens = await pb.collection('tokens').getFullList({
            filter: `channel.project.id = "${sessionStorage.getItem('NAV_PROJECT')}"`,
            sort: '-created',
        });

        location = {
            project: (await pb.collection('projects').getOne(window.sessionStorage.getItem('NAV_PROJECT'))).name,
            channel: (await pb.collection('channels').getOne(window.sessionStorage.getItem('NAV_CHANNEL'))).name,
        }

        toast.dismiss(loadingToast)
    }

    onMount(async () => {
        pageType = sessionStorage.getItem('VIEW_PAGETYPE');

        allProjects = await pb.collection('projects').getFullList({
            sort: '-created',
        });

        window.addEventListener('storage', function(event) {
            if(event.key == 'VIEW_PAGETYPE') {
                pageType = sessionStorage.getItem('VIEW_PAGETYPE');
            }
            if(event.key == "NAV_CHANNEL") {
                updateData();
            }
        }, false);

        pb.collection('logs').subscribe('*', updateData, { filter: `channel.id = "${sessionStorage.getItem('NAV_CHANNEL')}"` });
        pb.collection('channels').subscribe('*', updateData, { filter: `project.id = "${sessionStorage.getItem('NAV_PROJECT')}"` });
        pb.collection('tokens').subscribe('*', updateData, { filter: `channel.project.id = "${sessionStorage.getItem('NAV_PROJECT')}"` });

        updateData();
    });
</script>

{#if allProjects.length > 0}
<content class="flex items-center justify-center w-full mr-5 ml-5 h-full">
    <div class="h-[95vh] relative flex flex-col overflow-y-auto items-center gap-4 z-0 p-3 bg-stone-200 dark:bg-stone-900 rounded-sm w-full">
        {#if pageType == "default"}
            <div class="border-b h-12 w-full flex gap-2 text-muted-foreground justify-center items-center">
                {#if location.channel}
                    <button class="cursor-pointer" on:click={() => {
                        sessionStorage.setItem('NAV_CHANNEL', '');
                        window.dispatchEvent(new StorageEvent('storage', { key: 'NAV_CHANNEL' }));
                    }}>{location.project}</button>
                    <p>/</p>
                    <p class="text-foreground">{location.channel}</p>
                {:else}
                    <p class="text-foreground">{location.project}</p>
                {/if}
            </div>
            {#each records as record}
                <ShowActivity data={record} />
            {:else}
                {#if location.channel}
                    <h1>Couldn't find any logs 😅</h1>
                {/if}
            {/each}
            {#if !location.channel || location.channel == ''}
                <div class="flex flex-col gap-0 items-center justify-center">
                    <h1 class="text-muted-foreground"><span class="text-foreground">Dashboard</span> / <button on:click={() => {
                        sessionStorage.removeItem(`DATA_DB-${sessionStorage.getItem('NAV_PROJECT')}`);
                        window.dispatchEvent(new StorageEvent('storage', { key: 'NAV_PROJECT' }));
                        toast.success('Done, data is refreshed!');
                    }}>Refresh data</button></h1>
                </div>
                <div class="h-full w-full overflow-y-hidden">
                    <GridView />
                </div>
                    <h1 class="text-muted-foreground absolute mb-2 bottom-0">Snacker v0.5</h1>
            {/if}
        {/if}
        {#if pageType == "settings"}
            <div class="border-b h-12 w-full flex gap-2 text-muted-foreground justify-center items-center">
                <button class="cursor-pointer" on:click={() => {
                    sessionStorage.setItem('NAV_CHANNEL', '');
                    sessionStorage.setItem('VIEW_PAGETYPE', 'default');
                    window.dispatchEvent(new StorageEvent('storage', { key: 'VIEW_PAGETYPE' }));
                    window.dispatchEvent(new StorageEvent('storage', { key: 'NAV_CHANNEL' }));
                }}>{location.project}</button>
                <p>/</p>
                <p class="text-foreground">Settings</p>
            </div>
            <section>
                <div class="border-b w-[60vw] h-max relative flex my-5 pb-5 items-center">
                    <h1 class="text-2xl left-0">Tokens</h1>
                    <div class="absolute right-0 flex justify-center items-center gap-4">
                        <AlertDialog.Root>
                            <AlertDialog.Trigger><Button variant="outline">Instructions</Button></AlertDialog.Trigger>
                            <AlertDialog.Content>
                            <AlertDialog.Header>
                                <AlertDialog.Title>How to use tokens!</AlertDialog.Title>
                                <AlertDialog.Description>
                                    Tokens are the way users, projects and systems can interact with your channels.
                                    Developer can intergrate there systems so that the system sends a request on action.
                                    So you can see the live actions of the server. Lets try it out!<br><br>

                                    Your app sends a POST-request to:<br><br>
                                    <div class="border h-max w-[100%] py-5 pl-2">
                                        https://snacker.db.orae.one/log/YOUR_TOKEN
                                    </div>
                                    <br>and add this body:<br><br>
                                    <div class="border h-max w-[100%] py-5 pl-2">
                                        {'{'}
                                        <div class="ml-5">
                                            "icon": "🥳",<br>
                                            "title": "New follower!",<br>
                                            "source": "Twitch"<br>
                                        </div>
                                        {'}'}
                                    </div><br>
                                    With such request, you will see the live actions appear on your dashboard!
                                </AlertDialog.Description>
                            </AlertDialog.Header>
                                <AlertDialog.Footer>
                                    <AlertDialog.Action>Okay</AlertDialog.Action>
                                </AlertDialog.Footer>
                            </AlertDialog.Content>
                        </AlertDialog.Root>
                        <Popover.Root>
                            <Popover.Trigger>
                                <Button>New token</Button>
                            </Popover.Trigger>
                            <Popover.Content class="flex">
                                <Select.Root>
                                    <Select.Trigger class="col-span-2">
                                        <Select.Value placeholder="Channel" />
                                    </Select.Trigger>
                                    <Select.Content>
                                        {#each channels as channel}
                                            <Select.Item on:click={async () => {
                                                let data = {
                                                    "channel": channel.id,
                                                }

                                                await pb.collection('tokens').create(data);

                                                toast.success('Token has been created!');
                                            }} value={channel.id}>{channel.name}</Select.Item>
                                        {/each}
                                    </Select.Content>
                                </Select.Root>
                            </Popover.Content>
                        </Popover.Root>
                    </div>
                </div>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head class="w-[40%]">Token</Table.Head>
                            <Table.Head class="w-[30%]">Channel</Table.Head>
                            <Table.Head class="w-[30%]">Actions</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                            {#each tokens as token}
                                <Table.Row>
                                    <Table.Cell class="font-medium">{token.id}</Table.Cell>
                                    <Table.Cell>
                                        {#await pb.collection('channels').getOne(token.channel) then channel}
                                            {channel.name}
                                        {/await}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Button on:click={async () => {
                                            await pb.collection('tokens').delete(token.id);
                                            toast.success('Token has been deleted!');
                                        }} variant="destructive">Delete</Button>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                    </Table.Body>
                </Table.Root>
            </section>
        {/if}
    </div>
</content>
{:else}
<content class="flex items-center justify-center w-full mr-5 ml-5 h-full">
    <div class="h-[95vh] relative flex flex-col overflow-y-auto items-center gap-4 z-0 p-3 bg-stone-200 dark:bg-stone-900 rounded-sm w-full">
        <h1>Please create a project to continue!</h1>
    </div>
</content>
{/if}