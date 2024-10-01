<script lang="ts">
    import { t, locale, locales } from "$translations/index";
    import logo from "$images/logo.png";
    import { page } from "$app/stores";
    import { UserRound } from "lucide-svelte";
    interface User {
        email: string;
        id: number;
        first_name: string;
        last_name: string;
        middle_name: string;
    }
    export let user: User;
    const handleChange = ({ currentTarget }: { currentTarget: any }) => {
        const { value } = currentTarget;

        document.cookie = `lang=${value} ;`;
    };
</script>

<header class="hidden sm:block">
    <div class="container">
        <nav>
            <ul>
                <li>
                    <div class="logo-container">
                        <a href="/">
                            <img class="logo" src={logo} alt="ConfChair Logo" />
                        </a>
                    </div>
                </li>
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

                    <!-- else content here -->
                </li>
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
                    <li>
                        <details class="dropdown">
                            <summary role="button" class="outline">
                                Account
                            </summary>
                            <ul dir="rtl">
                                {#if user}
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
                                {/if}
                                <li><a href="/logout">Logout</a></li>
                            </ul>
                        </details>
                    </li>
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
