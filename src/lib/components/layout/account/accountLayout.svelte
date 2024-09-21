<script lang="ts">
    import { page } from "$app/stores";
    import SideBar from "$components/account/sideBar/sideBar.svelte";
    export let userProfile;
</script>

<div class="container">
    <h1 class="page-heading">Account</h1>
    <div class="flex flex-row gap-6">
        <SideBar>
            <li>
                <a
                    class="nav-link {$page.url.pathname === '/account'
                        ? 'active'
                        : ''}"
                    href="/account">Account</a
                >
            </li>
            {#if userProfile.plan}
                <li>
                    <a
                        class="nav-link {$page.url.pathname === '/account/chair'
                            ? 'active'
                            : ''}"
                        href="/account/chair">Chair</a
                    >
                </li>
            {/if}
            <!-- <li><a class="nav-link" href="account/reviewer">Reviewer</a></li>
            <li><a class="nav-link" href="account/co_chair">Co-Chair</a></li>
            <li><a class="nav-link" href="account/loc">LOC</a></li> -->
            <li>
                <a
                    class="nav-link {$page.url.pathname === '/account/author'
                        ? 'active'
                        : ''}"
                    href="/account/author">Author</a
                >
            </li>
        </SideBar>
        <section class="p-2 w-full">
            <slot />
        </section>
    </div>
</div>
