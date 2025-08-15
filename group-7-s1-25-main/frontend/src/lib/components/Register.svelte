<script> 
    import { PUBLIC_API_BASE_URL } from '$env/static/public';
    import { DateInput } from 'date-picker-svelte';
    import { goto } from "$app/navigation";
    import { onMount } from 'svelte';

    const EARLIEST_DATE = new Date("1900-01-01");
    const REGISTER_URL = PUBLIC_API_BASE_URL + "/register";

    let username = "";
    let firstname = "";
    let lastname = "";
    let password = "";
    let passwordCheck = "";
    let description = "";
    let dob = new Date();
    let avatar_id = 1; // Default avata id
    let takenUsernames = [];
    let isLoading = false;
    let errorMessage = "";
    let successMessage = "";

    const avatarOptions = [1, 2, 3, 4, 5]; // Avata ID

    function selectAvatar(id) {
        avatar_id = id;
    }

    async function registerUser(event) {
        event.preventDefault();
        
        if (!username || !firstname || !lastname || !password || !passwordCheck) {
            errorMessage = "Please fill in all required fields";
            return;
        }

        if (password !== passwordCheck) {
            errorMessage = "Passwords do not match";
            return;
        }

        if (password.length < 6) {
            errorMessage = "Password must be at least 6 characters long";
            return;
        }

        if (username.length > 16) {
            errorMessage = "Username must be less than 16 characters";
            return;
        }

        if (!description) {
            description = "No description provided";
        }

        try {
            isLoading = true;
            errorMessage = "";
            successMessage = "";

            const response = await fetch(REGISTER_URL, {
                method: "PUT",
                credentials: "include",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ 
                    username, 
                    firstname, 
                    lastname, 
                    password, 
                    description, 
                    dob: dob.toISOString(),
                    avatar_id 
                })
            });

            if (response.status === 201) {
                successMessage = "Registration successful! Redirecting to login...";
                setTimeout(() => {
                    goto("/login");
                }, 2000);
            } else if (response.status === 400) {
                const data = await response.json().catch(() => ({}));
                if (data.errors) {
                    errorMessage = Object.values(data.errors).join(", ");
                } else {
                    errorMessage = "Registration failed. Please check your input and try again.";
                }
            } else {
                errorMessage = "An unexpected error occurred. Please try again.";
            }
        } catch (error) {
            console.error("Registration error:", error);
            errorMessage = "Network error. Please try again.";
        } finally {
            isLoading = false;
        }
    }

    async function getTakenUsernames() {
        const response = await fetch(PUBLIC_API_BASE_URL + "/users")
        const users = await response.json();
        for (const user of users) {
            takenUsernames.push(user.username.toLowerCase());
        }
    }

    function checkUsernameUnique() {
        if (takenUsernames.includes(username.toLowerCase())) {
            errorMessage = "Username is already taken."
        } else {
            errorMessage = null
        }
    }

    function checkPasswordSame() {
        if (password !== passwordCheck) {
            errorMessage = "Passwords do not match";
        } else {
            errorMessage = null;
        }
    }

    onMount(getTakenUsernames);
</script>


