module.exports = {
    apps: [{
        script: './main.js',
        name: 'kiri',
        cwd: './',
        exp_backoff_restart_delay: 500
    }],
};