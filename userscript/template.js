// ==UserScript==
// @name         Eutopia
// @namespace    http://xmcp.ltd/
// @version      0.1
// @description  Top of the top. Top of the world.
// @author       xmcp
// @match        https://process.pku.edu.cn/v2/site/index
// @match        https://process.pku.edu.cn/v2/site/m_index
// @match        https://process-443.w.pku.edu.cn/v2/site/index
// @match        https://process-443.w.pku.edu.cn/v2/site/m_index
// @grant        none
// @run-at       document-body
// ==/UserScript==

console.log('eutopia: begin injection');

const SCRIPTS = [/* INJECTION POINT: JS FILES */];
const STYLES = [/* INJECTION POINT: CSS FILES */];

let container = document.createElement('div');
container.id = 'eutopia-mount-point';
container.style.fontFamily = 'initial';
container.style.fontSize = '1rem';
container.style.lineHeight = '1';
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