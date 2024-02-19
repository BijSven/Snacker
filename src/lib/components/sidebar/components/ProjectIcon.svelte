<script>
    export let project;

    import * as ContextMenu from "$lib/components/ui/context-menu";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";

    import { DoorOpen } from 'lucide-svelte';

    import { toast } from "svelte-sonner";
    import { writable } from 'svelte/store'

    import PocketBase from "$lib/pb";
    import Snacker from '$lib/sdk.js';

    const pb = new PocketBase();
    const sk = new Snacker('uuop9nubbp1zrt5');

    let data = {
        "icon": project.name.split(' ').map(word => word.charAt(0)).join('')
    }

    async function leaveProject() {
        let user = pb.authStore.model;
        let members = project.members;

        var index = members.indexOf(user.id);
        index !== -1 ? members.splice(index, 1) : null;

        if (members.length <= 0) {
            await pb.collection('projects').delete(project.id);
            sessionStorage.clear();
            toast.success('Project has been deleted!');
            return;
        };

        let newData = {
            "members": members
        };

        await pb.collection('projects').update(project.id, newData);
        document.dispatchEvent(new CustomEvent('REFRESH_PROJECTS'));
        sk.sendLog('🚪', 'User left project', 'Snacker/Projects');
        toast.success('Successfully left the project!');
    }

    async function updateData() {
        let key = 'NAV_PROJECT';
        let reset = 'NAV_CHANNEL';

        sk.sendLog('😅', 'User switched project', 'Snacker/Projects');

        window.sessionStorage.setItem(reset, '');
        window.dispatchEvent(new StorageEvent('storage', { key: reset }));

        window.sessionStorage.setItem(key, project.id);
        window.dispatchEvent(new StorageEvent('storage', { key }));
    }
</script>
<AlertDialog.Root>
    <ContextMenu.Root>
        <ContextMenu.Trigger>
            <button on:click={updateData} class="rounded-[100%] cursor-pointer text-xl hover:rounded-md min-h-16 min-w-16 duration-200 flex flex-col justify-center items-center hover:bg-stone-700 bg-stone-800">
                {#if !project.logo}
                    <h1>{data.icon}</h1>
                {:else}
                    <img class="size-12 rounded-full" alt="Logo" src={`https://snacker.db.orae.one/api/files/projects/${project.id}/${project.logo}`}>
                {/if}
            </button>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
                <AlertDialog.Trigger>
                    <ContextMenu.Item class="flex px-5 text-red-500 gap-2"><DoorOpen /> Leave project</ContextMenu.Item>
                </AlertDialog.Trigger>
        </ContextMenu.Content>
    </ContextMenu.Root>
    <AlertDialog.Content>
        <AlertDialog.Header>
        <AlertDialog.Title>Deletion of <span class="font-bold">{project.name}</span></AlertDialog.Title>
        <AlertDialog.Description>
            This action will delete you from this project, that means you can't access any of the data inside the project.
            When your the last one in the project. The project will be deleted from our servers.
        </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            {#if Math.random() <  0.1}
                <AlertDialog.Action on:click={leaveProject}>H*eck yea, continue!</AlertDialog.Action>
            {:else}
                <AlertDialog.Action on:click={leaveProject}>Continue</AlertDialog.Action>
            {/if}
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
