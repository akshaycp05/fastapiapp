import { useState } from "react";
import { login } from "../Services/AuthService";
import "./Login.css";

type Props = {
    onLogin: (token: string) => void;
    onSwitchToRegister: () => void;
};

function Login({ onLogin, onSwitchToRegister }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await login({ email, password });
            onLogin(response.access_token);
        } catch (error) {
            console.error("Error during login:", error);
            alert("Login failed");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <h1 className="login-title">TalentSpark AI</h1>

                <p className="login-subtitle">
                    Welcome back! Login to continue.
                </p>

                <form onSubmit={handleSubmit} className="login-form">

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" className="login-btn">
                        Login
                    </button>

                </form>

                <p className="register-text">
                    Don't have an account?
                </p>

                <button
                    className="register-btn"
                    type="button"
                    onClick={onSwitchToRegister}
                >
                    Create Account
                </button>

            </div>
        </div>
    );
}

export default Login;