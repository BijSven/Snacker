<script>
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import * as Dialog from "$lib/components/ui/dialog";

    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import { Label } from "$lib/components/ui/label";

    import Channel from './components/Channel.svelte';

    import PocketBase from '$lib/pb';
    import { onMount } from 'svelte';
    
    import { Plus } from 'lucide-svelte';
    import { DoorOpen } from 'lucide-svelte';
    import { Settings } from 'lucide-svelte';
    import { toast } from 'svelte-sonner';

    const pb = new PocketBase();

    let records = [];
    let allProjects = [];

    async function updateChannels() {
        records = await pb.collection('channels').getFullList({
            filter: `project.id = "${sessionStorage.getItem('NAV_PROJECT')}"`,
            sort: '-created',
        });
    }
    
    async function createChannel() {
        const data = new FormData(document.getElementById('DATA_NEW-CHNL'));

        let sendData = {
            name: data.get('name'),
            project: sessionStorage.getItem('NAV_PROJECT'),
        }

        try {
            await pb.collection('channels').create(sendData)
            toast.success(`${data.get('name')} has been created!`)
        } catch (e) {
            toast.error('Some error occurred while creating your channel!')
        }
    }

    onMount(async () => {
        window.addEventListener('storage', function(event) {
            if(event.key == "NAV_PROJECT") {
                updateChannels();
            }
        }, false);
        updateChannels();
        pb.collection('channels').subscribe('*', updateChannels);

        allProjects = await pb.collection('projects').getFullList({
            sort: '-created',
        });
    })
</script>

{#if allProjects.length > 0}
<content class="flex items-center justify-center min-w-80 ml-5 h-full">
    <div class="bg-stone-100 dark:bg-stone-900 h-[95vh] relative flex flex-col gap-3 items-center py-5 w-full left-0 rounded-sm">
        <div class="overflow-y-scroll flex flex-col pb-5 gap-3 overflow-x-hidden w-full h-full">
            {#each records as record}
                <ContextMenu.Root>
                    <ContextMenu.Trigger class="w-full flex flex-col items-center">
                        <Channel data={record} />
                    </ContextMenu.Trigger>
                    <ContextMenu.Content>
                        <ContextMenu.Item on:click={async () => { await pb.collection('channels').delete(record.id); }} class="flex px-5 text-red-500 gap-2"><DoorOpen class="size-4" /> Delete channel</ContextMenu.Item>
                    </ContextMenu.Content>
                </ContextMenu.Root>
            {:else}
                <h1 class="text-muted-foreground w-[80%] text-center">There are no channels, try creating one!</h1>
            {/each}
        </div>
        <div class="flex h-max flex-col mb-1 bottom-0 w-full justify-center items-center gap-3">
            <button on:click={() => { sessionStorage.setItem('VIEW_PAGETYPE', 'settings'); window.dispatchEvent(new StorageEvent('storage', { key: 'VIEW_PAGETYPE' })) }} class="duration-200 pl-3 p-2 text-muted-foreground hover:text-foreground w-[90%] h-fit text-base flex gap-2 items-center cursor-pointer rounded-sm bg-stone-300 hover:bg-stone-200 hover:dark:bg-stone-700 dark:bg-stone-800">
                <Settings class="size-5" />
                <h1>Settings</h1>
            </button>
            <Dialog.Root>
                <Dialog.Trigger class="w-full flex justify-center items-center">
                <button class="duration-200 pl-3 p-2 text-muted-foreground hover:text-foreground w-[90%] h-fit text-base flex gap-2 items-center cursor-pointer rounded-sm bg-stone-300 hover:bg-stone-200 hover:dark:bg-stone-700 dark:bg-stone-800">
                    <Plus class="size-5" />
                    <h1>New channel</h1>
                </button>
                </Dialog.Trigger>
                    <Dialog.Content class="sm:max-w-[425px]">
                        <Dialog.Header>
                            <Dialog.Title>New channel</Dialog.Title>
                            <Dialog.Description>
                            Lets get started with your new snacker-channel!
                            </Dialog.Description>
                        </Dialog.Header>
                        <form id="DATA_NEW-CHNL" class="grid gap-4 py-4">
                            <div class="grid grid-cols-4 items-center gap-4">
                                <Label class="text-right">Name</Label>
                                <Input name='name' placeholder="Payments" class="col-span-3" />
                            </div>
                        </form>
                        <Dialog.Footer>
                            <Button on:click={createChannel} type="submit">Save changes</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
            </Dialog.Root>
        </div>
    </div>
</content>
{/if}