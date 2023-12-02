import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
// import million from 'million/compiler';
import { env } from 'process';

const isProd = env.NODE_ENV === 'production';

export default {
    context: 'window',
    input: 'src/main.ts',
    output: {
        file: isProd ? 'dist/main.js' : 'main.js',
        format: 'cjs',
        exports: 'default',
        sourcemap: !isProd,
    },
    external: ['obsidian', 'fs', 'os', 'path'],
    plugins: [
        typescript(),
        resolve({
            browser: true,
        }),
        replace({
            preventAssignment: false,
            'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
        }),
        babel({
            babelHelpers: 'bundled',
            presets: ['@babel/preset-react', '@babel/preset-typescript'],
            compact: true,
        }),
        commonjs(),
        // million.rollup({ auto: true }),
    ],
};
