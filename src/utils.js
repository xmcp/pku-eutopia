export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function randint(max) {
    return Math.floor(Math.random()*max);
}

export function d_to_yyyymmdd(d) {
    return `${d.getFullYear()}-${(''+(d.getMonth()+1)).padStart(2, '0')}-${(''+d.getDate()).padStart(2, '0')}`;
}

export function hhmm_to_int(hhmm) {
    let [h, m] = hhmm.split(':').map(s => parseInt(s, 10));
    return h*60 + m;
}

export function str_count(s, c) {
    return s.split(c).length - 1;
}

export function range0(r) {
    let ret = [];
    for(let i=0; i<r; i++)
        ret.push(i);
    return ret;
}

export function eu_sys_version() {
    return document.domain==='wproc.pku.edu.cn' ? 2 : 1;
}