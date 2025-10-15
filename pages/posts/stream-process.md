---

title: 流式数据处理

date: 2025-10-15

duration: 15min

art: random

---

[[toc]]

## 流式处理数据

### 返回的数据格式

```

data:{"id":null,"object":null,"created":null,"model":"云智AI助手","choices":[{"index":null,"message":null,"delta":{"role":"assistant","content":"智能","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"finish_reason":null}],"usage":null,"result":null}

data:{"id":null,"object":null,"created":null,"model":"云智AI助手","choices":[{"index":null,"message":null,"delta":{"role":"assistant","content":"很高兴","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"finish_reason":null}],"usage":null,"result":null}

data:{"id":null,"object":null,"created":null,"model":"云智AI助手","choices":[{"index":null,"message":null,"delta":{"role":"assistant","content":"为您","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"finish_reason":null}],"usage":null,"result":null}

data:{"id":null,"object":null,"created":null,"model":"云智AI助手","choices":[{"index":null,"message":null,"delta":{"role":"assistant","content":"服务","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"finish_reason":null}],"usage":null,"result":null}

data:{"id":null,"object":null,"created":null,"model":"云智AI助手","choices":[{"index":null,"message":null,"delta":{"role":"assistant","content":"。\n\n","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"finish_reason":null}],"usage":null,"result":null}

data:{"id":null,"object":null,"created":null,"model":"云智AI助手","choices":[{"index":null,"message":null,"delta":{"role":"assistant","content":"请问","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"finish_reason":null}],"usage":null,"result":null}

data:{"id":null,"object":null,"created":null,"model":"云智AI助手","choices":[{"index":null,"message":null,"delta":{"role":"assistant","content":"您","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"finish_reason":null}],"usage":null,"result":null}

data:{"id":null,"object":null,"created":null,"model":"云智AI助手","choices":[{"index":null,"message":null,"delta":{"role":"assistant","content":"需要","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"finish_reason":null}],"usage":null,"result":null}

data:{"id":null,"object":null,"created":null,"model":"云智AI助手","choices":[{"index":null,"message":null,"delta":{"role":"assistant","content":"什么","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"finish_reason":null}],"usage":null,"result":null}

data:{"id":null,"object":null,"created":null,"model":"云智AI助手","choices":[{"index":null,"message":null,"delta":{"role":"assistant","content":"帮助","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"finish_reason":null}],"usage":null,"result":null}

data:{"id":null,"object":null,"created":null,"model":"云智AI助手","choices":[{"index":null,"message":null,"delta":{"role":"assistant","content":"？","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"finish_reason":null}],"usage":null,"result":null}

data:{"id":null,"object":null,"created":null,"model":"云智AI助手","choices":[{"index":null,"message":null,"delta":{"role":"assistant","content":"您可以","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"finish_reason":null}],"usage":null,"result":null}

data:{"id":null,"object":null,"created":null,"model":"云智AI助手","choices":[{"index":null,"message":null,"delta":{"role":"assistant","content":"告诉我","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"finish_reason":null}],"usage":null,"result":null}

data:{"id":null,"object":null,"created":null,"model":"云智AI助手","choices":[{"index":null,"message":null,"delta":{"role":"assistant","content":"：\n","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"finish_reason":null}],"usage":null,"result":null}

data:{"id":null,"object":null,"created":null,"model":"deepseek-chat","choices":[{"index":null,"message":{"role":"assistant","content":"您好！我是国网电瓷售后智能助手，很高兴为您服务。\n\n请问您需要什么帮助？您可以告诉我：\n- 具体的产品故障情况\n- 客户投诉详情\n- 需要处理的售后问题\n- 或者其他任何需要协助的事项\n\n我会根据您提供的信息，为您生成相应的解决方案和客户安抚话术。","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"delta":null,"finish_reason":null}],"usage":{"promptTokens":2223,"completionTokens":131,"totalTokens":2354},"result":null,"chatQuestions":[]}


```

::: tip

要注意的是每一条数据之间都是有`\n\n`分隔的，标准SSE事件，每条事件就是用'\n\n'分隔的。

:::

### 处理方法

使用`fetch`或者`axios`处理（推荐使用`fetch`）

如果使用`axios`，还得自定义适配器`adapter`让它支持流式

::: tip

不推荐，如果使用适配器，会完全替换掉axios的网络请求。当创建一个 axios 实例并为其指定 `adapter` 时，您就等于在告诉 axios：“对于这个实例发出的**所有**网络请求，不要再使用你内置的默认引擎（在浏览器中是 `XMLHttpRequest`）。请改用我提供给你的这个 `customFetchAdapter` 函数来执行实际的网络通信。”

:::

关键代码demo：

适配器：

