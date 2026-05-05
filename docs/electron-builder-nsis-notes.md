# NSIS 配置说明

`package.json` 中 `build.nsis` 配置对应说明如下：

- `oneClick: false`
  - 启用向导式安装（非一键安装）。
- `allowToChangeInstallationDirectory: true`
  - 允许用户在安装向导中选择安装目录。
- `allowElevation: true`
  - 允许在需要时请求管理员权限（用于“为所有用户安装”等场景）。
- `perMachine: false`
  - 默认按“当前用户安装”处理。
- `selectPerMachineByDefault: false`
  - 安装界面中默认不选择“为所有用户安装”。

另外，Windows 应用名和图标相关配置为：

- `build.productName: "大模型问答器"`
  - 控制安装后显示的应用名称（开始菜单、卸载列表等）。
- `build.win.icon: "build/icon.ico"`
  - Windows 可执行文件图标路径。
