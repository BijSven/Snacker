<script>
    import { Toaster, toast } from 'svelte-sonner';
    import { onMount } from 'svelte';

    import '../app.pcss';
    import PocketBase from '$lib/pb';
    import '$lib/auth.js';
    import '$lib/dark.js';
    import SelectApp from '$lib/components/sidebar/SelectApp.svelte';
    import SelectChannel from '$lib/components/sidebar/SelectChannel.svelte';
    import * as Resizable from "$lib/components/ui/resizable";
    import UseCommands from './app/command.svelte';

    const pb = new PocketBase();

    let path;
    let theme = "dark";
    let SETTING_VIEWTEMPLATE = "default";
    let items;

    onMount(async () => {
        let SETTING_VIEWTEMPLATE_STORAGE = localStorage.getItem('SETTING_VIEWTEMPLATE')
        SETTING_VIEWTEMPLATE = SETTING_VIEWTEMPLATE_STORAGE ? SETTING_VIEWTEMPLATE_STORAGE : SETTING_VIEWTEMPLATE;
        sessionStorage.setItem('VIEW_PAGETYPE', 'default');

        if(!window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = "light";
        }

        path = window.location.pathname;

        console.log(path);

        if(pb.authStore.isValid) {
            let serverItems = await pb.collection('TeamInvites').getFullList({
                filter: `userInvited = "${pb.authStore.model.id}"`
            });

            serverItems.forEach(async (item) => {
                try {
                    let response = await fetch(`${pb.baseUrl}/api/project/${item.project}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    let responseData = await response.json();

                    toast.info('You got a new invite!', {
                        duration: Number.POSITIVE_INFINITY,
                        description: `From: Team ${responseData.name}`,
                        action: {
                            label: 'Accept',
                            onClick: async () => {
                                let dataPrevious = await pb.collection('projects').getOne(item.project);
                                let members = dataPrevious.members;

                                let data = {
                                    "members": members.concat(pb.authStore.model.id),
                                }

                                await pb.collection('projects').update(item.project, data);
                                await pb.collection('TeamInvites').delete(item.id);
                                
                                toast.success(`You have joined ${responseData.name}`, { description: 'Ahoy, welcome onboard!' })
                            }
                        },
                    });
                } catch (error) {
                    console.error('Fetch failed:', error);
                }
            });
        };
    });
</script>

<Toaster richColors theme={theme} />
{#if path === '/'}
    <slot />
{:else}
    <content class="flex h-full w-full">
            <Resizable.PaneGroup direction="horizontal" class="p-5 rounded-sm">
                <Resizable.Pane maxSize={10} minSize={6.5} collapsible={true} defaultSize={8}><SelectApp/></Resizable.Pane>
                <Resizable.Handle class="mx-3" />
                {#if SETTING_VIEWTEMPLATE == "default"}
                    <Resizable.Pane maxSize={25} minSize={20} collapsible={true} defaultSize={20}><SelectChannel/></Resizable.Pane>
                    <Resizable.Handle class="mx-3" />
                    <Resizable.Pane defaultSize={70} class="rounded-lg"><slot /></Resizable.Pane>
                {:else}
                    <Resizable.Pane defaultSize={70} class="rounded-lg"><slot /></Resizable.Pane>
                    <Resizable.Handle class="mx-3" />
                    <Resizable.Pane maxSize={25} minSize={20} collapsible={true} defaultSize={20}><SelectChannel/></Resizable.Pane>
                {/if}
            </Resizable.PaneGroup>            
    </content>
    <UseCommands/>
{/if}