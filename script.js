
let users = JSON.parse(localStorage.getItem("users")) || [];
let posts = JSON.parse(localStorage.getItem("posts")) || [];
let currentUser = localStorage.getItem("currentUser");
let selectedPostId = null;

function saveData() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("posts", JSON.stringify(posts));
}

function register() {
    const name = document.getElementById("registerName").value.trim();
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const error = document.getElementById("registerError");

    if (!name || !username || !password) {
        error.innerText = "Please fill all fields.";
        return;
    }

    if (username.length < 3) {
        error.innerText = "Username must contain at least 3 characters.";
        return;
    }

    if (password.length < 4) {
        error.innerText = "Password must contain at least 4 characters.";
        return;
    }

    const existingUser = users.find(
        user => user.username.toLowerCase() === username.toLowerCase()
    );

    if (existingUser) {
        error.innerText = "Username already exists.";
        return;
    }

    const newUser = {
        id: Date.now(),
        name: name,
        username: username,
        password: password,
        followers: [],
        following: []
    };

    users.push(newUser);
    saveData();

    alert("Registration successful! 🔥");

    document.getElementById("registerName").value = "";
    document.getElementById("registerUsername").value = "";
    document.getElementById("registerPassword").value = "";

    showLogin();
}

function login() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const error = document.getElementById("loginError");

    const user = users.find(
        u => u.username.toLowerCase() === username.toLowerCase() &&
             u.password === password
    );

    if (!user) {
        error.innerText = "Invalid username or password.";
        return;
    }

    currentUser = user.id;

    localStorage.setItem("currentUser", currentUser);
    error.innerText = "";

    showApp();
}

function logout() {
    localStorage.removeItem("currentUser");
    currentUser = null;
    showLogin();
}

function showLogin() {
    document.getElementById("loginPage").classList.remove("hidden");
    document.getElementById("registerPage").classList.add("hidden");
    document.getElementById("appPage").classList.add("hidden");
}

function showRegister() {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("registerPage").classList.remove("hidden");
    document.getElementById("appPage").classList.add("hidden");
}

function showApp() {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("registerPage").classList.add("hidden");
    document.getElementById("appPage").classList.remove("hidden");
    showHome();
}

function showHome() {
    document.getElementById("homePage").classList.remove("hidden");
    document.getElementById("usersPage").classList.add("hidden");
    document.getElementById("profilePage").classList.add("hidden");
    displayFeed();
}

function showUsers() {
    document.getElementById("homePage").classList.add("hidden");
    document.getElementById("usersPage").classList.remove("hidden");
    document.getElementById("profilePage").classList.add("hidden");
    displayUsers();
}

function showProfile() {
    document.getElementById("homePage").classList.add("hidden");
    document.getElementById("usersPage").classList.add("hidden");
    document.getElementById("profilePage").classList.remove("hidden");
    displayProfile();
}

function getCurrentUser() {
    return users.find(user => user.id == currentUser);
}

function createPost() {
    const text = document.getElementById("postText").value.trim();

    if (!text) {
        alert("Please write something!");
        return;
    }

    const newPost = {
        id: Date.now(),
        userId: Number(currentUser),
        text: text,
        likes: [],
        comments: [],
        createdAt: new Date().toLocaleString()
    };

    posts.unshift(newPost);
    saveData();

    document.getElementById("postText").value = "";
    document.getElementById("charCount").innerText = "0/280";

    displayFeed();
}

document.addEventListener("input", function(event) {
    if (event.target.id === "postText") {
        document.getElementById("charCount").innerText =
            event.target.value.length + "/280";
    }
});

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = String(text ?? "");
    return div.innerHTML;
}

