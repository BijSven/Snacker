<script>
    import ShowActivity from '$lib/components/activity/activityShow.svelte';
    import GridView from '$lib/components/dynamic/viewer.svelte';
    import ContentView from '$lib/components/activity/preview.svelte';

    import * as Table from "$lib/components/ui/table";
    import * as Popover from "$lib/components/ui/popover";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import * as Select from "$lib/components/ui/select";
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';

    import PocketBase from '$lib/pb';

    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';
    

    const pb = new PocketBase();
    pb.autoCancellation(false);

    const appVersion = import.meta.env.VITE_APP_VERSION;

    let records = [];
    let tokens = [];
    let teamMembers = [];
    let channels = [];
    let allProjects = [];
    let location = {};

    let STATUS_InviteUserOpen = false;
    let STATUS_NewTokenCreate = false;
    
    let pageType;

    async function updateData() {
        let loadingToast = toast.loading('Fetching data...');

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

        teamMembers = (await pb.collection('projects').getOne(sessionStorage.getItem('NAV_PROJECT'))).members;

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
            if(event.key == ("NAV_CHANNEL" || "NAV_PROJECT")) {
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
<content class="flex items-center justify-center max-w-[100vw] overflow-hidden w-full mr-5 ml-5 h-full">
    <div class="h-[95vh] relative flex flex-col overflow-y-auto items-center gap-4 z-0 p-3 bg-stone-100 dark:bg-stone-900 rounded-sm w-full">
        {#if pageType == "default"}
            <div class="border-b min-h-12 h-12 w-full flex gap-2 text-muted-foreground justify-center items-center">
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
                <ContentView data={record}>
                    <ShowActivity data={record} />
                </ContentView>
            {:else}
                {#if location.channel}
                    <h1 class="text-muted-foreground">Hmm, its empty here!</h1>
                {/if}
            {/each}
            {#if !location.channel || location.channel == ''}
                <div class="flex flex-col gap-0 items-center justify-center">
                    <h1 class="text-muted-foreground"><span class="text-foreground">Dashboard</span> / <button on:click={() => {
                        let loadingToast = toast.loading('Fetching new data...');
                        window.dispatchEvent(new CustomEvent('UPDATE_DASHBOARD', {key: sessionStorage.getItem('NAV_PROJECT'), toast: loadingToast}));
                    }}>Reload</button></h1>
                </div>
                <div class="h-full w-full overflow-y-hidden">
                    <GridView />
                </div>
                    <h1 class="text-muted-foreground absolute mb-2 bottom-0">Snacker v{appVersion}</h1>
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
                                    <div class="border h-max w-[100%] py-5 pl-2 rounded-e rounded-s">
                                        {pb.baseUrl}/log/YOUR_TOKEN
                                    </div>
                                    <br>and add this body:<br><br>
                                    <div class="border h-max w-[100%] py-5 pl-2 rounded-s rounded-e">
                                        {'{'}
                                        <div class="ml-5">
                                            "icon": "🥳",<br>
                                            "title": "New follower!",<br>
                                            "body": "Good job!", <span class="text-muted-foreground">#? You can view this by clicking on the log.</span><br>
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
                        <Popover.Root bind:open={STATUS_NewTokenCreate}>
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
                                                STATUS_NewTokenCreate = false;

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
            <section>
                <div class="border-b w-[60vw] h-max relative flex my-5 pb-5 items-center">
                    <h1 class="text-2xl left-0">Team members</h1>
                    <div class="absolute right-0 flex justify-center items-center gap-4">
                        <Popover.Root bind:open={STATUS_InviteUserOpen}>
                            <Popover.Trigger>
                                <Button>Invite user</Button>
                            </Popover.Trigger>
                            <Popover.Content class="flex">
                                <form class="w-full" id="DATA_INVITE-USER" on:submit={async () => {
                                    STATUS_InviteUserOpen = false;
                                    let form = new FormData(document.getElementById('DATA_INVITE-USER'));
                                
                                    const data = {
                                        "userSent": pb.authStore.model.id,
                                        "userInvited": form.get('AccountID'),
                                        "project": sessionStorage.getItem('NAV_PROJECT')
                                    };
                                
                                    await pb.collection('TeamInvites').create(data);
                                
                                    let response = await fetch(`${pb.baseUrl}/api/name/${form.get('AccountID')}`);
                                    const userData = await response.json();
                                    const userName = userData.name;
                                
                                    toast.success(`${userName} has been invited!`, {
                                        description: `Now we wait on a response!`
                                    });
                                }}>
                                    <Input name="AccountID" placeholder="Enter Account-ID"/>
                                </form>
                            </Popover.Content>
                        </Popover.Root>
                    </div>
                </div>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head class="w-[70%]">Username</Table.Head>
                            <Table.Head class="w-[30%]">Actions</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each teamMembers as teamMember}
                            <Table.Row>
                                <Table.Cell class="font-medium">
                                    {#await (async () => {
                                        try {
                                            const response = await fetch(`${pb.baseUrl}/api/name/${teamMember}`);
                                        
                                            if (!response.ok) {
                                                throw new Error(`HTTP error! status: ${response.status}`);
                                            }
                                        
                                            const data = await response.json();
                                            return data.name;
                                        } catch (error) {
                                            return 'Unknown';
                                        }
                                    })() then name}
                                        {name}
                                    {/await}
                                </Table.Cell>
                                <Table.Cell>
                                    {#if teamMember != pb.authStore.model.id}
                                        <Button on:click={async () => {
                                            let user = teamMember;
                                            let members = teamMembers;

                                            var index = members.indexOf(user);
                                            index !== -1 ? members.splice(index, 1) : null;

                                            let newData = {
                                                "members": members
                                            };

                                            await pb.collection('projects').update(sessionStorage.getItem('NAV_PROJECT'), newData);

                                            toast.info('User has been kicked!');

                                            updateData();
                                        }} variant="destructive">Kickout</Button>
                                    {:else}
                                        <div class="cursor-not-allowed">
                                            <Button disabled variant="destructive">Kickout</Button>
                                        </div>
                                    {/if}
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