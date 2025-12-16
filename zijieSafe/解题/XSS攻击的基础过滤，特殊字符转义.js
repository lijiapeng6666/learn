/**
 * XSS攻击的基础过滤 - 特殊字符转义
 * 对输入的HTML特殊字符进行转义，防止XSS攻击
 */

// ===== 方案1: 基础字符转义 =====

// 1. HTML特殊字符转义映射表
const htmlEscapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
};

// 2. HTML特殊字符反转义映射表
const htmlUnescapeMap = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x2F;': '/'
};

// 3. 基础HTML转义函数
function escapeHtml(text) {
  if (!text || typeof text !== 'string') return '';

  return text.replace(/[&<>"'\/]/g, (match) => {
    return htmlEscapeMap[match];
  });
}

// 4. HTML反转义函数
function unescapeHtml(text) {
  if (!text || typeof text !== 'string') return '';

  // 使用正则表达式替换所有已转义的特殊字符
  let unescaped = text;
  Object.entries(htmlUnescapeMap).forEach(([escaped, original]) => {
    unescaped = unescaped.replace(new RegExp(escaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), original);
  });
  return unescaped;
}

// ===== 方案2: 更安全的属性转义 =====

// 5. URL属性转义 - 防止javascript:协议
function escapeUrlAttribute(url) {
  if (!url || typeof url !== 'string') return '';

  // 检查是否包含危险协议
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase().trim();

  for (let protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return ''; // 返回空字符串，拒绝危险URL
    }
  }

  // 对URL中的特殊字符进行转义
  return escapeHtml(url);
}

// 6. JavaScript事件属性转义
function escapeEventAttribute(value) {
  if (!value || typeof value !== 'string') return '';

  // 转义HTML特殊字符，防止属性值中的引号逃逸
  return escapeHtml(value);
}

// ===== 方案3: 内容安全策略 =====

// 7. 检查并移除危险的HTML标签
function stripDangerousTags(html) {
  if (!html || typeof html !== 'string') return '';

  // 危险标签列表
  const dangerousTags = [
    'script',  // 脚本标签
    'iframe',  // 嵌入框架
    'style',   // 样式标签
    'object',  // 对象
    'embed',   // 嵌入
    'link',    // 链接
    'meta',    // 元标签
    'form'     // 表单
  ];

  let result = html;

  // 移除所有危险标签及其内容
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?<\\/\\s*${tag}\\s*>|<${tag}[^>]*\\s*\\/?>`, 'gi');
    result = result.replace(regex, '');
  });

  return result;
}

// 8. 移除危险的事件处理器属性
function removeEventHandlers(html) {
  if (!html || typeof html !== 'string') return '';

  // 危险的事件处理器列表
  const eventHandlers = [
    'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
    'onkeydown', 'onkeyup', 'onchange', 'onfocus', 'onblur',
    'onsubmit', 'ondblclick', 'oncontextmenu', 'onwheel',
    'oninput', 'onpaste', 'oncopy', 'oncut', 'ondrag', 'ondrop'
  ];

  let result = html;

  // 移除所有事件处理器属性
  eventHandlers.forEach(handler => {
    const regex = new RegExp(`\\s*${handler}\\s*=\\s*['"](.*?)['"]`, 'gi');
    result = result.replace(regex, '');
  });

  return result;
}

// ===== 方案4: 综合XSS防护 =====

// 9. 综合的XSS防护函数 - 用于文本内容
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';

  // 步骤1: 转义HTML特殊字符
  let sanitized = escapeHtml(text);

  // 步骤2: 移除所有HTML标签和属性
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  return sanitized;
}

// 10. 综合的XSS防护函数 - 用于HTML内容
function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';

  // 步骤1: 移除危险标签
  let sanitized = stripDangerousTags(html);

  // 步骤2: 移除危险的事件处理器
  sanitized = removeEventHandlers(sanitized);

  // 步骤3: 对属性值进行转义
  sanitized = sanitized.replace(/href\s*=\s*["']([^"']*)["']/gi, (match, url) => {
    const safeUrl = escapeUrlAttribute(url);
    return `href="${safeUrl}"`;
  });

  return sanitized;
}

// 11. 针对特定HTML属性的安全处理
function createSafeHtmlAttributes(attributes) {
  if (!attributes || typeof attributes !== 'object') return {};

  const safeAttributes = {};
  // 属性白名单 - 只允许这些属性
  const whitelistAttributes = ['id', 'class', 'style', 'title', 'alt', 'href', 'src'];

  Object.entries(attributes).forEach(([key, value]) => {
    // 只允许白名单中的属性
    if (whitelistAttributes.includes(key.toLowerCase())) {
      if (key.toLowerCase() === 'href' || key.toLowerCase() === 'src') {
        // 对URL属性进行特殊处理
        safeAttributes[key] = escapeUrlAttribute(value);
      } else {
        // 其他属性进行HTML转义
        safeAttributes[key] = escapeHtml(value);
      }
    }
  });

  return safeAttributes;
}

// ===== 方案5: 使用DOMParser进行安全处理 =====

