// ==UserScript==
// @name         Eutopia
// @namespace    http://xmcp.ltd/
// @version      0.3
// @description  Top of the top. Top of the world.
// @author       xmcp
// @match        https://process.pku.edu.cn/v2/site/index*
// @match        https://process.pku.edu.cn/v2/site/m_index*
// @match        https://process-443.w.pku.edu.cn/v2/site/index*
// @match        https://process-443.w.pku.edu.cn/v2/site/m_index*
// @grant        none
// @run-at       document-body
// ==/UserScript==

const USERSCRIPT_COMPAT_VER = 'compat.v1';

(() => {
    console.log('eutopia: begin injection');

    if(!(['process.pku.edu.cn', 'process-443.w.pku.edu.cn'].includes(document.domain))) {
        console.error('eutopia: wrong domain');
        return;
    }

    window.USERSCRIPT_COMPAT_VER = USERSCRIPT_COMPAT_VER; // injected js may read this

    const SCRIPTS = [/* INJECTION POINT: JS FILES */];
    const STYLES = [/* INJECTION POINT: CSS FILES */];

    let container = document.createElement('div');
    container.id = 'eutopia-mount-point';
    container.style.fontFamily = 'initial';
    container.style.fontSize = '14px';
    container.style.lineHeight = 'initial';
    container.style.color = 'black';
    document.body.appendChild(container);

    let shadow = container.attachShadow({mode: 'open'});

    let root = document.createElement('div');
    root.id = 'eu-root';
    shadow.appendChild(root);

    STYLES.forEach(u => {
        let elem = document.createElement('link');
        elem.rel = 'stylesheet';
        elem.href = u; // + '?t=' + (+new Date());
        shadow.appendChild(elem);
    });

    SCRIPTS.forEach(u => {
        let elem = document.createElement('script');
        elem.src = u; // + '?t=' + (+new Date());
        document.head.appendChild(elem);
    });
})();