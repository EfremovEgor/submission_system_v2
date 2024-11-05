<script lang="ts">
    import { submission_statuses } from "$lib/aliases";
    import { Search } from "lucide-svelte";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import AccountInfoRow from "$components/account/accountInfoRow.svelte";
    import { presentation_formats, titles } from "$src/lib/aliases.js";
    import type { ActionResult } from "@sveltejs/kit";
    import { getNames } from "country-list";
    import SubmissionStatusText from "$components/common/submissionStatusText.svelte";
    import { formatAuthors } from "$src/lib/utils.client.js";
    let countries = getNames();
    countries.sort();
    export let data;
    $: user = data.userProfile;
    let isEditing = false;
    let rawSubmissions = data.submissions;
    let submissions = {};
    rawSubmissions.forEach((submission) => {
        if (!submissions[submission.conference.short_name])
            submissions[submission.conference.short_name] = {
                conference_data: {
                    acronym: submission.conference.acronym,
                },
                submissions: [],
            };
        submissions[submission.conference.short_name].submissions.push(
            submission,
        );
    });
    const formSubmitHandler = () => {
        invalidateAll();
        return async ({
            result,
            update,
        }: {
            result: ActionResult;
            update: any;
        }) => {
            if (result.data.errors == undefined) {
                isEditing = false;
                await invalidateAll();
                return;
            } else {
                update({ reset: false });
                return;
            }
        };
    };
</script>

<svelte:head>
    <title>Author Profile</title>
