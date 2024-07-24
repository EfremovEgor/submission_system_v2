<script>
    import SubmitButton from "$components/common/submitButton.svelte";
</script>

<div class="flex justify-center w-full self-center">
    <div class="shadow p-6 rounded w-11/12 sm:w-8/12 lg:w-1/2">
        <div class="lg:ml-10">
            <h1>Sign In</h1>
            <span>Please fill in your credentials to login</span>
            <form>
                <div class="input-container mt-2">
                    <label for="Email">Email</label><input
                        class="max-w-96"
                        type="email"
                        id="email"
                        name="email"
                    />
                </div>
                <div class="input-container mt-2">
                    <label for="password">Password</label><input
                        class="max-w-96"
                        type="password"
                        id="password"
                        name="password"
                    />
                </div>
                <SubmitButton Class="mt-4 w-36 sm:w-28 ">Login</SubmitButton>
                <p class="mt-3">
                    Don't have an account?
                    <a class="bare-link" href="/sign-up"> Sign up now</a>.
                </p>
            </form>
        </div>
    </div>
</div>
