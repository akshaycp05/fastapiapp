import { useState } from "react";
import { register } from "../Services/AuthService";
import "./Register.css";

type Props = {
    onSwitchToLogin: () => void;
};

function Register({ onSwitchToLogin }: Props) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await register({
                name,
                email,
                password,
                role,
            });

            alert("Registration successful! Please login.");
            onSwitchToLogin();
        } catch (error) {
            console.error("Error during registration:", error);
            alert("Registration failed");
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">

                <h1 className="register-title">
                    TalentSpark AI
                </h1>

                <p className="register-subtitle">
                    Create your account to get started.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="register-form"
                >

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

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

                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="student">Student</option>
                        <option value="company">Company</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button
                        type="submit"
                        className="register-submit-btn"
                    >
                        Register
                    </button>

                </form>

                <p className="login-text">
                    Already have an account?
                </p>

                <button
                    className="login-btn"
                    type="button"
                    onClick={onSwitchToLogin}
                >
                    Login
                </button>

            </div>
        </div>
    );
}

export default Register;