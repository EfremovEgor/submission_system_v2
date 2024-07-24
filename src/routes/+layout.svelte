<script lang="ts">
    import Footer from "$components/layout/footer.svelte";
    import Header from "$components/layout/header.svelte";
    import "../app.css";
</script>

<div class="flex flex-col min-h-screen h-full justify-between">
    <Header></Header>
    <main class="flex-1 flex">
        <slot />
    </main>
    <Footer></Footer>
</div>