function displayFeed() {
    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    const user = getCurrentUser();
    if (!user) return;

    const visiblePosts = posts.filter(post =>
        post.userId == user.id ||
        user.following.includes(Number(post.userId))
    );

    if (visiblePosts.length === 0) {
        feed.innerHTML = `
            <div class="empty-post">
                <h3>No posts yet 🔥</h3>
                <p>Go to Users and follow someone to see their posts.</p>
            </div>`;
        return;
    }

    visiblePosts.forEach(post => {
        const postUser = users.find(u => u.id == post.userId);
        if (!postUser) return;

        if (!post.likes) post.likes = [];
        if (!post.comments) post.comments = [];

        const isLiked = post.likes.includes(Number(currentUser));
        const postElement = document.createElement("div");
        postElement.className = "post";

        postElement.innerHTML = `
            <div class="post-header">
                <div class="avatar">${escapeHTML(postUser.name.charAt(0))}</div>
                <div>
                    <b>${escapeHTML(postUser.name)}</b>
                    <small>@${escapeHTML(postUser.username)} · ${escapeHTML(post.createdAt)}</small>
                </div>
            </div>

            <div class="post-text">${escapeHTML(post.text)}</div>

            <div class="post-actions">
                <button class="action-btn like-btn ${isLiked ? "liked" : ""}"
                    onclick="toggleLike(${post.id})">
                    ${isLiked ? "❤️" : "🤍"} ${post.likes.length}
                </button>

                <button class="comment-btn" onclick="openComments(${post.id})">
                    💬 ${post.comments.length}
                </button>
            </div>`;

        feed.appendChild(postElement);
    });
}

function toggleLike(postId) {
    const post = posts.find(p => p.id == postId);
    if (!post) return;

    if (!post.likes) post.likes = [];

    const userId = Number(currentUser);
    const index = post.likes.indexOf(userId);

    if (index === -1) {
        post.likes.push(userId);
    } else {
        post.likes.splice(index, 1);
    }

    saveData();

    displayFeed();

    if (!document.getElementById("profilePage").classList.contains("hidden")) {
        displayProfile();
    }
}

function displayUsers() {
    const list = document.getElementById("usersList");
    list.innerHTML = "";

    const current = getCurrentUser();
    if (!current) return;

    const otherUsers = users.filter(user => user.id != current.id);

    if (otherUsers.length === 0) {
        list.innerHTML = `
            <div class="empty-post">
                <h3>No other users yet.</h3>
                <p>Create another account to start connecting.</p>
            </div>`;
        return;
    }

    otherUsers.forEach(user => {
        if (!user.followers) user.followers = [];
        if (!user.following) user.following = [];

        const isFollowing = current.following.includes(user.id);
        const div = document.createElement("div");
        div.className = "user-card";

        div.innerHTML = `
            <div class="avatar">${escapeHTML(user.name.charAt(0))}</div>

            <div class="user-info">
                <h3>${escapeHTML(user.name)}</h3>
                <p>@${escapeHTML(user.username)}</p>
            </div>

            <button class="${isFollowing ? "following" : ""}"
                onclick="toggleFollow(${user.id})">
                ${isFollowing ? "Following" : "Follow"}
            </button>`;

        list.appendChild(div);
    });
}

function toggleFollow(userId) {
    const current = getCurrentUser();
    const target = users.find(user => user.id == userId);

    if (!current || !target) return;

    if (!current.followers) current.followers = [];
    if (!current.following) current.following = [];
    if (!target.followers) target.followers = [];

    const index = current.following.indexOf(target.id);

    if (index === -1) {
        current.following.push(target.id);

        if (!target.followers.includes(current.id)) {
            target.followers.push(current.id);
        }
    } else {
        current.following.splice(index, 1);

        const followerIndex = target.followers.indexOf(current.id);

        if (followerIndex !== -1) {
            target.followers.splice(followerIndex, 1);
        }
    }

    saveData();
    displayUsers();
}

