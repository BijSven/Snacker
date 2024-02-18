<script>
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
    import * as Tabs from "$lib/components/ui/tabs";
    import * as Card from "$lib/components/ui/card";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";

    import { toast } from 'svelte-sonner'
    import { onMount } from 'svelte'


    import PocketBase from '$lib/pb.js';
    import '$lib/dark.js';
    import '$lib/auth.js';

	const pb = new PocketBase();

    onMount(() => {
        if(localStorage.followUp === 'SIGNUP/VERIFYEMAIL' && !sessionStorage.getItem('TOAST?SHOWMAIL')) {
            toast.info('To continue, please verify your email, after that login!');
            sessionStorage.setItem('TOAST?SHOWMAIL', 'true');
            setTimeout(() => { sessionStorage.removeItem('TOAST?SHOWMAIL') }, 250);
        }
    });
    
    async function login(event) {
        event.preventDefault();
        
        let form = new FormData(document.getElementById('loginData'));

        try {
            await pb.collection('users').authWithPassword(
                form.get('user'),
                form.get('pasw'),
            );
        } catch {
            toast.error('Invalid details, check again!');
            return;
        }
        localStorage.removeItem('followUp');
        window.location.reload();
    }

    async function register(event) {
        event.preventDefault();

        let form = new FormData(document.getElementById('signupData'));

        try {

            let data = {
                "name": form.get('name'),
                "email": form.get('mail'),
                "username": form.get('user'),
                "password": form.get('pasw'),
                "passwordConfirm": form.get('pasc'),
            };

            if (!Object.values(data).every(value => value !== null && value !== undefined && value !== '')) {
                toast.error('Please fill in all fields!');
                return;
            }
            await pb.collection('users').create(data);
            await pb.collection('users').requestVerification(form.get('mail'));
            
            document.getElementById('CONFIRM_ACCOUNT_CREATION').click();
        } catch {
            toast.error('Something went wrong, please confirm all your information!');
            return;
        }

        localStorage.setItem('followUp', 'SIGNUP/VERIFYEMAIL');
        window.location.reload();
    }
</script>


<svelte:head>
	<title>Login - Snacker</title>
</svelte:head>

<content>
	<div class="absolute flex h-full w-full flex-row">
		<div class="box relative dark:brightness-75 flex h-full w-full bg-no-repeat bg-cover" style="background-image: url('https://images.unsplash.com/photo-1446034295857-c39f8844fad4');">
			<div class="right absolute right-0 flex h-full w-2/5 flex-col items-center justify-center rounded-bl-3xl rounded-tl-3xl backdrop-blur-md bg-opacity-75 dark:bg-opacity-75 bg-white dark:bg-black" >
				<div class="z-[1] relative h-full w-full flex flex-col items-center justify-center">
                    <img class="logo top-0 w-14" src="https://cdn.orae.one/snacker/logo/normal.png" style="margin-bottom: 2.5rem;" draggable="false" alt="Logo" />
                    <Tabs.Root value="auth" class="w-[60%]">
                        <Tabs.List class="grid w-full grid-cols-2">
                            <Tabs.Trigger value="auth">Login</Tabs.Trigger>
                            <Tabs.Trigger value="new">Register</Tabs.Trigger>
                        </Tabs.List>
                        <Tabs.Content value="auth" class="relative">
                            <Card.Root class="flex justify-center items-center flex-col px-[10%] pt-[10%] pb-[17.5%]">
                                <Card.Header class="text-center">
                                    <Card.Title class="text-[125%]">Welcome back!</Card.Title>
                                    <Card.Description>
                                        Enter your credentials to continue
                                    </Card.Description>
                                </Card.Header>
                                <form on:submit={login} id="loginData" class="gap-3 flex flex-col w-[80%]">
                                    <Input name="user" class="w-[100%]" type="email" placeholder="Email" required />
                                    <Input name="pasw" type="password" placeholder="Password" required />
                                    <Button type="submit" variant="outline">Inloggen</Button>
                                </form>
                            </Card.Root>
                        </Tabs.Content>
                        <Tabs.Content value="new" class="relative">
                            <Card.Root class="flex justify-center items-center flex-col p-[10%]">
                                <Card.Header class="text-center">
                                    <Card.Title class="text-[125%]">Lets start</Card.Title>
                                    <Card.Description id="errortxtregister">
                                        Lets track all your stuff, on one place.
                                    </Card.Description>
                                </Card.Header>
                                <form on:submit={register} id="signupData" class="gap-3 flex flex-col w-[80%]">
                                    <Input name="name" type="text" placeholder="Name" required />
                                    <Input name="mail" type="email" placeholder="Email" required />
                                    <Input name="user" type="text" placeholder="Username" required />
                                    <Input name="pasw" minlength="8" max="16" type="password" placeholder="Password" required />
                                    <Input name="pasc" minlength="8" max="16" type="password" placeholder="Confirm password" required />
                                    <Button type="submit" variant="outline">Register</Button>
                                    <AlertDialog.Root>
                                        <AlertDialog.Trigger class="hidden"><Button id="CONFIRM_ACCOUNT_CREATION">CONFIRM</Button></AlertDialog.Trigger>
                                        <AlertDialog.Content>
                                            <AlertDialog.Header>
                                            <AlertDialog.Title>Yea! Your account has been created!</AlertDialog.Title>
                                            <AlertDialog.Description>
                                                On this moment, your account is created on our servers, to login. Please verify your account
                                                via the email you have recieved from us. When done, you can login on the login page!
                                            </AlertDialog.Description>
                                            </AlertDialog.Header>
                                                <AlertDialog.Footer>
                                                    <AlertDialog.Action on:click={() => {window.location.reload()}}>Back to login</AlertDialog.Action>
                                                </AlertDialog.Footer>
                                        </AlertDialog.Content>
                                    </AlertDialog.Root>
                                </form>
                            </Card.Root>
                        </Tabs.Content>
                    </Tabs.Root>
                </div>
            </div>
		</div>
	</div>
</content>
