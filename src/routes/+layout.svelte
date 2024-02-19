<script>
    import { Toaster, toast } from 'svelte-sonner';
    import { onMount } from 'svelte';

    import '../app.pcss';
    import PocketBase from '$lib/pb';
    import '$lib/auth.js';
    import '$lib/dark.js';
    import SelectApp from '$lib/components/sidebar/SelectApp.svelte';
    import SelectChannel from '$lib/components/sidebar/SelectChannel.svelte';

    const pb = new PocketBase();

    let path;
    let theme = "dark";
    let items;

    onMount(async () => {
        sessionStorage.setItem('VIEW_PAGETYPE', 'default');

        if(!window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = "light";
        }

        path = window.location.pathname;

        console.log(path);

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
    });
</script>

<Toaster richColors theme={theme} />
{#if path === '/'}
    <slot />
{:else}
    <content class="flex h-full w-full">
        <SelectApp/>
        <SelectChannel/>
        <slot />
    </content>
{/if}