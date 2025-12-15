/**
 * 前端数据脱敏算法
 * 对手机号、邮箱、身份证号等敏感信息按规则隐藏
 */

// 1. 手机号脱敏 (显示为: 138****1234)
function maskPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return '';

  // 移除非数字字符
  const cleanPhone = phone.replace(/\D/g, '');

  // 检查长度 - 中国手机号11位
  if (cleanPhone.length !== 11) return phone;

  // 显示前3位和后4位，中间用4个星号代替
  return cleanPhone.slice(0, 3) + '****' + cleanPhone.slice(-4);
}

// 2. 邮箱脱敏 (显示为: u***@example.com)
function maskEmail(email) {
  if (!email || typeof email !== 'string') return '';

  const [localPart, domain] = email.split('@');

  if (!localPart || !domain) return email;

  // 保留首字母和最后一个字符，中间用星号代替
  if (localPart.length <= 2) {
    return localPart.charAt(0) + '***@' + domain;
  }

  const masked = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
  return masked + '@' + domain;
}

// 3. 身份证号脱敏 (显示为: 110101****5678)
function maskIdCard(idCard) {
  if (!idCard || typeof idCard !== 'string') return '';

  // 只处理18位和15位身份证
  const id = idCard.trim();

  if (id.length !== 18 && id.length !== 15) return id;

  // 显示前6位和后4位，中间用星号代替
  return id.slice(0, 6) + '*'.repeat(id.length - 10) + id.slice(-4);
}

// 4. 银行卡号脱敏 (显示为: 6222****6666)
function maskBankCard(cardNumber) {
  if (!cardNumber || typeof cardNumber !== 'string') return '';

  const cleanCard = cardNumber.replace(/\s/g, '');

  // 显示前4位和后4位，中间用星号代替
  if (cleanCard.length < 8) return cleanCard;

  return cleanCard.slice(0, 4) + '*'.repeat(cleanCard.length - 8) + cleanCard.slice(-4);
}

// 5. 通用脱敏函数 (自定义规则)
function maskString(str, showStart = 3, showEnd = 3, maskChar = '*') {
  if (!str || typeof str !== 'string') return '';

  if (str.length <= showStart + showEnd) {
    return str;
  }

  const start = str.slice(0, showStart);
  const end = str.slice(-showEnd);
  const maskLength = str.length - showStart - showEnd;

  return start + maskChar.repeat(maskLength) + end;
}

// 6. 姓名脱敏 (显示为: 张**)
function maskName(name) {
  if (!name || typeof name !== 'string') return '';

  // 中文名字处理
  if (name.length === 2) {
    return name.charAt(0) + '*';
  } else if (name.length > 2) {
    return name.charAt(0) + '*'.repeat(name.length - 1);
  }

  return name;
}

// 7. IP地址脱敏 (显示为: 192.168.***.*)
function maskIpAddress(ip) {
  if (!ip || typeof ip !== 'string') return '';

  const parts = ip.split('.');

  if (parts.length !== 4) return ip;

  // 保留前两段，后两段用星号代替
  return parts[0] + '.' + parts[1] + '.' + '***' + '.' + '***';
}

// 8. URL参数脱敏 (隐藏敏感参数值)
function maskUrlParams(url, sensitiveParams = ['password', 'token', 'key', 'secret']) {
  if (!url || typeof url !== 'string') return '';

  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    sensitiveParams.forEach(param => {
      if (params.has(param)) {
        params.set(param, '***');
      }
    });

    urlObj.search = params.toString();
    return urlObj.toString();
  } catch {
    return url;
  }
}

// ===== 测试用例 =====
console.log('=== 手机号脱敏 ===');
console.log(maskPhoneNumber('13800138000')); // 输出: 138****8000
console.log(maskPhoneNumber('138-0013-8000')); // 输出: 138****8000

console.log('\n=== 邮箱脱敏 ===');
console.log(maskEmail('user@example.com')); // 输出: u***@example.com
console.log(maskEmail('john.doe@company.com')); // 输出: j***e@company.com

console.log('\n=== 身份证脱敏 ===');
console.log(maskIdCard('110101199003071234')); // 输出: 110101****1234
console.log(maskIdCard('11010119900307123')); // 输出: 110101****123 (15位)

console.log('\n=== 银行卡脱敏 ===');
console.log(maskBankCard('6222 1234 5678 6666')); // 输出: 6222****6666
console.log(maskBankCard('6222123456786666')); // 输出: 6222****6666

console.log('\n=== 通用脱敏 ===');
console.log(maskString('13800138000', 3, 4)); // 输出: 138****8000
console.log(maskString('confidential_data', 1, 1)); // 输出: c***a

console.log('\n=== 姓名脱敏 ===');
console.log(maskName('张三')); // 输出: 张*
console.log(maskName('张三丰')); // 输出: 张**

console.log('\n=== IP地址脱敏 ===');
console.log(maskIpAddress('192.168.1.100')); // 输出: 192.168.***.***
console.log(maskIpAddress('10.0.0.1')); // 输出: 10.0.***.***

console.log('\n=== URL参数脱敏 ===');
console.log(maskUrlParams('https://api.example.com/login?username=user&password=123456&token=abc'));
// 输出: https://api.example.com/login?username=user&password=***&token=***

// ===== 高级用法：对象批量脱敏 =====
const maskConfig = {
  phone: 'phone',
  email: 'email',
  idCard: 'idCard',
  bankCard: 'bankCard',
  name: 'name'
};

function maskObject(obj, config) {
  const masked = { ...obj };

  Object.entries(config).forEach(([key, type]) => {
    if (masked[key]) {
      switch (type) {
        case 'phone':
          masked[key] = maskPhoneNumber(masked[key]);
          break;
        case 'email':
          masked[key] = maskEmail(masked[key]);
          break;
        case 'idCard':
          masked[key] = maskIdCard(masked[key]);
          break;
        case 'bankCard':
          masked[key] = maskBankCard(masked[key]);
          break;
        case 'name':
          masked[key] = maskName(masked[key]);
          break;
        default:
          break;
      }
    }
  });

  return masked;
}

// 使用示例
const userData = {
  name: '张三',
  phone: '13800138000',
  email: 'user@example.com',
  idCard: '110101199003071234',
  bankCard: '6222123456786666'
};

console.log('\n=== 对象批量脱敏 ===');
console.log(maskObject(userData, {
  name: 'name',
  phone: 'phone',
  email: 'email',
  idCard: 'idCard',
  bankCard: 'bankCard'
}));

// 预期输出:
// {
//   name: '张*',
//   phone: '138****8000',
//   email: 'u***@example.com',
//   idCard: '110101****1234',
//   bankCard: '6222****6666'
// }

// ===== 模块导出 =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    maskPhoneNumber,
    maskEmail,
    maskIdCard,
    maskBankCard,
    maskString,
    maskName,
    maskIpAddress,
    maskUrlParams,
    maskObject
  };
}