<div class="register-container">
    <form on:submit={registerUser} class="register-form">
        <h2>Create Your Account</h2>
        
        {#if errorMessage}
            <div class="error-message">
                {errorMessage}
            </div>
        {/if}
        
        {#if successMessage}
            <div class="success-message">
                {successMessage}
            </div>
        {/if}
        
        <div class="form-row">
            <div class="form-group">
                <label for="username">Username *</label>
                <input 
                    type="text" 
                    id="username" 
                    name="username" 
                    bind:value={username}
                    on:change={checkUsernameUnique}
                    placeholder="Choose a username"
                    disabled={isLoading}
                    required
                />
            </div>
            
            <div class="form-group">
                <label for="firstname">First Name *</label>
                <input 
                    type="text" 
                    id="firstname" 
                    name="firstname" 
                    bind:value={firstname}
                    placeholder="Enter your first name"
                    disabled={isLoading}
                    required
                />
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="lastname">Last Name *</label>
                <input 
                    type="text" 
                    id="lastname" 
                    name="lastname" 
                    bind:value={lastname}
                    placeholder="Enter your last name"
                    disabled={isLoading}
                    required
                />
            </div>
            
            <div class="form-group">
                <label for="dob">Date of Birth *</label>
                <DateInput 
                    id="dob" 
                    min={EARLIEST_DATE} 
                    bind:value={dob} 
                    format="yyyy-MM-dd"
                    disabled={isLoading}
                />
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="password">Password *</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    bind:value={password}
                    placeholder="Create a password"
                    disabled={isLoading}
                    required
                />
            </div>
            
            <div class="form-group">
                <label for="passwordCheck">Confirm Password *</label>
                <input 
                    type="password" 
                    id="passwordCheck" 
                    name="passwordCheck" 
                    bind:value={passwordCheck}
                    on:change={checkPasswordSame}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    required
                />
            </div>
        </div>
        
        <div class="form-group">
            <label for="description">About You</label>
            <textarea 
                id="description" 
                name="description" 
                bind:value={description}
                placeholder="Tell us about yourself (optional)"
                disabled={isLoading}
                rows="3"
            ></textarea>
        </div>
        <fieldset class="form-group" style="border: none; padding: 0; margin: 0;">
            <legend style="margin-bottom: 8px;">Choose Your Avatar *</legend>
            <div class="avatar-selection">
                {#each avatarOptions as id}
                    <button
                        type="button"
                        class="avatar-option {avatar_id === id ? 'selected' : ''}"
                        aria-pressed={avatar_id === id}
                        aria-label="Select avatar {id}"
                        on:click={() => selectAvatar(id)}
                    >
                        <img src={`http://localhost:3000/images/${id}.jpg`} alt="avatar" />

                    </button>
                {/each}
            </div>
        </fieldset>

        
        <button type="submit" class="register-button" disabled={isLoading}>
            {#if isLoading}
                <span class="loading-spinner"></span>
                Creating Account...
            {:else}
                Create Account
            {/if}
        </button>
        
        <div class="login-link">
            Already have an account? <a href="/login">Log in here</a>
        </div>
    </form>
</div>

<style>
    .avatar-selection {
        display: flex;
        gap: 12px;
        margin-top: 8px;
        flex-wrap: wrap;
    }

    .avatar-option {
        border: 2px solid transparent;
        border-radius: 50%;
        overflow: hidden;
        width: 64px;
        height: 64px;
        cursor: pointer;
        transition: border-color 0.3s;
    }

    .avatar-option img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .avatar-option.selected {
        border-color: var(--primary);
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    }

    .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 80vh;
        padding: 20px;
    }
    
    .register-form {
        background: var(--card-bg);
        padding: 30px;
        border-radius: 12px;
        box-shadow: var(--shadow);
        width: 100%;
        max-width: 600px;
    }
    
    h2 {
        color: var(--text-dark);
        margin-bottom: 24px;
        text-align: center;
        font-size: 24px;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    .form-row .form-group {
        margin-bottom: 0;
    }
    
    label {
        display: block;
        margin-bottom: 8px;
        color: var(--text-dark);
        font-weight: 500;
    }
    
    input, textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 14px;
        transition: var(--transition);
        font-family: inherit;
    }
    
    textarea {
        resize: vertical;
        min-height: 80px;
    }
    
    input:focus, textarea:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(45, 91, 136, 0.1);
    }
    
    input:disabled, textarea:disabled {
        background-color: var(--light-bg);
        cursor: not-allowed;
    }
    
    .register-button {
        width: 100%;
        padding: 12px;
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition);
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin-top: 20px;
    }
    
    .register-button:hover:not(:disabled) {
        background: var(--primary-dark);
    }
    
    .register-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .error-message {
        background: rgba(210, 43, 43, 0.1);
        color: var(--accent);
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 14px;
        text-align: center;
    }
    
    .success-message {
        background: rgba(45, 91, 136, 0.1);
        color: var(--primary);
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 14px;
        text-align: center;
    }
    
    .login-link {
        margin-top: 20px;
        text-align: center;
        font-size: 14px;
        color: var(--text-medium);
    }
    
    .login-link a {
        color: var(--primary);
        text-decoration: none;
        font-weight: 600;
    }
    
    .login-link a:hover {
        text-decoration: underline;
    }
    
    .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
    
    :global(.date-picker) {
        width: 100%;
    }
    
    :global(.date-picker input) {
        width: 100%;
    }
    
    @media (max-width: 640px) {
        .form-row {
            grid-template-columns: 1fr;
            gap: 0;
        }
        
        .form-row .form-group {
            margin-bottom: 20px;
        }
    }
</style>