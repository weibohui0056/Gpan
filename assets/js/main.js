
const fileTree = {
  "README_CN.md": "README_CN.md",
  "LICENSE": "LICENSE"
};

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
            link.innerHTML = `<span class="file-name">${name}</span>`;
            div.appendChild(link);
        } else {
            // 文件夹
            const folderDiv = document.createElement('div');
            folderDiv.className = 'folder';
            folderDiv.innerHTML = `<span class="folder-name">${name || 'Root'}</span>`;

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
    //         datetime: '2025-02-15 11:18:06',
    //         user: 'weibohui0056'
    //     };
    //     document.getElementById('lastUpdated').textContent = `${generatedInfo.datetime} UTC by ${generatedInfo.user}`;
    // }
}

document.addEventListener('DOMContentLoaded', () => {
    new FileExplorer();
});