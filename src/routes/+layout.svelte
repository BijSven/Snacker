<script>
    import { Toaster } from 'svelte-sonner';
    import { onMount } from 'svelte';

    import { fade } from 'svelte/transition';
    import { fly } from 'svelte/transition';

    import '../app.pcss';
    import '$lib/auth.js';
    import '$lib/dark.js';

    let mount = false;

    let theme = "dark";

    onMount(async () => {
        mount = true;

        if(!window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = "light";
        }
    });
</script>

<Toaster richColors theme={theme} />
{#if mount}
    <slot/>
{:else}
    <div out:fade={{ duration: 2500 }} class="absolute h-full z-50 w-full flex flex-col gap-2 justify-center items-center bg-black">
        <p in:fly={{ duration: 650, y: 50 }} out:fade class="text-2xl font-semibold text-white">Snacker</p>
        <div in:fly={{ duration: 650, y: -50, delay: 200 }} out:fade class="flex gap-2 justify-center items-center select-none text-white/60">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 animate-spin lucide lucide-loader-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <p class="text-xl">Almost ready...</p>
        </div>
    </div>
{/if}