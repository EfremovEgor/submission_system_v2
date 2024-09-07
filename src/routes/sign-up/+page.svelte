<script lang="ts">
    import SubmitButton from "$components/common/submitButton.svelte";
    import type { ActionData } from "./$types";
    export let form: ActionData;
</script>

<div class="flex justify-center w-full self-center">
    <div class="shadow p-6 rounded w-11/12 sm:w-8/12 lg:w-1/2">
        <div class="lg:ml-10">
            <h1>Sign Up</h1>
            <span>Please fill in your credentials to login</span>
            <form autocomplete="off" method="post">
                <div class="input-container mt-2">
                    <label for="Email">Email</label><input
                        class="max-w-96"
                        type="email"
                        id="email"
                        required
                        name="email"
                        value={form?.data?.email ?? ""}
                        autocomplete="off"
                    />
                    {#if form?.errors?.email}
                        <span class="text-red-500">Incorrect email</span>
                    {/if}
                </div>
                <div class="input-container mt-2">
                    <label for="input_password">Password</label><input
                        class="max-w-96"
                        type="password"
                        id="password"
                        required
                        value={form?.data?.passwordConfirm ?? ""}
                        name="password"
                        autocomplete="off"
                    />
                    {#if form?.errors?.password}
                        <span class="text-red-500">Incorrect password</span>
                    {/if}
                </div>
                <div class="input-container mt-2">
                    <label for="repeat_password">Repeat passord</label><input
                        class="max-w-96"
                        required
                        type="password"
                        value={form?.data?.passwordConfirm ?? ""}
                        id="passwordConfirm"
                        name="passwordConfirm"
                    />
                    {#if form?.errors?.passwordConfirm}
                        <span class="text-red-500">Incorrect password</span>
                    {/if}
                </div>
                <SubmitButton Class="mt-4 w-36 sm:w-28 ">Sign up</SubmitButton>
                <p class="mt-3">
                    Already have an account?
                    <a class="bare-link" href="/sign-in"> Sign in now</a>.
                </p>
            </form>
        </div>
    </div>
</div>
