import banner from 'vite-plugin-banner';

export default (fileNameBase, bannerText) => {
    return {
        plugins: [
            banner(bannerText)
        ],
        build: {
            rollupOptions: {
                input: {
                    main: `${fileNameBase}.user.ts`
                },
                output: {
                    format: 'iife',
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
};