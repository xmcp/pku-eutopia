# Project Eutopia：

**兆京大学班车预约 for Humans™**

班车预约系统重制版：快速约车，一键签到，功能整合，界面易用

![screenshot](userscript/media/screenshot.png)

## 快速上手

安装方式请访问 [xmcp.ltd/pku-eutopia](https://xmcp.ltd/pku-eutopia/)。

## 本地部署

注重隐私的用户可以将前端代码部署到自己的服务器或 CDN，同时这也将略微减少我的服务器流量开销。

部署方式：

1. `npm install`
2. `npm run build`
3. 修改 `userscript/gen_userscript.py`，在 `HOST_URL` 处输入你的服务器网址
4. `python3 userscript/gen_userscript.py`
5. 将 `userscript/build` 目录部署到你的服务器上

本地部署之后请注意及时追踪上游更新。