<script lang="ts">
    import SideBar from "$components/account/sideBar/sideBar.svelte";
</script>

<div class="container">
    <h1 class="page-heading">Account</h1>
    <div class="flex flex-row gap-6">
        <SideBar />
        <section class="p-2 w-full">
            <slot />
        </section>
    </div>
</div>
