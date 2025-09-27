---
title: 使用vercel自动化部署express项目
date: 2024-09-28
duration: 18min
art: random
---

[[toc]]

## 项目简介

[GitHub地址](https://github.com/BINGWU2003/my-express-app)

[vercel官网](https://vercel.com/)

在vercel部署成功后,每次更新代码,vercel都会自动部署.

## 初始化项目

初始化配置文件

```bash
pnpm init
```

安装express

```bash
pnpm i express
```

安装cors,解决跨域

```bash
pnpm install cors
```

安装mysql2,用于连接数据库

```bash
pnpm install mysql2
```

安装dotenv,用于配置环境文件

```bash
pnpm install dotenv
```

安装sequelize

```bash
pnpm install sequelize
```

在根目录新增.gitignore文件

```
# Node modules
node_modules/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env

# Build output
dist/
build/

# Debug logs
*.local

# OS generated files
.DS_Store
Thumbs.db
.vercel

```

## 连接MySQL

**!!!需提前建好数据库**

创建一个名称为my-express-app的数据库

![image-20240726164228532](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726164228532.png?imageSlim)

- 在根目录新建`.env`文件

  添加数据库配置文件

  ```
  DB_HOST=xxx # 请替换为你的数据库连接地址
  DB_USER=xxx # 请替换为你的数据库用户名
  DB_PASSWORD=xxx # 请替换为你的数据库密码
  DB_NAME=xxx # 请替换为你的数据库名称
  DB_PORT=xxx # 请替换为你的数据库端口
  ```

- 在根目录新建`index.js`文件

  填入以下内容

  ```js
  const express = require('express');
  const cors = require('cors'); // 引入cors包
  const mysql = require('mysql2'); // 引入mysql2包
  const dotenv = require('dotenv'); // 引入dotenv包
  
  dotenv.config(); // 加载.env文件中的配置
  
  const app = express();
  const port = 3000;
  
  app.use(cors()); // 使用cors中间件
  app.use(express.json());
  
  // 配置MySQL连接
  const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT // 使用端口号配置
  });
  
  // 连接到MySQL
  db.connect(err => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Connected to MySQL');
  });
  
  
  // hello world
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  
  
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
  ```

- 运行项目

  ```bash
  node index.js
  ```

  控制台出现**Connected to MySQL**代表连接数据库成功

  ![image-20240726164736979](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726164736979.png?imageSlim)

  访问`http://localhost:3000/`出现以下内容代表服务器运行成功

  ![image-20240726164828622](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726164828622.png?imageSlim)

## 对数据库进行crud操作

### 配置数据库

- 配置Sequelize

在项目根目录下创建`config/database.js`文件：

```js
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: process.env.DB_PORT,
});

module.exports = sequelize;
```

- 定义模型

 在项目根目录下创建`models/Item.js`文件：

```js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'items',
  timestamps: false,
});

module.exports = Item;
```

- 替换`index.js`文件中的内容

```js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const Item = require('./models/Item');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// 同步数据库
sequelize.sync()
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// hello world
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// CRUD 路由
app.get('/items', async (req, res) => {
  try {
    const items = await Item.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).send('Item not found');
    }
    res.json(item);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/items', async (req, res) => {
  try {
    const newItem = await Item.create(req.body);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.put('/items/:id', async (req, res) => {
  try {
    const [updated] = await Item.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).send('Item not found');
    }
    const updatedItem = await Item.findByPk(req.params.id);
    res.json(updatedItem);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.delete('/items/:id', async (req, res) => {
  try {
    const deleted = await Item.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).send('Item not found');
    }
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

- 运行项目

```bash
node index.js
```

控制台出现这个代表连接数据库成功,并且创建了一个item表

![image-20240726170536794](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726170536794.png?imageSlim)

item表

![image-20240726170641717](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726170641717.png?imageSlim)

### 新增一条item

url:`http://localhost:3000/items`

请求方式:post

数据:

```json
{
	"name": "蛋糕",
	"description": "好吃",
	"price": 19.99
}
```

新增一条数据

![image-20240726171448679](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726171448679.png?imageSlim)

查看数据库,新增了一条数据

![image-20240726171548720](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726171548720.png?imageSlim)

### 获取所有的item

url:`http://localhost:3000/items`

请求方式:get

返回了数据库的所有内容

![image-20240726171838310](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726171838310.png?imageSlim)

![image-20240726171915580](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726171915580.png?imageSlim)

### 删除一条item

url:`http://localhost:3000/items/1`

url里的1为id

请求方式:delete

删除数据库里id为1的item

![image-20240726172050550](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726172050550.png?imageSlim)

### 获取一条item

url:`http://localhost:3000/items/2`

url里的2为id

请求方式:get

返回了id为2的item

![image-20240726172359920](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726172359920.png?imageSlim)

### 更新一条item

url:`http://localhost:3000/items/2`

url里的2为id

请求方式:put

数据内容:

```json
{
  "name": "蛋糕1",
  "description": "好吃1",
  "price": 999.999
}
```

更新id为2的item的数据

![image-20240726172804408](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726172804408.png?imageSlim)

数据库里的item发生改变

![image-20240726172834919](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726172834919.png?imageSlim)

## 部署项目

- 在根目录新建`vercel.json`文件

  填入以下内容

  ```json
  {
    "version": 2,
    "builds": [
      {
        "src": "index.js",
        "use": "@vercel/node"
      }
    ],
    "routes": [
      {
        "src": "/(.*)",
        "dest": "/index.js"
      }
    ]
  }
  ```

- 把项目推送到自己的github

  ![image-20240726173528588](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726173528588.png?imageSlim)

- 修改`database.js`文件

  ````js
  const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
    // 新增这行代码
    dialectModule: require('mysql2')
  });
  ````

