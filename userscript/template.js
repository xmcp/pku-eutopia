// ==UserScript==
// @name         Eutopia
// @namespace    http://xmcp.ltd/
// @version      0.5
// @description  Top of the top. Top of the world.
// @author       xmcp
// @match        https://process.pku.edu.cn/v2/site/index*
// @match        https://process.pku.edu.cn/v2/site/m_index*
// @match        https://process-443.w.pku.edu.cn/v2/site/index*
// @match        https://process-443.w.pku.edu.cn/v2/site/m_index*
// @match        https://wproc.pku.edu.cn/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

const USERSCRIPT_COMPAT_VER = 'compat.v2';

(() => {
    console.log('eutopia: begin injection');

    if(!(['process.pku.edu.cn', 'process-443.w.pku.edu.cn', 'wproc.pku.edu.cn'].includes(document.domain))) {
        console.error('eutopia: wrong domain');
        return;
    }
    if(location.href.indexOf('/reserve/m_signIn')!==-1) {
        console.error('eutopia: skipping signin page');
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
    document.documentElement.appendChild(container);

    let shadow = container.attachShadow({mode: 'open'});

    let root = document.createElement('div');
    root.id = 'eu-root';
    shadow.appendChild(root);

    STYLES.forEach(u => {
        let elem = document.createElement('link');
        elem.rel = 'stylesheet';
        elem.fetchpriority = 'high';
        elem.href = u; // + '?t=' + (+new Date());
        shadow.appendChild(elem);
    });

    SCRIPTS.forEach(u => {
        let elem = document.createElement('script');
        elem.async = true;
        elem.fetchpriority = 'high';
        elem.src = u; // + '?t=' + (+new Date());
        document.documentElement.appendChild(elem);
    });
})();