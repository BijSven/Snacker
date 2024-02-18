<script>
    export let data;
</script>

<content class="flex w-[40%] gap-4 rounded-sm p-5 bg-stone-800">
    <h1 class="size-12 bg-stone-700 rounded-sm flex justify-center items-center text-2xl select-none">{data.icon}</h1>
    <div>
        <h1 class="text-xl">{data.data}</h1>
        <div class="flex gap-2 select-none text-muted-foreground">
            <p>{data.source}</p>
            <p>•</p>
            <p>{data.created}</p>
        </div>
    </div>
</content>