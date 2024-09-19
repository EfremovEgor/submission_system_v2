<script>
    import { onMount } from "svelte";

    // @ts-nocheck

    export let open = false;
    export let name;
    onMount(() => {
        document.addEventListener("keydown", (event) => {
            if (event.key == "Escape") open = false;
        });
    });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    on:click={function (event) {
        if (event.target == this) open = false;
    }}
    class="{open ? 'flex' : 'hidden'} 
        items-center justify-center top-0
        left-0 fixed w-full h-full
        bg-black/70"
>
    <div
        class="flex flex-col bg-slate-50 min-w-[30%] min-h-[30%] m-auto rounded-md p-5 shadow-xl shadow-black/50"
    >
        <div>
            <button
                class="text-3xl float-end flex items-center justify-center leading-6"
                on:click={() => (open = false)}
            >
                &times;</button
            >
            <h1 class="text-center">{name}</h1>
        </div>
        <div
            class="mt-5 w-full h-full flex flex-col justify-center align-middle flex-1"
        >
            <slot name="body"></slot>
        </div>

        <div class="mt-auto flex flex-row justify-end gap-3">
            <slot name="buttons"></slot>
        </div>
    </div>
</div>
