<script>
    // TODO: Use accordion for the custom tags in the expand field in the API.
    export let data;

    import { Dialog } from "bits-ui";
    import { scale } from 'svelte/transition';
    import { fade } from 'svelte/transition';

    import PocketBase from "$lib/pb";

    import * as Tooltip from "$lib/components/ui/tooltip";

    import { flyAndScale } from "$lib/utils.js";

    import { Goal } from 'lucide-svelte';
    import { Clock } from 'lucide-svelte';
    import { Trash2 } from 'lucide-svelte';
    import { X } from 'lucide-svelte';
	import { toast } from "svelte-sonner";

    const pb = new PocketBase();

    async function deleteItem() {
        await pb.collection('logs').delete(data.id);
        toast.success('Log has been deleted!');
    }

    function formatDate(dateString) {
        const date = new Date(dateString);

        return date.toLocaleString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
    }
</script>

<Dialog.Root>
    <Dialog.Trigger class="w-full flex justify-center">
        <slot/>
    </Dialog.Trigger>
    <Dialog.Portal>
        <Dialog.Overlay transitionConfig={{ duration: 150 }} transition={fade} class="fixed inset-0 z-50 bg-black/80"/>
        <Dialog.Content transition={flyAndScale} class="rounded-sm fixed left-[50%] top-[50%] z-50 w-full max-w-[94%] translate-x-[-50%] translate-y-[-50%] rounded-card-lg border bg-background p-5 shadow-popover outline-none sm:max-w-[490px] md:w-full" >
        <Dialog.Title>
            <p class="text-2xl">{data.data}</p>
        </Dialog.Title>
        <Dialog.Description class="flex justify-between items-center h-max mb-3 border p-4 mt-4 rounded-sm">
            <p class="text-foreground flex gap-2 justify-center items-center"><Goal class="size-5"/>{data.source}</p>
            <p class="text-muted-foreground flex gap-2 select-none justify-center items-center ">{formatDate(data.created)}<Clock class="size-4"/></p>
        </Dialog.Description>
        <div class="p-5 border-t">
            <p>{data.body}</p>
        </div>
        <Tooltip.Root>
            <Tooltip.Trigger class="absolute bottom-0 right-0 mb-3 mr-3">
                <button on:click={deleteItem} class="p-2 rounded-sm cursor-pointer text-muted-foreground hover:text-foreground duration-200 border">
                    <Trash2 class="size-5" />
                </button>
            </Tooltip.Trigger>
            <Tooltip.Content>
                <p>Delete item</p>
            </Tooltip.Content>
        </Tooltip.Root>
        <Dialog.Close class="absolute top-0 mt-3 mr-3 right-0">
            <X />
        </Dialog.Close>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>