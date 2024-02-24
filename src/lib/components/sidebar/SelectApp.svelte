<script>
    import * as Tooltip from "$lib/components/ui/tooltip";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Popover from "$lib/components/ui/popover";
    
    import ProjectIcon from './components/ProjectIcon.svelte';
    import { Input } from "$lib/components/ui/input";
    import { Switch } from "$lib/components/ui/switch";
    import { Button } from "$lib/components/ui/button";
    import { Label } from "$lib/components/ui/label";
    import { Plus } from 'lucide-svelte';
    import { LogOut } from 'lucide-svelte';
    import { CircleUserRound } from 'lucide-svelte';

    import PocketBase from '$lib/pb';

    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';

    const pb = new PocketBase();

    let records = [];
    const appVersion = import.meta.env.VITE_APP_VERSION;
    let modernMode;


    async function createProject() {
        const data = new FormData(document.getElementById('DATA_NEW-PJCT'));

        let sendData = {
            name: data.get('name'),
            logo: data.get('logo'),
            members: pb.authStore.model.id,
        }

        try {
            await pb.collection('projects').create(sendData)
            toast.success(`${data.get('name')} has been created!`);

            document.dispatchEvent(new CustomEvent('REFRESH_PROJECTS'));
        } catch (e) {
            toast.error('Some error occurred while creating your project!')
        }
    }

    async function fetchData() {
        try {
            records = await pb.collection('projects').getFullList({
                sort: '-created',
            });

            if(!records.length > 0) {
                document.getElementById('newProjectBTN').click();
            }
        } catch (e) {
            records = [];
        }
    }

    onMount(async () => {
        if(localStorage.getItem('SETTING_VIEWTEMPLATE')) {
            modernMode = localStorage.getItem('SETTING_VIEWTEMPLATE') == 'default' ? false : true;
        } else {
            modernMode = false;
        }

        pb.collection('projects').subscribe('*', fetchData);
        document.addEventListener('REFRESH_PROJECTS', fetchData);
        fetchData();
    })
</script>

<content class="flex items-center justify-center min-w-[90%] h-full">
    <div class="bg-stone-100 dark:bg-stone-900 h-[95vh] overflow-y-auto flex flex-col items-center w-full left-0 rounded-sm relative">
        <div class="overflow-y-auto flex flex-col w-full h-full items-center gap-5 pt-5">
            {#each records as record}
                {#if sessionStorage.getItem('NAV_PROJECT') === null}
                    {#await new Promise(resolve => {
                        let key = 'NAV_PROJECT';
                        let reset = 'NAV_CHANNEL';

                        window.sessionStorage.setItem(reset, '');
                        window.dispatchEvent(new StorageEvent('storage', { key: reset }));

                        window.sessionStorage.setItem(key, record.id);
                        window.dispatchEvent(new StorageEvent('storage', { key }));
                        resolve();
                    })}
                        {window.location.reload()}
                    {/await}
                {/if}
                <Tooltip.Root>
                    <Tooltip.Trigger>
                        <ProjectIcon project={record} />
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p class="select-none">{record.name}</p>
                    </Tooltip.Content>
                </Tooltip.Root>
            {/each}
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <Dialog.Root>
                        <Dialog.Trigger>
                            <button id="newProjectBTN" class="rounded-[100%] cursor-pointer text-xl hover:rounded-md min-h-16 min-w-16 duration-200 flex flex-col justify-center items-center bg-stone-300 hover:bg-stone-200 hover:dark:bg-stone-700 dark:bg-stone-800">
                                <Plus />
                            </button>
                        </Dialog.Trigger>
                        <Dialog.Content class="sm:max-w-[425px]">
                            <Dialog.Header>
                              <Dialog.Title>New project</Dialog.Title>
                              <Dialog.Description>
                                Lets get started with your new snacker-project!
                              </Dialog.Description>
                            </Dialog.Header>
                            <form id="DATA_NEW-PJCT" class="grid gap-4 py-4">
                                <div class="grid grid-cols-4 items-center gap-4">
                                    <Label class="text-right">Name</Label>
                                    <Input name='name' placeholder="My cool web-app" class="col-span-3" />
                                </div>
                                <div class="grid grid-cols-4 items-center gap-4">
                                    <Label class="text-right">Logo</Label>
                                    <Input name="logo" type="file" class="col-span-3 text-white" />
                                </div>
                            </form>
                            <Dialog.Footer>
                              <Button type="submit" on:click={createProject}>Save changes</Button>
                            </Dialog.Footer>
                          </Dialog.Content>
                      </Dialog.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p class="select-none">New project</p>
                </Tooltip.Content>
            </Tooltip.Root>
        </div>
        <Popover.Root>
            <Popover.Trigger class="bottom-0 mb-5 mt-5">
                <button class="mt-2 rounded-[100%] cursor-pointer text-xl hover:rounded-md min-h-16 min-w-16 duration-200 flex flex-col justify-center items-center bg-stone-300 hover:bg-stone-200 hover:dark:bg-stone-700 dark:bg-stone-800">
                    <CircleUserRound class="size-8" />
                </button>
            </Popover.Trigger>
            <Popover.Content class="ml-5 flex flex-col gap-7 w-96 h-96   p-5 overflow-y-scroll">
                <h1 class="text-2xl">Your account</h1>
                <div class="flex items-center relative space-x-2">
                    <h1>Account ID</h1>
                    <h2 class="absolute right-0">{pb.authStore.model.id}</h2>
                </div>
                <div class="flex items-center relative space-x-2">
                    <Label for="modern-mode">Alternative View</Label>
                    <Switch bind:checked={modernMode} on:click={() => {
                        toast.warning('Unapplied changes', {
                            duration: Number.POSITIVE_INFINITY,
                            description: `To apply your changes, refresh.`,
                            action: {
                                label: 'Refresh',
                                onClick: async () => {
                                    window.location.reload();
                                }
                            },
                        });

                        if(modernMode == false) {
                            localStorage.setItem('SETTING_VIEWTEMPLATE', 'modernMode');
                        } else {
                            localStorage.setItem('SETTING_VIEWTEMPLATE', 'default');
                        }
                    }} class="absolute right-0" id="modern-mode" />
                </div>
                <div class="flex border-t pt-5 absolute justify-self-center self-center bottom-0 items-center px-5 flex-row justify-between w-[90%] mb-5 gap-5">
                    <h1 class="text-muted-foreground">Snacker v{appVersion}</h1>
                    <Button variant="outline" on:click={() => {pb.authStore.clear(); sessionStorage.clear(); localStorage.clear(); window.location.reload()}}><LogOut /></Button>
                </div>
            </Popover.Content>
        </Popover.Root>
    </div>
</content>