// 12. 使用DOMParser进行安全的HTML解析
function sanitizeWithDOMParser(html) {
  // 检查是否在浏览器环境
  if (typeof DOMParser === 'undefined') {
    console.warn('DOMParser在此环境中不可用');
    return sanitizeHtml(html);
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 移除script标签
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    // 移除所有事件处理器属性
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(element => {
      // 移除所有on*属性
      Array.from(element.attributes).forEach(attr => {
        if (attr.name.toLowerCase().startsWith('on')) {
          element.removeAttribute(attr.name);
        }
      });

      // 检查href和src属性中的危险协议
      if (element.href) {
        element.href = escapeUrlAttribute(element.href);
      }
      if (element.src) {
        element.src = escapeUrlAttribute(element.src);
      }
    });

    return doc.body.innerHTML;
  } catch (error) {
    console.error('解析HTML时出错:', error);
    return escapeHtml(html);
  }
}

// ===== 测试用例 =====

console.log('===== HTML转义测试 =====');
console.log('原始:', '<script>alert("XSS")</script>');
console.log('转义:', escapeHtml('<script>alert("XSS")</script>'));
console.log('');

console.log('===== HTML反转义测试 =====');
console.log('原始:', '&lt;div&gt;');
console.log('反转义:', unescapeHtml('&lt;div&gt;'));
console.log('');

console.log('===== 危险URL过滤测试 =====');
console.log('危险URL:', 'javascript:alert("XSS")');
console.log('处理后:', escapeUrlAttribute('javascript:alert("XSS")'));
console.log('安全URL:', 'https://example.com');
console.log('处理后:', escapeUrlAttribute('https://example.com'));
console.log('');

console.log('===== 危险标签移除测试 =====');
console.log('原始:', '<div><script>alert("XSS")</script>Hello</div>');
console.log('处理后:', stripDangerousTags('<div><script>alert("XSS")</script>Hello</div>'));
console.log('');

console.log('===== 事件处理器移除测试 =====');
console.log('原始:', '<div onclick="alert(\'XSS\')">Click me</div>');
console.log('处理后:', removeEventHandlers('<div onclick="alert(\'XSS\')">Click me</div>'));
console.log('');

console.log('===== 文本内容消毒测试 =====');
console.log('原始:', '<img src="x" onerror="alert(\'XSS\')">');
console.log('处理后:', sanitizeText('<img src="x" onerror="alert(\'XSS\')">'));
console.log('');

console.log('===== HTML内容消毒测试 =====');
const htmlInput = '<p>Hello <strong onclick="alert(\'XSS\')">World</strong></p><script>alert("XSS")</script>';
console.log('原始:', htmlInput);
console.log('处理后:', sanitizeHtml(htmlInput));
console.log('');

console.log('===== 属性白名单测试 =====');
const attributes = {
  id: 'myId',
  onclick: 'alert("XSS")',
  href: 'javascript:alert("XSS")',
  title: '安全标题'
};
console.log('原始属性:', attributes);
console.log('安全属性:', createSafeHtmlAttributes(attributes));
console.log('');

// ===== 实际应用示例 =====

console.log('===== 实际应用示例 =====');

// 例1: 用户评论处理
function processUserComment(comment) {
  // 对用户输入的评论进行消毒
  return sanitizeText(comment);
}

const userComment = '<script>alert("XSS")</script>很好用的产品！ <img src="x" onerror="alert(\'XSS\')">';
console.log('用户评论原始:', userComment);
console.log('处理后:', processUserComment(userComment));
console.log('');

// 例2: 用户头像URL处理
function processAvatarUrl(url) {
  // 确保URL安全
  return escapeUrlAttribute(url);
}

const avatarUrl = 'javascript:alert("XSS")';
console.log('头像URL:', avatarUrl);
console.log('处理后:', processAvatarUrl(avatarUrl));
console.log('');

// 例3: 用户昵称处理
function processUsername(username) {
  // 对用户昵称进行HTML转义
  return escapeHtml(username);
}

const username = '<script>alert("XSS")</script>';
console.log('用户昵称:', username);
console.log('处理后:', processUsername(username));
console.log('');

// 例4: 富文本编辑器内容处理
function processRichTextContent(content) {
  // 对富文本内容进行安全处理，保留安全的HTML标签
  return sanitizeHtml(content);
}

const richContent = '<p>Hello <strong>World</strong></p><script>alert("XSS")</script><img src="x" onerror="alert(\'XSS\')">';
console.log('富文本内容:', richContent);
console.log('处理后:', processRichTextContent(richContent));

// ===== 模块导出 =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeHtml,
    unescapeHtml,
    escapeUrlAttribute,
    escapeEventAttribute,
    stripDangerousTags,
    removeEventHandlers,
    sanitizeText,
    sanitizeHtml,
    createSafeHtmlAttributes,
    sanitizeWithDOMParser,
    processUserComment,
    processAvatarUrl,
    processUsername,
    processRichTextContent,
    htmlEscapeMap,
    htmlUnescapeMap
  };
}
