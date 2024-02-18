<script>
    import { Hash } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

    export let data;

    async function updateData() {
        let key = 'NAV_CHANNEL';

        window.sessionStorage.setItem(key, data.id);
        window.dispatchEvent(new StorageEvent('storage', { key }));
    }
</script>

<button on:click={updateData} class="duration-200 text-muted-foreground hover:text-foreground w-[90%] h-fit pl-3 p-2 text-base flex gap-2 items-center cursor-pointer rounded-s rounded-e hover:bg-stone-700 bg-stone-800">
    <Hash class="size-5" />
    <h1>{data.name}</h1>
</button>
