import banner from 'vite-plugin-banner';

function indentString(str, count) {
    return str.replace(/^/gm, ' '.repeat(count));
}

export default (fileNameBase, bannerText) => {
    // noinspection JSUnusedGlobalSymbols
    const modOnlyReadyWrapPlugin = {
        name: 'wrap-in-StackExchange-ready',
        generateBundle(outputOptions, bundle) {
            Object.keys(bundle).forEach((fileName) => {
                const file = bundle[fileName];
                if (fileName === 'ModMessageHelper.user.js' && 'code' in file) {
                    file.code = `(function() {
  "use strict";              
  StackExchange.ready(function () {
    if (!StackExchange?.options?.user?.isModerator) {
        return;
    }
${indentString(file.code, 4)}
  });
})();`;
                }
            });
        }
    };
    return {
        plugins: [
            banner(bannerText),
            modOnlyReadyWrapPlugin
        ],
        build: {
            rollupOptions: {
                input: {
                    main: `${fileNameBase}.user.ts`
                },
                output: {
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