```js
// a-custom-fetch-adapter.js

/**
 * 一个自定义的 Axios 适配器，它使用 fetch API。
 * 如果 config.responseType === 'stream'，它会直接返回 ReadableStream。
 * 否则，它会像正常一样处理响应。
 */
async function customFetchAdapter(config) {
  // 1. 将 Axios 配置转换为 fetch 的 init 对象
  const { url, method, data, headers, signal } = config;
  const fetchOptions = {
    method: method.toUpperCase(),
    headers: headers,
    body: data,
    signal: signal, // 用于取消请求
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    // 如果请求失败，构建一个类似 Axios 的错误对象
    throw new Error(`Request failed with status ${response.status}`);
  }

  // 2. 关键逻辑：检查是否需要流式响应
  if (config.responseType === 'stream') {
    // 如果是流式请求，直接将 ReadableStream 放在 data 属性中返回
    return {
      data: response.body, // data 就是 ReadableStream！
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      config: config,
      request: response,
    };
  }

  // 3. 对于非流式请求，正常解析数据
  const responseData = await response.json(); // 或者 .text(), .blob() 等

  return {
    data: responseData,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    config: config,
    request: response,
  };
}
```

使用适配器：

```js
// main.js
import axios from 'axios';
// import { customFetchAdapter } from './a-custom-fetch-adapter.js';

// ... (将上面的适配器代码粘贴在这里或从文件导入)

// 创建一个使用自定义适配器的 Axios 实例
const api = axios.create({
  adapter: customFetchAdapter,
});

// 现在，你可以像这样发起一个“流式”请求
async function consumeStreamWithAxios() {
  try {
    const response = await api.get('/api/streaming-endpoint', {
      responseType: 'stream', // 使用我们适配器中定义的特殊标志
    });

    // 重要：这里的 response.data 就是一个 ReadableStream 对象！
    // 你不能直接 console.log(response.data)，需要像使用 fetch 一样处理它。
    const reader = response.data.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('通过 Axios (的 fetch 适配器) 接收流结束');
        break;
      }
      const chunk = decoder.decode(value);
      console.log('收到数据块:', chunk);
    }

  } catch (error) {
    console.error('请求失败:', error);
  }
}

consumeStreamWithAxios();
```

### 代码实现

fetch：

```js
fetch(url + '/chat/stream', {
    method: 'POST',
    body: JSON.stringify(finalConfig)
  })
```

使用`fetch`请求，配置简单，但`body`参数需要序列化 。

数据处理：

```js
async function consumeStreamingResponse() {
  try {
    // fetch请求
    const response = await fetch('/api/streaming-text');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 获取响应体的读取器
    const reader = response.body.getReader();
    // 用于将 Uint8Array 解码为文本
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log('数据流结束');
        break;
      }

      // 将接收到的 Uint8Array 块解码为字符串
      const chunk = decoder.decode(value, { stream: true });
      console.log('接收到数据块:', chunk);
    }
  } catch (error) {
    console.error('获取流式数据时出错:', error);
  }
}

consumeStreamingResponse();
```

**工作原理:**

1. 使用 `fetch` 发起请求。
2. 通过 `response.body.getReader()` 获取一个读取器 (`ReadableStreamDefaultReader`)。
3. 循环调用 `reader.read()`，它会返回一个 Promise，解析为一个包含 `{ value, done }` 的对象。
   - `value`: 一个 `Uint8Array` 类型的数据块 (chunk)。
   - `done`: 一个布尔值，表示流是否已经结束。
4. 使用`TextDecoder`来创建`decoder`实例，调用实例上的`decode`方法来给数据解码，`decode`方法接收两个参数
   - `value`:要解码的值
   - `options`:配置项，`stream: true `表示以分块的形式处理数据
5. 在 `done` 为 `false` 时，持续处理接收到的 `value` 数据块。
6. 在 `done` 为 `true` 时，表示数据已全部接收完毕。

TextDecoder:https://developer.mozilla.org/zh-CN/docs/Web/API/TextDecoder

decode:https://developer.mozilla.org/zh-CN/docs/Web/API/TextDecoder/decode

### 扩展

当ai回答完一个问题，给出问题内容推荐，根据用户的提问联想出其他问题，用户体验更好（需要后端配合）

效果图如下：

