<script>
    import { PUBLIC_API_BASE_URL } from '$env/static/public';
    import { goto, invalidateAll } from "$app/navigation";
    import { user as currentUser } from "../store/userStore.js"

    const LOGIN_URL = PUBLIC_API_BASE_URL + "/login";

    let username = "";
    let password = "";
    let isLoading = false;
    let errorMessage = "";
    
    async function attemptLogin() {
        if (!username || !password) {
            errorMessage = "Please fill in all fields";
            return;
        }

        try {
            isLoading = true;
            errorMessage = "";

            const response = await fetch(LOGIN_URL, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

                if (response.ok) {
                    let user = await response.json();
                    currentUser.set(user);
                    goto("/dashboard", { invalidateAll: true }); 
                }

            else {
                const data = await response.json().catch(() => ({}));
                errorMessage = data.message || "Login failed. Please check your credentials.";
            }
        } catch (error) {
            console.error("Login error:", error);
            errorMessage = "Network error. Please try again.";
        } finally {
            isLoading = false;
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        attemptLogin();
    }
</script>

<div class="login-container">
    <form on:submit={handleSubmit} class="login-form">
        <h2>Login to BlogHub</h2>
        
        {#if errorMessage}
            <div class="error-message">
                {errorMessage}
            </div>
        {/if}
        
        <div class="form-group">
            <label for="username">Username</label>
            <input 
                type="text" 
                id="username" 
                name="username" 
                bind:value={username}
                placeholder="Enter your username"
                disabled={isLoading}
                required
            />
        </div>
        
        <div class="form-group">
            <label for="password">Password</label>
            <input 
                type="password" 
                id="password" 
                name="password" 
                bind:value={password}
                placeholder="Enter your password"
                disabled={isLoading}
                required
            />
        </div>
        
        <button type="submit" class="login-button" disabled={isLoading}>
            {#if isLoading}
                <span class="loading-spinner"></span>
                Logging in...
            {:else}
                Log in
            {/if}
        </button>
        
        <div class="register-link">
            Don't have an account? <a href="/register">Register here</a>
        </div>
    </form>
</div>

<style>
    .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 80vh;
        padding: 20px;
    }
    
    .login-form {
        background: var(--card-bg);
        padding: 30px;
        border-radius: 12px;
        box-shadow: var(--shadow);
        width: 100%;
        max-width: 400px;
    }
    
    h2 {
        color: var(--text-dark);
        margin-bottom: 24px;
        text-align: center;
        font-size: 24px;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    label {
        display: block;
        margin-bottom: 8px;
        color: var(--text-dark);
        font-weight: 500;
    }
    
    input {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 14px;
        transition: var(--transition);
    }
    
    input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(45, 91, 136, 0.1);
    }
    
    input:disabled {
        background-color: var(--light-bg);
        cursor: not-allowed;
    }
    
    .login-button {
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
    }
    
    .login-button:hover:not(:disabled) {
        background: var(--primary-dark);
    }
    
    .login-button:disabled {
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
    
    .register-link {
        margin-top: 20px;
        text-align: center;
        font-size: 14px;
        color: var(--text-medium);
    }
    
    .register-link a {
        color: var(--primary);
        text-decoration: none;
        font-weight: 600;
    }
    
    .register-link a:hover {
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
</style>