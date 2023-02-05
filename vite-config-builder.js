import banner from 'vite-plugin-banner';

export default (fileNameBase, bannerText, plugins) => {
    const obj = {
        plugins: [
            banner(bannerText)
        ],
        build: {
            rollupOptions: {
                input: {
                    main: `${fileNameBase}.user.ts`
                },
                output: {
                    banner: '(function() {"use strict";',
                    footer: '})();',
                    manualChunks: undefined,
                    entryFileNames: `${fileNameBase}.user.js`
                }
            },
            minify: false,
            outDir: './dist',
            assetsDir: '',
            sourcemap: false,
            target: ['ESNext'],
            reportCompressedSize: false
        }
    };
    if (plugins !== undefined) {
        obj.plugins = [...plugins, ...obj.plugins];
    }
    return obj;
};