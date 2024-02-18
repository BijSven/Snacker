<script>
    import { Toaster } from 'svelte-sonner';
    import { onMount } from 'svelte';

    import '../app.pcss';
    import '$lib/pb.js';
    import '$lib/auth.js';
    import '$lib/dark.js';
    import SelectApp from '$lib/components/sidebar/SelectApp.svelte';
    import SelectChannel from '$lib/components/sidebar/SelectChannel.svelte';

    let path;

    onMount(() => {
        sessionStorage.setItem('VIEW_PAGETYPE', 'default');

        path = window.location.pathname;

        console.log(path);
    });
</script>

<Toaster richColors />
{#if path === '/'}
    <slot />
{:else}
    <content class="flex h-full w-full">
        <SelectApp/>
        <SelectChannel/>
        <slot />
    </content>
{/if}