</svelte:head>
<div class="container">
    <div
        style="margin-bottom: var(--pico-typography-spacing-vertical);"
        class="flex items-baseline gap-2"
    >
        <h3 class="mb-0">Author Profile</h3>
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        {#if !isEditing}
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <span
                tabindex="0"
                on:keydown={() => (isEditing = true)}
                on:click={() => (isEditing = true)}
                class="edit-profile_button">Edit</span
            >
        {/if}
    </div>

    {#if isEditing}
        <form
            use:enhance={formSubmitHandler}
            autocomplete="off"
            method="post"
            class="flex flex-col gap-2"
        >
            <div class="mb-4">
                <button class="primary-button-hover outline mr-2">
                    Save
                </button>
                <button
                    on:click={() => (isEditing = false)}
                    class="button-red outline"
                >
                    Cancel
                </button>
            </div>
            <table class="w-fit">
                <AccountInfoRow name="Title" value={user.title} {isEditing}>
                    <select
                        name="title"
                        value={user.title}
                        style="margin:0"
                        class="w-full max-w-56"
                    >
                        {#each Object.entries(titles) as [value, alias]}
                            <option {value}>{alias}</option>
                        {/each}
                    </select>
                </AccountInfoRow>
                <AccountInfoRow
                    required
                    name="First name"
                    value={user.first_name}
                    {isEditing}
                >
                    <input
                        name="first_name"
                        required
                        value={user.first_name ?? ""}
                        class="w-full max-w-56"
                        style="margin:0"
                        type="text"
                    />
                </AccountInfoRow>
                <AccountInfoRow
                    required
                    name="Last name"
                    value={user.last_name}
                    {isEditing}
                >
                    <input
                        name="last_name"
                        required
                        value={user.last_name ?? ""}
                        class="w-full max-w-56"
                        style="margin:0"
                        type="text"
                    />
                </AccountInfoRow>
                <!-- <AccountInfoRow
                    name="Surname"
                    value={user.middle_name}
                    {isEditing}
                >
                    <input
                        name="middle_name"
                        value={user.middle_name ?? ""}
                        class="w-full max-w-56"
                        type="text"
                    />
                </AccountInfoRow> -->
                <AccountInfoRow
                    required
                    name="Affiliation"
                    value={user.affiliation}
                    {isEditing}
                >
                    <input
                        name="affiliation"
                        value={user.affiliation ?? ""}
                        class="w-full max-w-56"
                        style="margin:0"
                        type="text"
                    />
                </AccountInfoRow>
                <AccountInfoRow
                    required
                    name="Country"
                    value={user.country}
                    {isEditing}
                >
                    <select
                        name="country"
                        value={user.country}
                        class="w-full max-w-56"
                        style="margin:0"
                        required
                    >
                        {#each countries as country}
                            <option value={country}>{country}</option>
                        {/each}
                    </select>
                </AccountInfoRow>
                <!-- <AccountInfoRow name="City" value={user.city} {isEditing}>
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
                </AccountInfoRow> -->
                <AccountInfoRow name="ORCID" value={user.orcid_id} {isEditing}>
                    <input
                        name="orcid_id"
                        value={user.orcid_id ?? ""}
                        style="margin:0"
                        class="w-full max-w-56"
                        type="text"
                    />
                </AccountInfoRow>
                <AccountInfoRow
                    name="Web page"
                    value={user.web_page}
                    {isEditing}
                >
                    <input
                        name="web_page"
                        value={user.web_page ?? ""}
                        style="margin:0"
                        class="w-full max-w-56"
                        type="text"
                    />
                </AccountInfoRow>
            </table>
        </form>
    {:else}
        <table class="w-fit">
            <AccountInfoRow name="Email" value={user.email} />
            <AccountInfoRow name="Title" value={titles[user.title]} />
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
            <AccountInfoRow name="Affiliation" value={user?.affiliation} />
            <AccountInfoRow name="Country" value={user?.country} {isEditing} />
            {#if user.orcid_id}
                <AccountInfoRow name="ORCID" value={user?.orcid_id} />
            {/if}
            {#if user.web_page}
                <AccountInfoRow name="Web page" value={user?.web_page} />
            {/if}
        </table>
    {/if}
    {#if !isEditing}
        <h3>My Submissions</h3>
        {#if !rawSubmissions}
            <p>
                There are no submissions yet. To submit a new abstract, please
                proceed to the <a href="/call_for_papers">Call for Papers</a>.
            </p>
        {:else}
            <p>
                To submit a new abstract, please proceed to the <a
                    href="/call_for_papers">Call for Papers</a
                >.
            </p>
        {/if}
        {#each Object.entries(submissions) as [conference, data]}
            <details open>
                <summary class="w-fit" style="color:var(--pico-primary);"
                    >{conference}</summary
                >
                <div class="overflow-auto">
                    <table class="striped submissions">
                        <thead>
                            <tr>
                                <th scope="col" class="text-center"
                                    ><span class="sortable">#</span></th
                                >
                                <th scope="col" class="text-center"
                                    ><span class="sortable">Authors</span></th
                                >
                                <th scope="col" class="text-center"
                                    ><span class="sortable">Title</span></th
                                >
                                <th scope="col" class="text-center"
                                    ><span class="sortable">Topic</span></th
                                >
                                <th scope="col" class="text-center">
                                    <span class="sortable"
                                        >Presentation Format</span
                                    >
                                </th>
                                <th scope="col" class="text-center"
                                    ><span class="sortable">Submitted At</span
                                    ></th
                                >
                                <th scope="col" class="text-center"
                                    ><span class="sortable">View</span></th
                                >
                                <th scope="col" class="text-center"
                                    ><span class="sortable">Review Status</span
                                    ></th
                                >
                            </tr>
                        </thead>
                        <tbody>
                            {#each data.submissions as submission}
                                <tr>
                                    <td>
                                        {submission.local_id}
                                    </td>
                                    <td>
                                        {formatAuthors(submission.authors)}
                                    </td>
                                    <td>
                                        {submission.title}
                                    </td>
                                    <td>
                                        {submission.topic.name}
                                    </td>
                                    <td class="text-center">
                                        {presentation_formats[
                                            submission.presentation_format
                                        ]}
                                    </td>
                                    <td class="text-center">
                                        {submission.created_at.toLocaleString()}
                                    </td>
                                    <td>
                                        <a
                                            href="/call_for_papers/{data
                                                .conference_data
                                                .acronym}/submissions/{submission.id}/author"
                                            class="icon-button text-center"
                                        >
                                            <Search class="mx-auto" />
                                        </a>
                                    </td>
                                    <td class="text-center">
                                        <SubmissionStatusText
                                            status={submission.status}
                                        />
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </details>
        {/each}
    {/if}
</div>

<style>
    .submissions * {
        font-size: 16px !important;
    }
    .submissions td,
    .submissions th {
        padding: 5px !important;
    }
    .edit-profile_button {
        color: var(--pico-primary);
    }
    .edit-profile_button:hover {
        color: var(--pico-primary-hover);
        text-decoration: underline;
        cursor: pointer;
    }
</style>
