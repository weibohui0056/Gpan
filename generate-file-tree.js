const glob = require('glob');
const fs = require('fs-extra');
const path = require('path');

// 配置：需要排除的目录和文件
const excludePatterns = [
    'node_modules/**',
    '.git/**',
    '.github/**',
    'package-lock.json',
    'package.json',
    'generate-file-tree.js',
    'index.html',
    'assets/**',
    '*README.md',
    'README.md'
];

// 获取文件树
function getFileTree() {
    const files = glob.sync('**/*', {
        ignore: excludePatterns,
        nodir: true,
        dot: true
    });

    const tree = {};
    files.forEach(file => {
        if (file.toLowerCase().endsWith('readme.md')) {
            return;
        }

        const parts = file.split('/');
        let current = tree;
        parts.forEach((part, index) => {
            if (index === parts.length - 1) {
                current[part] = file;  // 存储完整路径
            } else {
                current[part] = current[part] || {};
                current = current[part];
            }
        });
    });
    return tree;
}

function generateJS(fileTree, currentInfo) {
    return `
const fileTree = ${JSON.stringify(fileTree, null, 2)};

class FileExplorer {
    constructor() {
        this.init();
    }

    init() {
        this.renderFileTree();
        this.setupEventListeners();
        // this.updateTimestamp(); // 删除此行
    }

    renderFileTree() {
        document.getElementById('fileTree').appendChild(this.createTreeElement(fileTree));
    }

    createTreeElement(tree, name = '') {
        const div = document.createElement('div');

        if (typeof tree === 'string') {
            // 文件 - 使用完整的相对路径
            const link = document.createElement('a');
            link.href = tree;  // 直接使用存储的路径
            link.className = 'file';
            link.innerHTML = \`<span class="file-name">\${name}</span>\`;
            div.appendChild(link);
        } else {
            // 文件夹
            const folderDiv = document.createElement('div');
            folderDiv.className = 'folder';
            folderDiv.innerHTML = \`<span class="folder-name">\${name || 'Root'}</span>\`;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'file-tree';

            Object.entries(tree).forEach(([key, value]) => {
                contentDiv.appendChild(this.createTreeElement(value, key));
            });

            folderDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                contentDiv.classList.toggle('hidden');
            });

            div.appendChild(folderDiv);
            div.appendChild(contentDiv);
        }

        return div;
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        // const expandAllBtn = document.getElementById('expandAll');  // 删除这行
        // const collapseAllBtn = document.getElementById('collapseAll'); // 删除这行

        searchInput.addEventListener('input', () => this.handleSearch(searchInput.value));
        // expandAllBtn.addEventListener('click', () => this.toggleAll(false)); // 删除这行
        // collapseAllBtn.addEventListener('click', () => this.toggleAll(true));   // 删除这行
    }

    handleSearch(searchTerm) {
        searchTerm = searchTerm.toLowerCase();
        const allItems = document.querySelectorAll('.file, .folder');

        allItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const shouldShow = text.includes(searchTerm);
            item.style.display = shouldShow ? '' : 'none';

            if (shouldShow && item.classList.contains('folder')) {
                let parent = item.parentElement;
                while (parent && !parent.classList.contains('container')) {
                    if (parent.classList.contains('file-tree')) {
                        parent.classList.remove('hidden');
                    }
                    parent = parent.parentElement;
                }
            }
        });
    }

    toggleAll(hide) {
        const treeDivs = document.querySelectorAll('.file-tree');
        treeDivs.forEach(div => {
            if (hide) {
                div.classList.add('hidden');
            } else {
                div.classList.remove('hidden');
            }
        });
    }

    // updateTimestamp() { // 删除整个函数
    //     const generatedInfo = {
    //         datetime: '${currentInfo.datetime}',
    //         user: '${currentInfo.user}'
    //     };
    //     document.getElementById('lastUpdated').textContent = \`\${generatedInfo.datetime} UTC by \${generatedInfo.user}\`;
    // }
}

document.addEventListener('DOMContentLoaded', () => {
    new FileExplorer();
});`;
}

