<script>
    import { Hash } from 'lucide-svelte';
    import Snacker from '$lib/sdk.js';

    export let data;
    const sk = new Snacker('uuop9nubbp1zrt5');

    async function updateData() {
        let key = 'NAV_CHANNEL';

        sk.sendLog('🚅', 'Switched channel', 'Snacker/Channels');

        sessionStorage.setItem('VIEW_PAGETYPE', 'default');
        window.dispatchEvent(new StorageEvent('storage', { key: 'VIEW_PAGETYPE' }));
        window.sessionStorage.setItem(key, data.id);
        window.dispatchEvent(new StorageEvent('storage', { key }));
    }
</script>

<button on:click={updateData} class="duration-200 text-muted-foreground hover:text-foreground w-[90%] h-fit pl-3 p-2 text-base flex gap-2 items-center cursor-pointer rounded-s rounded-e bg-stone-300 hover:bg-stone-200 hover:dark:bg-stone-700 dark:bg-stone-800">
    <Hash class="size-5" />
    <h1>{data.name}</h1>
</button>
