import React, { useState } from "react";

const SignIn: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // HTMLフォーム形式（x-www-form-urlencoded）で送信するためのデータを作成
        const formData = new URLSearchParams();
        formData.append("user[email]", email);
        formData.append("user[password]", password);

        try {
            const res = await fetch("/users/sign_in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString(),
                credentials: "include", // Cookieを保存して認可画面で使えるようにする
            });

            if (res.ok) {
                console.log("ログイン成功");
                // TODO: /oauth/authorize へリダイレクトなど次の処理
            } else {
                console.error("ログイン失敗", await res.text());
            }
        } catch (err) {
            console.error("通信エラー", err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button type="submit">Sign In</button>
        </form>
    );
};

export default SignIn;
