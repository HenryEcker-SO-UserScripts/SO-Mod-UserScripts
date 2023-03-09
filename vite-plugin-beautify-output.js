import {js} from 'js-beautify';


export default function beautifyPlugin(opts = {}) {
    async function beautify(code) {
        const config = {...js.defaultOptions(), ...opts};
        return js(code, config);
    }

    return {
        name: 'vite-plugin-javascript-beautifier',
        enforce: 'post',
        renderChunk: {
            order: 'post',
            handler(code) {
                return beautify(code);
            }
        }
    };
}