![image-20251015145037961](https://bing-wu-doc-1318477772.cos.ap-nanjing.myqcloud.com/typora/image-20251015145037961.png)

需要后端那边给最后一条响应数据做上标记（参考了腾讯元宝的处理方式）：

```json
data:{"id":null,"object":null,"created":null,"model":"deepseek-chat","choices":[{"index":null,"message":{"role":"assistant","content":"这个问题需要具体的技术分析才能给出准确答复。让我帮您查询相关的技术标准和规范。由于技术资料库暂时无法访问，我无法为您提供具体的厚度偏差安全影响分析。\n\n一般来说，电瓷产品的厚度偏差是否影响使用安全，需要考虑以下几个因素：\n\n1. **偏差程度**：轻微偏差可能只影响外观，严重偏差可能影响绝缘性能\n2. **产品用途**：不同电压等级对厚度要求不同\n3. **结构完整性**：过度打磨可能影响产品机械强度\n\n建议您：\n- 联系技术部门进行专业评估\n- 参照产品设计图纸和技术标准\n- 必要时进行绝缘性能测试\n\n【厚度偏差的具体标准是多少？】\n【如果影响安全，应该怎么处理？】\n【需要做哪些检测来确认安全性？】","name":null,"refusal":null,"function_call":null,"reasoning_content":null},"delta":null,"finish_reason":null}],"usage":{"promptTokens":613,"completionTokens":330,"totalTokens":943},"result":null,"chatQuestions":["厚度偏差的具体标准是多少？","如果影响安全，应该怎么处理？","需要做哪些检测来确认安全性？"]}
```

使用标记`chatQuestions`为相关推荐问题

数据处理：

辅助函数`extractData`：

```js
/**
 * 从 SSE (Server-Sent Events) 消息行中剥离 'data:' 前缀。
 * 这个函数能健壮地处理 "data:" 和 "data: " (带空格) 两种情况。
 * @param {string} message - SSE 流中的单行文本。
 * @returns {string | null} - 如果是有效的数据行，则返回纯净的 JSON 字符串；否则返回 null。
 */
const extractData = (message) => {
  const DATA_PREFIX = 'data:';
  const DATA_PREFIX_WITH_SPACE = 'data: ';

  // 如果这行文本连 'data:' 开头都不是，直接判定为无效
  if (!message.startsWith(DATA_PREFIX)) {
    return null;
  }

  // 处理 "data:{" (无空格) 的情况
  if (message.startsWith(DATA_PREFIX) && !message.startsWith(DATA_PREFIX_WITH_SPACE)) {
    return message.substring(DATA_PREFIX.length);
  }

  // 处理 "data: {" (有空格) 的情况
  return message.startsWith(DATA_PREFIX_WITH_SPACE)
    ? message.substring(DATA_PREFIX_WITH_SPACE.length)
    : message; // 理论上这个回退分支不会被执行，但为了代码完整性保留
}
```

`consumeStreamingResponseAndProcess`：

```js
/**
 * 消费一个流式响应，实时处理每一条消息，
 * 并在流结束后，提取出最后一条消息中包含的推荐问题。
 */
async function consumeStreamingResponseAndProcess() {
  console.log("开始请求流式数据...");

  try {
    // 步骤 1: 发起 fetch 请求
    const response = await fetch('/api/your-sse-endpoint');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 步骤 2: 准备读取器、解码器和所需变量
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';          // 缓冲区，用于拼接可能被分割的数据块
    let finalContent = '';    // 用于累积所有的对话文本内容
    let chatQuestions = [];   // 用于存储最后找到的推荐问题

    // 步骤 3: 循环读取数据流
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log('数据流接收完毕。');
        break;
      }

      // 将新解码的 chunk 追加到缓冲区
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // 步骤 4: 尝试从缓冲区中按行解析消息
      let newlineIndex;
      // 只要缓冲区中还能找到换行符，就持续处理
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        // 提取出一行完整的消息
        const line = buffer.slice(0, newlineIndex).trim();
        // 从缓冲区中移除已处理的行
        buffer = buffer.slice(newlineIndex + 1);

        // 步骤 5: 使用 extractData 函数提取纯净的 JSON 字符串
        const jsonDataString = extractData(line);

        // 如果提取成功 (不为 null 或空)
        if (jsonDataString) {
          // 跳过 SSE 的结束标记
          if (jsonDataString.trim() === '[DONE]') {
            continue;
          }

          try {
            const parsedData = JSON.parse(jsonDataString);

            // 累积对话内容，用于最终展示 (实现打字机效果的地方)
            const contentDelta = parsedData.choices?.[0]?.delta?.content || parsedData.choices?.[0]?.message?.content || '';
            if (contentDelta) {
              finalContent += contentDelta;
            }

            // 关键逻辑：检查当前消息是否包含 chatQuestions 字段
            // 如果有，就用它覆盖之前的值。循环结束后，这里将保存最后一次的赋值。
            if (parsedData.chatQuestions && Array.isArray(parsedData.chatQuestions)) {
              chatQuestions = parsedData.chatQuestions;
            }
          } catch (e) {
            // 忽略解析错误。可能是 JSON 数据不完整，它会被留在 buffer 中等待下一个 chunk。
            // console.warn('解析 JSON 失败，等待更多数据:', jsonDataString);
          }
        }
      }
    }
    
    // 步骤 6: 流结束后，统一输出最终结果
    console.log("\n================ 最终结果 ================");
    console.log("【完整对话内容】:");
    console.log(finalContent.trim() || "无对话内容。");
    
    console.log("\n【相关问题推荐】:");
    if (chatQuestions.length > 0) {
      console.log(chatQuestions);
    } else {
      console.log("未在数据流中找到 'chatQuestions' 字段。");
    }

  } catch (error) {
    console.error('处理流式数据时发生严重错误:', error);
  }
}

// 运行主函数
consumeStreamingResponseAndProcess();
```

