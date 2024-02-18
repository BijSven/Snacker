if (typeof window !== 'undefined') {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const switchMode = () => {
        if (darkModeMediaQuery.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };
    switchMode();
    darkModeMediaQuery.addEventListener('change', switchMode);
}