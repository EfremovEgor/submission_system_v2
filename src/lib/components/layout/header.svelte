<script lang="ts">
    import { t, locale, locales } from "$translations/index";
    import logo from "$images/logo.png";
    import { page } from "$app/stores";
    import { UserRound } from "lucide-svelte";
    interface User {
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

<header>
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
                    {#if $page.url.pathname.includes("call_for_papers")}
                        <a
                            style="text-decoration: underline;"
                            href="/call_for_papers">Call For Papers</a
                        >
                    {:else}
                        <a href="/call_for_papers">Call For Papers</a>
                    {/if}

                    <!-- else content here -->
                </li>
                {#if user}
                    <li
                        aria-current={$page.url.pathname === "/author"
                            ? "page"
                            : undefined}
                    >
                        {#if $page.url.pathname.includes("author")}
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
                        </div>
                    </li>
                </ul>
            {:else}
                <ul>
                    <li
                        aria-current={$page.url.pathname === "/login"
                            ? "page"
                            : undefined}
                    >
                        <a href="/login">Sign in</a>
                    </li>
                    <li
                        aria-current={$page.url.pathname === "/register"
                            ? "page"
                            : undefined}
                    >
                        <a href="/register">Create account</a>
                    </li>
                </ul>
            {/if}
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
