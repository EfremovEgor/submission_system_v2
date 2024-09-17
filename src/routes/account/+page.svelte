<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import AccountInfoRow from "$components/account/accountInfoRow.svelte";
    import AccountLayout from "$components/layout/account/accountLayout.svelte";
    import type { ActionResult } from "@sveltejs/kit";

    export let data;
    const user = data.user;
    let isEditing = false;

    const formSubmitHandler = () => {
        return async ({
            result,
            update,
        }: {
            result: ActionResult;
            update: any;
        }) => {
            await update({ reset: false });
            if (result.type == "success") {
                isEditing = false;
                invalidateAll();
            } else {
            }
        };
    };
</script>

<AccountLayout>
    {#if isEditing}
        <form
            use:enhance={formSubmitHandler}
            autocomplete="off"
            method="post"
            class="flex flex-col gap-2"
        >
            <AccountInfoRow name="Title" value={user.title} {isEditing}>
                <select name="title" class="w-full max-w-56">
                    <option value="mr">Mr</option>
                </select>
            </AccountInfoRow>
            <AccountInfoRow
                name="First name*"
                value={user.first_name}
                {isEditing}
            >
                <input
                    name="first_name"
                    required
                    value={user.first_name ?? ""}
                    class="w-full max-w-56"
                    type="text"
                />
            </AccountInfoRow>
            <AccountInfoRow
                name="Last name*"
                value={user.last_name}
                {isEditing}
            >
                <input
                    name="last_name"
                    required
                    value={user.last_name ?? ""}
                    class="w-full max-w-56"
                    type="text"
                />
            </AccountInfoRow>
            <AccountInfoRow name="Surname" value={user.middle_name} {isEditing}>
                <input
                    name="middle_name"
                    value={user.middle_name ?? ""}
                    class="w-full max-w-56"
                    type="text"
                />
            </AccountInfoRow>
            <AccountInfoRow
                name="Affiliation"
                value={user.affilitation}
                {isEditing}
            >
                <input
                    name="affilitation"
                    value={user.affilitation ?? ""}
                    class="w-full max-w-56"
                    type="text"
                />
            </AccountInfoRow>
            <AccountInfoRow name="Country" value={user.country} {isEditing}>
                <input
                    name="country"
                    value={user.country ?? ""}
                    class="w-full max-w-56"
                    type="text"
                />
            </AccountInfoRow>
            <AccountInfoRow name="City" value={user.city} {isEditing}>
                <input
                    name="city"
                    value={user.city ?? ""}
                    class="w-full max-w-56"
                    type="text"
                />
            </AccountInfoRow>
            <AccountInfoRow name="State" value={user.state} {isEditing}>
                <input
                    name="state"
                    value={user.state ?? ""}
                    class="w-full max-w-56"
                    type="text"
                />
            </AccountInfoRow>
            <AccountInfoRow name="ORCID" value={user.orcid_id} {isEditing}>
                <input
                    name="orcid_id"
                    value={user.orcid_id ?? ""}
                    class="w-full max-w-56"
                    type="text"
                />
            </AccountInfoRow>
            <AccountInfoRow name="Web page" value={user.web_page} {isEditing}>
                <input
                    name="web_page"
                    value={user.web_page ?? ""}
                    class="w-full max-w-56"
                    type="text"
                />
            </AccountInfoRow>
            <div>
                <button class="button button-green mt-4"> Save </button>
                <button
                    on:click={() => (isEditing = false)}
                    type="reset"
                    class="button button-red mt-4"
                >
                    Cancel
                </button>
            </div>
        </form>
    {:else}
        <div class="flex flex-col gap-2">
            <AccountInfoRow name="Title" value={user.title} />
            <AccountInfoRow
                name="First name"
                value={user.first_name}
                {isEditing}
            />
            <AccountInfoRow
                name="Last name"
                value={user.last_name}
                {isEditing}
            />
            <AccountInfoRow name="Surname" value={user.middle_name} />
            <AccountInfoRow name="Affiliation" value={user.affilitation} />
            <AccountInfoRow name="Country" value={user.country} {isEditing} />
            <AccountInfoRow name="City" value={user.city} {isEditing} />
            <AccountInfoRow name="State" value={user.state} {isEditing} />
            <AccountInfoRow name="ORCID" value={user.orcid_id} />
            <AccountInfoRow name="Web page" value={user.web_page} />
            <div>
                <button on:click={() => (isEditing = true)} class="button mt-4">
                    Edit
                </button>
            </div>
        </div>
    {/if}
</AccountLayout>
