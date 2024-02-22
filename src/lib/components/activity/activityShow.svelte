<script>
    export let data;

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


<content class="flex w-[40%] min-w-[40%] gap-4 rounded-sm p-5 bg-stone-200 dark:bg-stone-800">
    <h1 class="size-12 min-h-12 min-w-12 dark:bg-stone-700 bg-stone-300 rounded-sm flex justify-center items-center text-2xl select-none whitespace-nowrap">{data.icon}</h1>
    <div>
        <h1 class="text-xl text-left">{data.data}</h1>
        <div class="flex gap-2 select-none text-muted-foreground w-[100%] overflow-hidden">
            <p class="w-[40%] overflow-hidden text-ellipsis whitespace-nowrap">{data.source}</p>
            <p>•</p>
            <p>{formatDate(data.created)}</p>
        </div>
    </div>
</content>