<script>
    import * as Command from "$lib/components/ui/command";
    import PocketBase from "$lib/pb";
    import { onMount } from "svelte";

    const pb = new PocketBase();
    pb.autoCancellation(false);
   
    let open = false;

    let records = [];
    let ChannelRecords = [];

    async function fetchData() {
        try {
            records = await pb.collection('projects').getFullList({
                sort: '-created',
            });
            ChannelRecords = await pb.collection('channels').getFullList({
                filter: `project.id = "${sessionStorage.getItem('NAV_PROJECT')}"`,
                sort: '-created',
            });
        } catch (e) {
            records = [];
        }
    }
   
    onMount(() => {
      pb.collection('projects').subscribe('*', fetchData);
      document.addEventListener('REFRESH_PROJECTS', fetchData);
      fetchData();

      window.addEventListener('storage', function(event) {
            if(event.key == "NAV_PROJECT") {
                fetchData();
            }
        }, false);
        fetchData();
        pb.collection('channels').subscribe('*', fetchData, { filter: `project.id = "${sessionStorage.getItem('NAV_PROJECT')}"` });

      function handleKeydown(e) {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          open = !open;
        }
      }
   
      document.addEventListener("keydown", handleKeydown);
   
      return () => {
        document.removeEventListener("keydown", handleKeydown);
      };
    });

    function updateContext(record) {
      let key = 'NAV_PROJECT';
      let reset = 'NAV_CHANNEL';

      window.sessionStorage.setItem(reset, '');
      window.dispatchEvent(new StorageEvent('storage', { key: reset }));

      window.sessionStorage.setItem(key, record.id);
      window.dispatchEvent(new StorageEvent('storage', { key }));

      open = false;
    }

    function updateChannelContext(record) {
      let key = 'NAV_CHANNEL';

      sessionStorage.setItem('VIEW_PAGETYPE', 'default');
      window.dispatchEvent(new StorageEvent('storage', { key: 'VIEW_PAGETYPE' }));
      window.sessionStorage.setItem(key, record.id);
      window.dispatchEvent(new StorageEvent('storage', { key }));

      open = false;
    }
</script>
   
<Command.Dialog loop bind:open>
    <Command.Input placeholder="Type a command or search..." />
    <Command.List class="mt-2 mb-2">
        <Command.Empty>No results found.</Command.Empty>
        <Command.Group heading="Suggestions">
            <Command.Item class="flex gap-2 items-center" onSelect={() => { 
              document.getElementById('newProjectBTN').click();
              open = false;
             }}>New project</Command.Item>
            <Command.Item class="flex gap-2 items-center" onSelect={() => { 
                sessionStorage.setItem('VIEW_PAGETYPE', 'settings');
                window.dispatchEvent(new StorageEvent('storage', { key: 'VIEW_PAGETYPE' }))
                open = false;
             }}>Settings</Command.Item>
            <Command.Item class="flex gap-2 items-center" onSelect={() => {
              pb.authStore.clear();
              window.location.reload()
            }}>Logout</Command.Item>
        </Command.Group>
        <Command.Group heading="Projects">
          {#each records as record}
            <Command.Item value={`${record.name} ${record.id}`} onSelect={() => {updateContext(record)}}>{record.name}</Command.Item>
          {/each}
      </Command.Group>
      <Command.Group heading="Channels">
        {#each ChannelRecords as record}
          <Command.Item value={`${record.name} ${record.id}`} onSelect={() => {updateChannelContext(record)}}>{record.name}</Command.Item>
        {/each}
    </Command.Group>
    </Command.List>
</Command.Dialog>