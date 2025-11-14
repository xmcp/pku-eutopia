# Project Eutopia：

**兆京大学班车预约 for Humans™**

班车预约系统增强脚本：一键约车，零键签到，一目了然，触手可及

![screenshot](userscript/media/screenshot.webp)

## 功能特色

- 用**人类可读**的方式呈现班车时刻和预约记录
- 时间临近班车时（发车前 1~25 分钟）**自动展示详情**，可一键预约并展示二维码
- 时间临近已预约的班车时**自动展示二维码**
- 显示**超亮的二维码**，方便扫描（需要设备支持 HDR，比如 iPhone）
- 弱网环境**超快加载**，脚本仅 20KB，绕过原系统繁杂且低效的网络请求，且支持自动重试

## 快速上手

可作为用户脚本安装，详见教程：[xmcp.ltd/pku-eutopia](https://xmcp.ltd/pku-eutopia/)。

## 本地部署

注重隐私的用户可以将前端代码部署到自己的服务器或 CDN，同时这也将略微减少我的服务器流量开销。

部署方式：

1. `npm install`
2. `npm run build`
3. 修改 `userscript/gen_userscript.py`，在 `HOST_URL` 处输入你的服务器网址
4. `pip3 install -r userscript/requirements.txt`
5. `python3 userscript/gen_userscript.py`
6. 将 `userscript/build` 目录部署到你的服务器上

本地部署之后请注意及时追踪上游更新，以避免兼容性问题。