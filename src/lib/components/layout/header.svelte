<script lang="ts">
    import { t, locale, locales } from "$translations/index";
    import logo from "$images/logo.png";
    interface User {
        id: number;
        first_name: string;
        last_name: string;
        middle_name: string;
    }
    export let user: User;
    const handleChange = ({ currentTarget }: { currentTarget: any }) => {
        console.log(typeof currentTarget);
        const { value } = currentTarget;

        document.cookie = `lang=${value} ;`;
    };
</script>

<header>
    <nav class="border-gray-200 px-6 py-4 shadow-sm">
        <div
            class="flex justify-center flex-wrap gap-4 sm:justify-between items-center mx-auto max-w-screen-xl"
        >
            <ul
                class="flex justify-between items-center flex-row flex-wrap gap-4"
            >
                <li>
                    <div>
                        <a href="/">
                            <img
                                class="mr-3 h-10 sm:h-15"
                                src={logo}
                                alt="ConfChair Logo"
                            />
                        </a>
                    </div>
                </li>
                <li>
                    <a class="nav-link" href="/call_for_papers"
                        >{$t(`menu.call_for_papers`)}</a
                    >
                </li>
                <li>
                    <a class="nav-link" href="/author">{$t(`menu.author`)}</a>
                </li>
                <li>
                    <a class="nav-link" href="/reviewer"
                        >{$t(`menu.reviewer`)}</a
                    >
                </li>
                <li>
                    <a class="nav-link" href="/chair">{$t(`menu.chair`)}</a>
                </li>
            </ul>
            <div
                class="flex w-full justify-between sm:w-fit items-center flex-row gap-2"
            >
                {#if !user}
                    <a class="nav-link" href="/sign-in">{$t(`menu.sign_in`)}</a>
                    <div>
                        <a class="reverse-nav-link" href="/sign-up"
                            >{$t(`menu.sign_up`)}</a
                        >
                    </div>
                {:else}
                    <a class="nav-link" href="/profile"
                        >{user.first_name}
                        {user.last_name ? user.last_name[0] : ""}.
                        {user.middle_name ? user.middle_name[0] : ""}.</a
                    >
                    <div>
                        <a class="reverse-nav-link" href="/logout">Logout</a>
                    </div>
                {/if}

                <div>
                    <select
                        class="uppercase flex items-center text-slate-900 hover:text-blue-700 font-medium hover:bg-slate-50 p-2 rounded-xl transition-all ease-in-out"
                        bind:value={$locale}
                        on:change={handleChange}
                    >
                        {#each $locales as value}
                            <option {value} selected={$locale === value}
                                >{$t(`lang.${value}`)}</option
                            >
                        {/each}
                    </select>
                </div>
            </div>
        </div>
    </nav>
</header>
