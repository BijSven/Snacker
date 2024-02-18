<script>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
	import { buttonVariants } from "$lib/components/ui/button";
	import { cn } from "$lib/utils";
	let className = undefined;
	export { className as class };
</script>

<AlertDialogPrimitive.Action
	class={cn(buttonVariants(), className)}
	{...$$restProps}
	on:click
	on:keydown
	let:builder
>
	<slot {builder} />
</AlertDialogPrimitive.Action>
