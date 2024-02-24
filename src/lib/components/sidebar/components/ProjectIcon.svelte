<script>
    export let project;

    import * as ContextMenu from "$lib/components/ui/context-menu";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import * as Dialog from "$lib/components/ui/dialog";

    import { Input } from '$lib/components/ui/input';
    import { Button } from '$lib/components/ui/button';

    import { DoorOpen } from 'lucide-svelte';
    import { Pencil } from 'lucide-svelte';

    import { toast } from "svelte-sonner";
    import { writable } from 'svelte/store'

    import PocketBase from "$lib/pb";
	import { onMount } from "svelte";

    const pb = new PocketBase();

    let openEdit;
    let openDelete;

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
        toast.success('Successfully left the project!');
    }

    async function updateData() {
        let key = 'NAV_PROJECT';
        let reset = 'NAV_CHANNEL';

        window.sessionStorage.setItem(reset, '');
        window.dispatchEvent(new StorageEvent('storage', { key: reset }));

        window.sessionStorage.setItem(key, project.id);
        window.dispatchEvent(new StorageEvent('storage', { key }));
    }
</script>

<ContextMenu.Root>
    <ContextMenu.Trigger>
        <button on:click={updateData} class="rounded-[100%] cursor-pointer text-xl hover:rounded-md min-h-16 min-w-16 duration-200 flex flex-col justify-center items-center bg-stone-300 hover:bg-stone-200 hover:dark:bg-stone-700 dark:bg-stone-800">
            {#if !project.logo}
                <h1>{data.icon}</h1>
            {:else}
                <img class="size-12 rounded-full" alt="Logo" src={pb.files.getUrl(project, project.logo, {'thumb': '100x100'})}>
            {/if}
        </button>
    </ContextMenu.Trigger>
    <ContextMenu.Content class="flex flex-col">
            <ContextMenu.Item on:click={() => {openEdit = true}} class="flex px-5 gap-2"><Pencil /> Edit project</ContextMenu.Item>
            <ContextMenu.Item on:click={() => {openDelete = true}} class="flex px-5 text-red-500 gap-2"><DoorOpen /> Leave project</ContextMenu.Item>
    </ContextMenu.Content>
</ContextMenu.Root>

<AlertDialog.Root bind:open={openDelete}>
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


<Dialog.Root bind:open={openEdit}>
    <Dialog.Content>
        <form on:submit|preventDefault={async (event) => {
            const formData = new FormData(event.target);

            let data = {
                name: formData.get('name'),
                ...((formData.get('logo').name != "") ? { logo: formData.get('logo') } : null),
            }

            console.log(data);

            await pb.collection('projects').update(project.id, data);

            toast.success('The project has been updated!');
        }} name="channel" class="flex flex-col gap-5">
            <Dialog.Header>
                <Dialog.Title>Edit channel</Dialog.Title>
                <Dialog.Description>
                    <Input name="name" class="mt-5" placeholder="Projectname" value={project.name}/>
                    <Input name="logo" class="mt-5" placeholder="Logo" type="file"/>
                </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
                <Button type="submit">Save changes</Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