- 选择上传到GitHub的项目

  ![image-20240726182908709](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726182908709.png?imageSlim)

- 复制`.env`文件里的内容到这

  ![image-20240726183056180](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726183056180.png?imageSlim)

开始部署项目,出现这个代表部署成功

![image-20240726183159797](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726183159797.png?imageSlim)

访问域名https://my-express-app-teal.vercel.app/

![image-20240726183246061](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726183246061.png?imageSlim)

出现hello world

![image-20240726183336976](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726183336976.png?imageSlim)

访问:https://my-express-app-teal.vercel.app/items

返回数据库里的item

![image-20240726183413193](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726183413193.png?imageSlim)

ok,这就部署成功了

## 测试部署成功后的接口

由于国内会墙掉vercel的域名.因此采用翻墙,在html文件里测试

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>测试部署成功后的接口</title>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>

<body>
  <div>
    <h1>测试部署成功后的接口</h1>
    <button onclick="handleAdd()">新增</button>
    <button onclick="handleUpdate()">修改</button>
    <button onclick="handleDelete()">删除</button>
    <button onclick="handleQuery()">查询</button>
    <button onclick="handleGetAll()">获取所有</button>
  </div>
  <script>
    const baseUrl = 'https://my-express-app-teal.vercel.app/items'
    function handleAdd() {
      axios({
        method: 'post',
        url: `${baseUrl}`,
        data: {
          // 添加数据
          name: "蛋糕",
          description: "好吃",
          price: 88888
        }
      }).then(response => {
        console.log('新增成功', response)
      }).catch(error => {
        console.error('新增失败', error)
      })
    }

    function handleUpdate() {
      axios({
        method: 'put',
        url: `${baseUrl}/2`,
        data: {
          name: "蛋糕",
          description: "好吃",
          price: 99999
        }
      }).then(response => {
        console.log('修改成功', response)
      }).catch(error => {
        console.error('修改失败', error)
      })
    }

    function handleDelete() {
      axios({
        method: 'delete',
        url: `${baseUrl}/23`,
        data: {
          // 删除数据
        }
      }).then(response => {
        console.log('删除成功', response)
      }).catch(error => {
        console.error('删除失败', error)
      })
    }

    function handleQuery() {
      axios({
        method: 'get',
        url: `${baseUrl}/21`
      }).then(response => {
        console.log('查询成功', response)
      }).catch(error => {
        console.error('查询失败', error)
      })
    }

    function handleGetAll() {
      axios({
        method: 'get',
        url: `${baseUrl}`
      }).then(response => {
        console.log('查询成功', response)
      }).catch(error => {
        console.error('查询失败', error)
      })
    }
  </script>
</body>

</html>
```

- 新增

  ![image-20240726185018919](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726185018919.png?imageSlim)

  - 修改

![image-20240726185045939](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726185045939.png?imageSlim)

- 删除

  ![image-20240726185120284](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726185120284.png?imageSlim)

- 查询

  ![image-20240726185236940](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726185236940.png?imageSlim)

- 获取所有

  ![image-20240726185401550](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20240726185401550.png?imageSlim)
