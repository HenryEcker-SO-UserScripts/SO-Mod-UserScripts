import buildViteConfig from '../vite-config-builder';

const banner = '// Not Really a userscript just a scratch place to compile functions to test';

export default () => {
    return buildViteConfig('Scratch', banner);
};