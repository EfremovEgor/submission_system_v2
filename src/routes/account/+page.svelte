<script lang="ts">
    import AccountInfoRow from "$components/account/accountInfoRow.svelte";
    import AccountLayout from "$components/layout/account/accountLayout.svelte";
    export let data;
    const user = data.user;
</script>

<AccountLayout>
    <div class="flex flex-col gap-2">
        <AccountInfoRow name="Title" value={user.title} />
        <AccountInfoRow name="First name" value={user.first_name} />
        <AccountInfoRow name="Last name" value={user.last_name} />
        <AccountInfoRow name="Surname" value={user.middle_name} />
        <AccountInfoRow name="Affiliation" value={user.affilitation} />
        <AccountInfoRow name="Country" value={user.country} />
        <AccountInfoRow name="City" value={user.city} />
        <AccountInfoRow name="State" value={user.state} />
        <AccountInfoRow name="ORCID" value={user.orcid_id} />
        <AccountInfoRow name="Web page" value={user.web_page} />
    </div>
</AccountLayout>
