document.addEventListener('DOMContentLoaded', function() {
    const isIndex = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html');
    const isProject = window.location.pathname.includes('/projects/');
    const isPost = window.location.pathname.includes('/posts/');

    const homeLink = isIndex ? '' : `<a href="${isProject || isPost ? '../' : ''}index.html" class="home-link">← Home</a>`;
    const qrLink = isProject ? 'qr-generator.html' : (isPost ? '../projects/qr-generator.html' : 'projects/qr-generator.html');

    const headerHTML = `
        <header>
            <div class="header-content">
                <h1>Francesco's Retro Blog</h1>
                <p>Welcome to my digital garden</p>
            </div>
        </header>
    `;

    const footerHTML = `
        <footer>
            <p>© 2024 Francesco Di Pietro. All rights reserved.</p>
        </footer>
    `;

    const leftSidebarHTML = `
        <div class="left-sidebar"></div>
    `;

    const rightSidebarHTML = `
        <aside class="right-sidebar">
            ${homeLink}
            <h2>Projects</h2>
            <ul class="projects-list">
                <li><a href="${qrLink}">QR Code Generator</a></li>
                <li><a href="#">Weather App</a></li>
                <li><a href="#">Todo List</a></li>
                <li><a href="#">Calculator</a></li>
            </ul>
        </aside>
    `;

    const body = document.body;
    const mainContainer = document.querySelector('.main-container');

    body.insertAdjacentHTML('afterbegin', headerHTML);

    if (mainContainer) {
        mainContainer.insertAdjacentHTML('beforebegin', leftSidebarHTML);
        mainContainer.insertAdjacentHTML('afterend', rightSidebarHTML);
        mainContainer.insertAdjacentHTML('beforeend', footerHTML);
    } else {
        body.insertAdjacentHTML('beforeend', footerHTML);
    }
});