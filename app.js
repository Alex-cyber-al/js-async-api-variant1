const searchBtn = document.getElementById("searchBtn");
const usernameInput = document.getElementById("usernameInput");
const profileDiv = document.getElementById("profile");
const reposDiv = document.getElementById("repos");
const loadingDiv = document.getElementById("loading");
const errorDiv = document.getElementById("error");

function showLoading() {
    loadingDiv.classList.remove("hidden");
}

function hideLoading() {
    loadingDiv.classList.add("hidden");
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");
}

function hideError() {
    errorDiv.textContent = "";
    errorDiv.classList.add("hidden");
}

async function fetchUser(username) {
    const response = await fetch(`https://api.github.com/users/${username}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Користувача не знайдено");
        }

        if (response.status === 403) {
            throw new Error("Перевищено ліміт запитів GitHub API");
        }

        throw new Error("Помилка отримання даних користувача");
    }

    return await response.json();
}

async function fetchRepos(username) {
    const response = await fetch(`https://api.github.com/users/${username}/repos`);

    if (!response.ok) {
        throw new Error("Не вдалося отримати репозиторії користувача");
    }

    return await response.json();
}

function displayProfile(user) {
    profileDiv.innerHTML = `
        <div class="profile-card">
            <img src="${user.avatar_url}" alt="Avatar">
            <h2>${user.name || "Ім'я не вказано"}</h2>
            <p><strong>Username:</strong> ${user.login}</p>
            <p><strong>Bio:</strong> ${user.bio || "Немає опису"}</p>
            <p><strong>Followers:</strong> ${user.followers}</p>
            <p><strong>Following:</strong> ${user.following}</p>
            <p><strong>Public repos:</strong> ${user.public_repos}</p>
            <a href="${user.html_url}" target="_blank">Відкрити профіль</a>
        </div>
    `;
}

function displayRepos(repos) {
    if (repos.length === 0) {
        reposDiv.innerHTML = "<h2>Репозиторії</h2><p>У користувача немає публічних репозиторіїв.</p>";
        return;
    }

    repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

    let html = "<h2>Репозиторії</h2>";

    repos.forEach((repo) => {
        html += `
            <div class="repo-card">
                <h3>${repo.name}</h3>
                <p>${repo.description || "Опис відсутній"}</p>

                <div class="repo-info">
                    <span>⭐ Stars: ${repo.stargazers_count}</span>
                    <span>🍴 Forks: ${repo.forks_count}</span>
                    <span>📅 Updated: ${new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>

                <p>
                    <a href="${repo.html_url}" target="_blank">
                        Відкрити репозиторій
                    </a>
                </p>
            </div>
        `;
    });

    reposDiv.innerHTML = html;
}

async function loadGitHubData() {
    const username = usernameInput.value.trim();

    if (!username) {
        showError("Введіть GitHub username");
        return;
    }

    hideError();
    showLoading();

    profileDiv.innerHTML = "";
    reposDiv.innerHTML = "";

    try {
        const [user, repos] = await Promise.all([
            fetchUser(username),
            fetchRepos(username)
        ]);

        displayProfile(user);
        displayRepos(repos);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

searchBtn.addEventListener("click", loadGitHubData);

usernameInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        loadGitHubData();
    }
});