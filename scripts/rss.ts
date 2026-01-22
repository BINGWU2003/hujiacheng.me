import { dirname } from 'node:path'
import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import type { FeedOptions, Item } from 'feed'
import { Feed } from 'feed'

const DOMAIN = 'https://hujiacheng.netlify.app'
const AUTHOR = {
  name: 'hujiacheng',
  email: 'hujiacheng2003@163.com',
  link: DOMAIN,
}
const markdown = MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

async function run() {
  await buildBlogRSS()
}

async function buildBlogRSS() {
  const files = await fg('pages/posts/**/*.md')

  const options = {
    title: 'hujiacheng',
    description: 'hujiacheng\' Blog',
    id: 'https://hujiacheng.netlify.app',
    link: 'https://hujiacheng.netlify.app',
    copyright: 'CC BY-NC-SA 4.0 2024 © hujiacheng',
    feedLinks: {
      json: 'https://hujiacheng.netlify.app/feed.json',
      atom: 'https://hujiacheng.netlify.app/feed.atom',
      rss: 'https://hujiacheng.netlify.app/feed.xml',
    },
  }
  const posts: any[] = (
    await Promise.all(
      files.filter(i => !i.includes('index'))
        .map(async (i) => {
          try {
            const raw = await fs.readFile(i, 'utf-8')
            const { data, content } = matter(raw)

            // 检查必需字段
            if (!data.title || !data.date) {
              console.warn(`Skipping ${i}: missing title or date`)
              return null
            }

            const html = markdown.render(content)
              .replace('src="/', `src="${DOMAIN}/`)

            if (data.image?.startsWith('/'))
              data.image = DOMAIN + data.image

            // 安全处理日期
            const date = data.date ? new Date(data.date) : new Date()
            if (Number.isNaN(date.getTime())) {
              console.warn(`Invalid date in ${i}, using current date`)
            }

            return {
              ...data,
              date: Number.isNaN(date.getTime()) ? new Date() : date,
              content: html,
              author: [AUTHOR],
              link: DOMAIN + i.replace(/^pages(.+)\.md$/, '$1'),
            }
          }
          catch (error) {
            console.error(`Error processing file ${i}:`, error)
            return null
          }
        }),
    ))
    .filter(Boolean)
    .filter((post: any) => post && post.title && post.date) // 确保必需字段存在

  posts.sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date)
    const dateB = b.date instanceof Date ? b.date : new Date(b.date)
    return dateB.getTime() - dateA.getTime()
  })

  await writeFeed('feed', options, posts)
}

async function writeFeed(name: string, options: FeedOptions, items: Item[]) {
  options.author = AUTHOR
  options.image = 'https://hujiacheng.netlify.app/avatar.png'
  options.favicon = 'https://hujiacheng.netlify.app/logo.png'

  const feed = new Feed(options)

  items.forEach(item => feed.addItem(item))
  // items.forEach(i=> console.log(i.title, i.date))

  await fs.ensureDir(dirname(`./dist/${name}`))
  await fs.writeFile(`./dist/${name}.xml`, feed.rss2(), 'utf-8')
  await fs.writeFile(`./dist/${name}.atom`, feed.atom1(), 'utf-8')
  await fs.writeFile(`./dist/${name}.json`, feed.json1(), 'utf-8')
}

run().catch((error) => {
  console.error('RSS generation failed:', error)
  process.exit(1)
})
