module.exports = {
  // 基础格式化选项
  singleQuote: true, // 使用单引号
  semi: true, // 语句末尾添加分号
  tabWidth: 2, // 缩进宽度
  useTabs: false, // 使用空格而不是制表符
  trailingComma: 'es5', // 多行时尾随逗号
  printWidth: 120, // 每行最大字符数
  endOfLine: 'lf', // 换行符类型

  // 括号和空格
  bracketSpacing: true, // 对象字面量的括号间添加空格
  bracketSameLine: false, // JSX 标签的反尖括号需要换行
  arrowParens: 'avoid', // 箭头函数参数括号

  // JSX 特定选项
  jsxSingleQuote: true, // JSX 中使用单引号

  // 其他选项
  quoteProps: 'as-needed', // 对象属性引号
  htmlWhitespaceSensitivity: 'css', // HTML 空白敏感度
  embeddedLanguageFormatting: 'auto', // 嵌入式语言格式化

  // 文件覆盖配置
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.{css,scss,less}',
      options: {
        singleQuote: false,
      },
    },
  ],
};
