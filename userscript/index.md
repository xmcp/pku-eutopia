# Project Eutopia：

**班车预约 for Humans™**

班车预约系统重制版：快速约车，*\<del>壹\</del>* **零**键签到，一目了然，触手可及



## 二维码签到更新说明（2024.3.17）

最近启用了二维码签到功能，本插件现已适配。目前的签到逻辑如下：

- 在 “预约记录” 页面，从发车时刻前 30 分钟开始将展示签到按钮（蓝色背景），点击即可展示签到二维码。
- 在 “班车时刻” 页面，对于无法预约的班次（例如 “已过期”，按钮显示为灰色背景），点击即可展示临时登记码；对于可以预约的班次，将展示预约按钮，预约后将展示签到按钮，点击即可展示签到二维码。
- 进入网页时，如果有恰好一个可以签到的预约，将直接弹出签到二维码。<del>一键签到正式升级为零键签到。</del>在偏好设置里可以关闭此行为。

另外本次更新将框架从 React 切换到了 Preact，使包体大小从 65KB 降低至 21KB。如果你遇到了旧设备的兼容性问题，可能是 Preact 导致的，请在 GitHub 提交 issue。



![screenshot](media/screenshot.png)



## 通过用户脚本管理器安装（推荐）

首先安装一个用户脚本管理器：

- 电脑端 Chrome / Edge / Firefox 用户推荐使用 [Tampermonkey](https://www.tampermonkey.net/)。
- iOS / macOS Safari 用户推荐使用 [Userscripts](https://apps.apple.com/cn/app/userscripts/id1463298887)，请参阅 [该项目的 README](https://github.com/quoid/userscripts#usage)。
- Android 用户推荐安装 Firefox 浏览器然后使用 [Tampermonkey](https://addons.mozilla.org/en-US/android/addon/tampermonkey/)，你也可以使用其他支持插件或者用户脚本的浏览器（例如 Via、Kiwi、Yandex Browser）。

然后将 [https://xmcp.ltd/pku-eutopia/eutopia.user.js](https://xmcp.ltd/pku-eutopia/eutopia.user.js) 添加到用户脚本管理器中，即安装完成。

安装完成后每次访问办事大厅主页，页面底部将自动出现相关功能的按钮。iOS / macOS 用户首次使用时可能需要在地址栏左侧的菜单中授权 Userscripts 访问相关域名。

建议将网址 https://wproc.pku.edu.cn/v2/site/index 添加到浏览器收藏，访问此链接即可直接激活班车预约插件。



## 通过 Bookmarklet 安装

右键 / 长按 / 拖拽此链接 →【[班车预约](javascript:el=document.createElement('script');el.charset='utf-8';el.src='https://xmcp.ltd/pku-eutopia/eutopia.user.js';void document.head.appendChild(el))】 ，将它添加到浏览器书签。

此后在办事大厅域名打开书签，即出现相关功能的按钮。请注意你需要先登录到办事大厅再点击书签。



## 开放源代码

[xmcp/pku-eutopia](https://github.com/xmcp/pku-eutopia)，按 MIT 协议开源。