import { basename, dirname, resolve } from 'node:path'
import { Buffer } from 'node:buffer'
import { defineConfig } from 'vite'
import fs from 'fs-extra'
import Inspect from 'vite-plugin-inspect'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import Vue from '@vitejs/plugin-vue'
import matter from 'gray-matter'
import AutoImport from 'unplugin-auto-import/vite'
import anchor from 'markdown-it-anchor'
import LinkAttributes from 'markdown-it-link-attributes'
import GitHubAlerts from 'markdown-it-github-alerts'
import UnoCSS from 'unocss/vite'
import SVG from 'vite-svg-loader'
import MarkdownItShiki from '@shikijs/markdown-it'
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash'
import MarkdownItMagicLink from 'markdown-it-magic-link'
import VueRouter from 'unplugin-vue-router/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import TodoLists from 'markdown-it-todo-lists'

// @ts-expect-error missing types
import TOC from 'markdown-it-table-of-contents'
import sharp from 'sharp'
import { slugify } from './scripts/slugify'
import { containerPlugin } from './src/plugins/containers'
import { preWrapperPlugin } from './src/plugins/preWrapper'
import { MarkdownTransform } from './src/plugins/markdownTransform'

const promises: Promise<any>[] = []

export default defineConfig({
  resolve: {
    alias: [
      { find: '~/', replacement: `${resolve(__dirname, 'src')}/` },
    ],
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
      'dayjs',
      'dayjs/plugin/localizedFormat',
    ],
  },
  plugins: [
    UnoCSS(),

    VueRouter({
      extensions: ['.vue', '.md'],
      routesFolder: 'pages',
      logs: true,
      extendRoute(route) {
        const path = route.components.get('default')
        if (!path)
          return

        if (!path.includes('projects.md') && path.endsWith('.md')) {
          const { data } = matter(fs.readFileSync(path, 'utf-8'))
          route.addToMeta({
            frontmatter: data,
          })
        }
      },
    }),

    Vue({
      include: [/\.vue$/, /\.md$/],
      script: {
        defineModel: true,
      },
    }),

    MarkdownTransform(),

    Markdown({
      wrapperComponent: 'WrapperPost',
      wrapperClasses: (id, code) => code.includes('@layout-full-width')
        ? ''
        : code.includes('@layout-links')
          ? 'links prose m-auto slide-enter-content'
          : 'prose m-auto slide-enter-content',
      headEnabled: true,
      exportFrontmatter: false,
      exposeFrontmatter: false,
      exposeExcerpt: false,
      markdownItOptions: {
        quotes: '""\'\'',
      },
      async markdownItSetup(md) {
        md.use(await MarkdownItShiki({
          themes: {
            dark: 'vitesse-dark',
            light: 'vitesse-light',
          },
          defaultColor: false,
          cssVariablePrefix: '--s-',
          transformers: [
            transformerTwoslash({
              explicitTrigger: true,
              renderer: rendererRich(),
            }),
          ],
        }))

        md.use(anchor, {
          slugify,
          permalink: anchor.permalink.linkInsideHeader({
            symbol: '#',
            renderAttrs: () => ({ 'aria-hidden': 'true' }),
          }),
        })

        md.use(LinkAttributes, {
          matcher: (link: string) => /^https?:\/\//.test(link),
          attrs: {
            target: '_blank',
            rel: 'noopener',
          },
        })

        md.use(TOC, {
          includeLevel: [1, 2, 3, 4],
          slugify,
          containerHeaderHtml: '<div class="table-of-contents-anchor"><div class="i-ri-menu-2-fill" /></div>',
        })

        md.use(MarkdownItMagicLink, {
          linksMap: {
            Vitest: 'https://github.com/vitest-dev/vitest',
            VueUse: 'https://github.com/vueuse/vueuse',
            UnoCSS: 'https://github.com/unocss/unocss',
            Vue: 'https://github.com/vuejs/core',
            Nuxt: 'https://github.com/nuxt/nuxt',
            Vite: 'https://github.com/vitejs/vite',
            Unplugin: 'https://github.com/unplugin',
            ESLint: 'https://github.com/eslint/eslint',
            Netlify: { link: 'https://netlify.com', imageUrl: 'https://github.com/netlify.png' },
            Vercel: { link: 'https://vercel.com', imageUrl: 'https://github.com/vercel.png' },
            JavaScript: 'https://www.javascript.com/',
            Html: 'https://www.w3.org/html/',
            Css: 'https://www.w3.org/Style/CSS/Overview.en.html',
            TypeScript: 'https://github.com/microsoft/TypeScript',
            NodeJS: 'https://github.com/nodejs/node',
            Java: 'https://www.java.com/zh-CN/',
            Go: 'https://github.com/golang/go',
            React: 'https://github.com/facebook/react',
            Electron: 'https://github.com/electron/electron',
            D3: 'https://github.com/d3/d3',
            Next: 'https://github.com/vercel/next.js',
            UniApp: 'https://uniapp.dcloud.net.cn',
          },
          imageOverrides: [
            ['https://www.javascript.com/', 'https://cdn-icons-png.flaticon.com/64/5968/5968292.png'],
            ['https://github.com/microsoft/TypeScript', 'https://www.typescriptlang.org/favicon-32x32.png?v=8944a05a8b601855de116c8a56d3b3ae'],
            ['https://github.com/vuejs/core', 'https://vuejs.org/logo.svg'],
            ['https://github.com/nuxt/nuxt', 'https://nuxt.com/assets/design-kit/icon-green.svg'],
            ['https://github.com/vitejs/vite', 'https://vitejs.dev/logo.svg'],
            ['https://github.com/facebook/react', 'https://react.dev/favicon-32x32.png'],
            ['https://www.w3.org/html/', 'https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/icon/material-icon-theme--html.svg'],
            ['https://www.w3.org/Style/CSS/Overview.en.html', 'https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/icon/vscode-icons--file-type-css%20%281%29.svg'],
            ['https://uniapp.dcloud.net.cn', 'https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/icon.png?v=1556263038788'],
          ],
        })

        md.use(GitHubAlerts)

        md.use(TodoLists)

        md.use(preWrapperPlugin)

        md.use(containerPlugin)
      },
      frontmatterPreprocess(frontmatter, options, id, defaults) {
        (() => {
          if (!id.endsWith('.md'))
            return
          const route = basename(id, '.md')
          if (route === 'index' || frontmatter.image || !frontmatter.title)
            return
          const path = `og/${route}.png`
          promises.push(
            fs.existsSync(`${id.slice(0, -3)}.png`)
              ? fs.copy(`${id.slice(0, -3)}.png`, `public/${path}`)
              : generateOg(frontmatter.title!.replace(/\s-\s.*$/, '').trim(), `public/${path}`),
          )
          frontmatter.image = `https://hujiacheng.netlify.app/${path}`
        })()
        const head = defaults(frontmatter, options)
        return { head, frontmatter }
      },
    }),

    AutoImport({
      imports: [
        'vue',
        VueRouterAutoImports,
        '@vueuse/core',
      ],
    }),

    Components({
      extensions: ['vue', 'md'],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        IconsResolver({
          componentPrefix: '',
        }),
      ],
    }),

    Inspect(),

    Icons({
      defaultClass: 'inline',
      defaultStyle: 'vertical-align: sub;',
    }),

    SVG({
      svgo: false,
      defaultImport: 'url',
    }),

    {
      name: 'await',
      async closeBundle() {
        await Promise.all(promises)
      },
    },
  ],

  build: {
    rollupOptions: {
      onwarn(warning, next) {
        if (warning.code !== 'UNUSED_EXTERNAL_IMPORT')
          next(warning)
      },
    },
  },

  ssgOptions: {
    formatting: 'minify',
  },
})

const ogSVg = fs.readFileSync('./scripts/og-template.svg', 'utf-8')

async function generateOg(title: string, output: string) {
  if (fs.existsSync(output))
    return

  await fs.mkdir(dirname(output), { recursive: true })
  // breakline every 30 chars
  const lines = title.trim().split(/(.{0,30})(?:\s|$)/g).filter(Boolean)

  const data: Record<string, string> = {
    line1: lines[0],
    line2: lines[1],
    line3: lines[2],
  }
  const svg = ogSVg.replace(/\{\{([^}]+)\}\}/g, (_, name) => data[name] || '')

  // eslint-disable-next-line no-console
  console.log(`Generating ${output}`)
  try {
    await sharp(Buffer.from(svg))
      .resize(1200 * 1.1, 630 * 1.1)
      .png()
      .toFile(output)
  }
  catch (e) {
    console.error('Failed to generate og image', e)
  }
}
