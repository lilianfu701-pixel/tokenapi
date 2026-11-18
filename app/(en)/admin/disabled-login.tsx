"use client";

// Same login card the admin page showed. Submit does not call a server action.
export function DisabledLogin() {
  return (
    <main className="adm-login">
      <form
        className="adm-card"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <h1>Gateway admin</h1>
        <label>
          Password
          <input type="password" name="password" autoComplete="current-password" required autoFocus />
        </label>
        <button type="submit" className="adm-btn">Sign in</button>
      </form>
    </main>
  );
}