function displayProfile() {
    const user = getCurrentUser();
    if (!user) return;

    if (!user.followers) user.followers = [];
    if (!user.following) user.following = [];

    document.getElementById("profileName").innerText = user.name;
    document.getElementById("profileUsername").innerText = "@" + user.username;
    document.getElementById("profileAvatar").innerText = user.name.charAt(0);
    document.getElementById("followersCount").innerText = user.followers.length;
    document.getElementById("followingCount").innerText = user.following.length;

    const myPosts = posts.filter(post => post.userId == user.id);

    document.getElementById("postsCount").innerText = myPosts.length;

    const container = document.getElementById("myPosts");
    container.innerHTML = "";

    if (myPosts.length === 0) {
        container.innerHTML = `
            <div class="empty-post">
                <h3>You haven't posted anything yet.</h3>
                <p>Create your first post 🔥</p>
            </div>`;
        return;
    }

    myPosts.forEach(post => {
        if (!post.likes) post.likes = [];
        if (!post.comments) post.comments = [];

        const isLiked = post.likes.includes(Number(currentUser));
        const div = document.createElement("div");
        div.className = "post";

        div.innerHTML = `
            <div class="post-header">
                <div class="avatar">${escapeHTML(user.name.charAt(0))}</div>
                <div>
                    <b>${escapeHTML(user.name)}</b>
                    <small>@${escapeHTML(user.username)} · ${escapeHTML(post.createdAt)}</small>
                </div>
            </div>

            <div class="post-text">${escapeHTML(post.text)}</div>

            <div class="post-actions">
                <button class="action-btn like-btn ${isLiked ? "liked" : ""}"
                    onclick="toggleLike(${post.id})">
                    ${isLiked ? "❤️" : "🤍"} ${post.likes.length}
                </button>

                <button class="comment-btn" onclick="openComments(${post.id})">
                    💬 ${post.comments.length}
                </button>
            </div>`;

        container.appendChild(div);
    });
}

function openComments(postId) {
    selectedPostId = postId;
    document.getElementById("commentModal").classList.remove("hidden");
    displayComments();
}

function closeComments() {
    document.getElementById("commentModal").classList.add("hidden");
    document.getElementById("commentText").value = "";
    selectedPostId = null;
}

function displayComments() {
    const post = posts.find(p => p.id == selectedPostId);
    const list = document.getElementById("commentsList");

    list.innerHTML = "";
    if (!post) return;

    if (!post.comments || post.comments.length === 0) {
        list.innerHTML = "<p>No comments yet. Be the first! ❤️</p>";
        return;
    }

    post.comments.forEach(comment => {
        const user = users.find(u => u.id == comment.userId);
        if (!user) return;

        const div = document.createElement("div");
        div.className = "comment";

        div.innerHTML = `
            <strong>${escapeHTML(user.name)}</strong>
            <span>@${escapeHTML(user.username)}</span>
            <p>${escapeHTML(comment.text)}</p>`;

        list.appendChild(div);
    });
}

function addComment() {
    const text = document.getElementById("commentText").value.trim();

    if (!text) {
        alert("Write a comment!");
        return;
    }

    const post = posts.find(p => p.id == selectedPostId);
    if (!post) return;

    if (!post.comments) post.comments = [];

    post.comments.push({
        userId: Number(currentUser),
        text: text,
        createdAt: new Date().toLocaleString()
    });

    saveData();

    document.getElementById("commentText").value = "";

    displayComments();
    displayFeed();

    if (!document.getElementById("profilePage").classList.contains("hidden")) {
        displayProfile();
    }
}

document.addEventListener("keydown", function(event) {
    if (event.target.id === "commentText" && event.key === "Enter") {
        addComment();
    }
});

document.getElementById("commentModal").addEventListener("click", function(event) {
    if (event.target === this) {
        closeComments();
    }
});

if (currentUser) {
    const existingUser = users.find(user => user.id == currentUser);

    if (existingUser) {
        showApp();
    } else {
        localStorage.removeItem("currentUser");
        currentUser = null;
        showLogin();
    }
} else {
    showLogin();
}
