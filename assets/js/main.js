function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const htmlElement = document.documentElement;
    
    if (savedTheme === 'dark') {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    initTheme();
    
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const htmlElement = document.documentElement;
        
        if (htmlElement.classList.contains('dark')) {
            htmlElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            htmlElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    });
}

function initProjectFiltering() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    const projectCards = document.querySelectorAll('.project-card');
    
    if (filterButtons.length === 0) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-gray-200', 'dark:bg-green-400', 'dark:bg-opacity-20', 'text-gray-800', 'dark:text-green-400', 'border-gray-800', 'dark:border-green-400');
                btn.classList.add('text-gray-600', 'dark:text-gray-400', 'border-gray-600', 'dark:border-gray-400', 'hover:text-gray-800', 'dark:hover:text-green-400', 'hover:border-gray-800', 'dark:hover:border-green-400');
            });
            button.classList.remove('text-gray-600', 'dark:text-gray-400', 'border-gray-600', 'dark:border-gray-400', 'hover:text-gray-800', 'dark:hover:text-green-400', 'hover:border-gray-800', 'dark:hover:border-green-400');
            button.classList.add('bg-gray-200', 'dark:bg-green-400', 'dark:bg-opacity-20', 'text-gray-800', 'dark:text-green-400', 'border-gray-800', 'dark:border-green-400');
            
            projectCards.forEach(card => {
                const categories = card.dataset.category.split(' ');
                if (filter === 'all' || categories.includes(filter)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

function init404TypingAnimation() {
    const typedCommand = document.getElementById('typed-command');
    const commandEcho = document.getElementById('command-echo');
    
    if (!typedCommand || !commandEcho) return;
    
    const commands = [
        window.location.pathname.substring(1) || 'undefined',
        'cat /dev/null',
        'rm -rf /hope',
        'find . -name "page"',
        'grep -r "content" .',
        ':(){ :|:& };:'
    ];
    
    const randomCommand = commands[Math.floor(Math.random() * commands.length)];
    
    let i = 0;
    function typeCommand() {
        if (i < randomCommand.length) {
            typedCommand.textContent += randomCommand.charAt(i);
            commandEcho.textContent = randomCommand;
            i++;
            setTimeout(typeCommand, 100);
        }
    }
    
    setTimeout(typeCommand, 500);
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initThemeToggle();
    initProjectFiltering();
    init404TypingAnimation();
});