function generateCSS() {
    return `
:root {
    --color-bg: #f6f8fa;
    --color-text: #24292f;
    --color-border: #d0d7de;
    --color-link: #0969da;
    --color-header: #ffffff;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: var(--color-bg);
    line-height: 1.5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    background-color: var(--color-header);
    padding: 24px;
    border-radius: 6px;
    border: 1px solid var(--color-border);
}

.header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border);
    display: flex; /* 使用 Flexbox 布局 */
    align-items: center; /* 垂直居中对齐 */
    /* adjust the search input position*/
    justify-content: space-between;
}

.header h1 {
    margin: 0;
    font-size: 24px;
    color: var(--color-text);
}

.search {
    margin: 16px 0;
    /*move to right*/
    width: 70%;
    margin-left: auto;
}

.search input {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 14px;
}

.controls {
    margin-bottom: 16px;
    display: flex;
    gap: 8px;
}

button {
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-header);
    cursor: pointer;
}

button:hover {
    background-color: var(--color-bg);
}

.file-tree {
    margin-left: 20px;
}

.folder, .file {
    padding: 4px 0;
    display: flex;
    align-items: center;
}

.folder {
    cursor: pointer;
    user-select: none;
    color: var(--color-link);
}

.folder:hover {
    text-decoration: underline;
}

.folder::before {
    content: "📁";
    margin-right: 6px;
}

.file {
    text-decoration: none;
    color: var(--color-text);
}

.file:hover {
    color: var(--color-link);
    text-decoration: underline;
}

.file::before {
    content: "📄";
    margin-right: 6px;
}

.hidden {
    display: none;
}

.footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
    text-align: center;
    color: #57606a;
    font-size: 12px;
}

/* ---------------------------- */
/*  Quote Section (Added)         */
/* ---------------------------- */

.footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
}

.quote {
    margin-top: 10px;
    font-style: italic;
    color: #666;
    text-align: center;
    border-radius: 5px;
}

.quote-text {
    font-size: 1.1em;
    line-height: 1.4;
}

.quote-author {
    display: block;
    font-size: 0.8em;
    font-style: normal;
    color: #888;
    margin-top: 5px;
}

/* Logo Style */
.logo {
    width: 100px; /* 设置 Logo 的宽度 */
    height: auto; /* 保持 Logo 的宽高比 */
    margin-right: 10px; /* 设置 Logo 与标题之间的间距 */
    vertical-align: middle; /* 让 Logo 与标题垂直对齐 */
}

`;
}

function generateHTML(fileTree) {
    const quoteText = "成大事的唯一方法就是热爱你所做的事。";
    const quoteAuthor = "史蒂夫·乔布斯";
    const authorLink = "https://github.com/weibohui0056";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gpan</title>
    <!-- 添加 favicon -->
    <link rel="icon" href="assets/logo.png" type="image/png">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <!-- 添加 Logo -->
            <img src="assets/logo.png" alt="Gpan Logo" class="logo">

            <!-- 删除 Welcome to Gpan! -->
            <!-- <h1>Welcome to Gpan!</h1> -->

            <div class="search">
                <input type="text" id="searchInput" placeholder="Search files...">
            </div>
            <!-- 删除这两个按钮 -->
            <!-- <div class="controls">
                <button id="expandAll">Expand All</button>
                <button id="collapseAll">Collapse All</button>
            </div> -->

        </div>

        <div id="fileTree"></div>

        <div class="footer">
            <!-- 删除这一行 -->
            <!-- <p>Last updated: <span id="lastUpdated"></span></p> -->

            <!-- 添加的名言区域 -->
            <p class="quote">
                <span class="quote-text">"${quoteText}"</span>
                <span class="quote-author">- ${quoteAuthor}</span>
            </p>
            <!-- 名言区域结束 -->

            <!-- 添加作者链接 -->
            <p class="quote">
                <a href="${authorLink}" class="quote-author" target="_blank">作者</a>
            </p>
            <!-- 作者链接结束 -->
        </div>
    </div>
    <script src="assets/js/main.js"></script>
</body>
</html>`;
}

// 创建目录并生成文件的函数
async function generateFiles() {
    // 当前时间和用户信息
    const currentInfo = {
        datetime: '2025-02-15 11:18:06',
        user: 'weibohui0056'
    };

    try {
        // 获取文件树
        const fileTree = getFileTree();

        // 创建资源目录
        fs.mkdirSync('assets/css', { recursive: true });
        fs.mkdirSync('assets/js', { recursive: true });

        // 生成并写入文件
        fs.writeFileSync('index.html', generateHTML(fileTree));
        fs.writeFileSync('assets/css/style.css', generateCSS());
        fs.writeFileSync('assets/js/main.js', generateJS(fileTree, currentInfo)); // 传递 currentInfo
        // fs.writeFileSync('assets/js/main.js', generateJS(fileTree));
        console.log('Files generated successfully!');
    } catch (error) {
        console.error('Error generating files:', error);
        process.exit(1);
    }
}

// 执行生成
generateFiles();
