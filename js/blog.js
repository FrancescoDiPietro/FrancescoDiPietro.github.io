async function loadPosts() {
    const postList = document.getElementById('post-list');
    if (!postList) return;

    try {
        const response = await fetch('posts/md/posts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const posts = await response.json();

        for (const post of posts) {
            const postElement = document.createElement('article');
            postElement.classList.add('blog-post');
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <div class="date">${post.date}</div>
                <p>${post.description}</p>
                <a href="posts/post.html?post=${post.file}" class="read-more">Read More</a>
            `;
            postList.appendChild(postElement);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        postList.innerHTML = '<p style="color: var(--light-green);">Failed to load blog posts. Please check the console for more details.</p>';
    }
}

async function loadPost() {
    const postContent = document.getElementById('post-content');
    if (!postContent) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postFile = urlParams.get('post');

    if (postFile) {
        try {
            const response = await fetch(`../posts/md/${postFile}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdown = await response.text();
            const converter = new showdown.Converter({metadata: true});
            const html = converter.makeHtml(markdown);
            const metadata = converter.getMetadata();

            document.title = `${metadata.title} - Francesco's Blog`;
            postContent.innerHTML = `
                <h1>${metadata.title}</h1>
                <div class="date">${metadata.date}</div>
                ${html}
                <a href="../index.html" class="back-link">← Back to Home</a>
            `;
        } catch (error) {
            console.error('Error loading post:', error);
            postContent.innerHTML = '<p style="color: var(--light-green);">Failed to load post. Please check the console for more details.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    loadPost();
});
