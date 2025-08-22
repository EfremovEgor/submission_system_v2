<script lang="ts">
    import { t, locale, locales } from "$translations/index";
    import logo from "$images/logo.png";
    import { page } from "$app/stores";
    import { UserRound } from "lucide-svelte";
    import type { layoutUser } from "$src/lib/types/interfaces";
    export let user: layoutUser;
    const handleChange = ({ currentTarget }: { currentTarget: any }) => {
        const { value } = currentTarget;

        document.cookie = `lang=${value} ;`;
    };
</script>

<header class="hidden sm:block">
    <div class="container">
        <nav>
            <ul>
                <!-- <li>
                    <div class="logo-container">
                        <a href="/">
                            <img class="logo" src={logo} alt="ConfChair Logo" />
                        </a>
                    </div>
                </li> -->
                <!-- <li
                    aria-current={$page.url.pathname === "/call_for_papers"
                        ? "page"
                        : undefined}
                >
                    {#if $page.url.pathname === "/call_for_papers"}
                        <a
                            style="text-decoration: underline;"
                            href="/call_for_papers">Call for Papers</a
                        >
                    {:else}
                        <a href="/call_for_papers">Call for Papers</a>
                    {/if}

                </li> -->
                {#if user}
                    <li
                        aria-current={$page.url.pathname === "/author"
                            ? "page"
                            : undefined}
                    >
                        {#if $page.url.pathname === "/author"}
                            <a
                                style="text-decoration: underline;"
                                href="/author">Author</a
                            >
                        {:else}
                            <a href="/author">Author</a>
                        {/if}
                    </li>
                    {#if user.is_loc}
                        <li
                            aria-current={$page.url.pathname === "/loc"
                                ? "page"
                                : undefined}
                        >
                            {#if $page.url.pathname === "/loc"}
                                <a
                                    style="text-decoration: underline;"
                                    href="/loc">LOC</a
                                >
                            {:else}
                                <a href="/loc">LOC</a>
                            {/if}
                        </li>
                    {/if}
                    {#if user.is_chair}
                        <li
                            aria-current={$page.url.pathname === "/chair"
                                ? "page"
                                : undefined}
                        >
                            {#if $page.url.pathname === "/chair"}
                                <a
                                    style="text-decoration: underline;"
                                    href="/chair">Chair</a
                                >
                            {:else}
                                <a href="/chair">Chair</a>
                            {/if}
                        </li>
                    {/if}
                {/if}
            </ul>
            {#if user}
                <ul>
                    <li
                        aria-current={$page.url.pathname === "/logout"
                            ? "page"
                            : undefined}
                    >
                        <div class="logout-container">
                            <a href="/logout">Logout</a>
                            <span>{user.email}</span>
                            <span>{user.first_name} {user.last_name}</span>
                        </div>
                    </li>
                </ul>
            {:else}
                <ul>
                    <li
                        aria-current={$page.url.pathname === "/sign-in"
                            ? "page"
                            : undefined}
                    >
                        <a href="/sign-in">Sign in</a>
                    </li>
                    <li
                        aria-current={$page.url.pathname === "/sign-up"
                            ? "page"
                            : undefined}
                    >
                        <a href="/sign-up">Create account</a>
                    </li>
                </ul>
            {/if}
        </nav>
    </div>
</header>
<header class="block sm:hidden">
    <div class="container">
        <nav class="flex flex-col justify-center align-middle items-center">
            <ul>
                <li>
                    <div class="logo-container" style="margin:0">
                        <a href="/">
                            <img class="logo" src={logo} alt="ConfChair Logo" />
                        </a>
                    </div>
                </li>
            </ul>
            <ul class="flex flex-row justify-evenly w-full">
                <li
                    aria-current={$page.url.pathname === "/call_for_papers"
                        ? "page"
                        : undefined}
                >
                    {#if $page.url.pathname === "/call_for_papers"}
                        <a
                            style="text-decoration: underline;"
                            href="/call_for_papers">Call for Papers</a
                        >
                    {:else}
                        <a href="/call_for_papers">Call for Papers</a>
                    {/if}
                </li>

                {#if user}
                    {#if user.is_chair || user.is_loc}
                        <li>
                            <details class="dropdown">
                                <summary role="button" class="outline">
                                    Role
                                </summary>

                                <ul dir="rtl">
                                    <li
                                        aria-current={$page.url.pathname ===
                                        "/author"
                                            ? "page"
                                            : undefined}
                                    >
                                        {#if $page.url.pathname === "/author"}
                                            <a
                                                style="text-decoration: underline;"
                                                href="/author">Author</a
                                            >
                                        {:else}
                                            <a href="/author">Author</a>
                                        {/if}
                                    </li>
                                    {#if user.is_loc}
                                        <li
                                            aria-current={$page.url.pathname ===
                                            "/loc"
                                                ? "page"
                                                : undefined}
                                        >
                                            {#if $page.url.pathname === "/loc"}
                                                <a
                                                    style="text-decoration: underline;"
                                                    href="/loc">LOC</a
                                                >
                                            {:else}
                                                <a href="/loc">LOC</a>
                                            {/if}
                                        </li>
                                    {/if}
                                    {#if user.is_chair}
                                        <li
                                            aria-current={$page.url.pathname ===
                                            "/chair"
                                                ? "page"
                                                : undefined}
                                        >
                                            {#if $page.url.pathname === "/chair"}
                                                <a
                                                    style="text-decoration: underline;"
                                                    href="/chair">Chair</a
                                                >
                                            {:else}
                                                <a href="/chair">Chair</a>
                                            {/if}
                                        </li>
                                    {/if}
                                </ul>
                            </details>
                        </li>
                        <li><a href="/logout">Logout</a></li>
                    {:else}
                        <li
                            aria-current={$page.url.pathname === "/author"
                                ? "page"
                                : undefined}
                        >
                            {#if $page.url.pathname === "/author"}
                                <a
                                    style="text-decoration: underline;"
                                    href="/author">Author</a
                                >
                            {:else}
                                <a href="/author">Author</a>
                            {/if}
                        </li>
                        <li><a href="/logout">Logout</a></li>
                    {/if}
                {:else}
                    <li
                        aria-current={$page.url.pathname === "/sign-in"
                            ? "page"
                            : undefined}
                    >
                        <a href="/sign-in">Sign in</a>
                    </li>
                    <li
                        aria-current={$page.url.pathname === "/sign-up"
                            ? "page"
                            : undefined}
                    >
                        <a href="/sign-up">Create account</a>
                    </li>
                {/if}
            </ul>
        </nav>
    </div>
</header>

<style>
    .logo-container {
        display: flex;
        flex-direction: column;
        margin-right: 20px;
    }
    .logo-container > a > * {
        margin: 0;
        white-space: nowrap;
    }
    .logo-container > a {
        text-decoration: none;
    }
    header {
        border-radius: var(--pico-border-radius);
        background: var(--pico-card-background-color);
        box-shadow: var(--pico-card-box-shadow);
        margin-bottom: 40px;
    }
    .logo {
        max-height: 70px;
    }
    .logout-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .logout-container > span {
        font-size: 10px;
    }
</style>
