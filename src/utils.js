export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function randint(max) {
    return Math.floor(Math.random()*max);
}

export function to_yyyymmdd(d) {
    return `${d.getFullYear()}-${(''+(d.getMonth()+1)).padStart(2, '0')}-${(''+d.getDate()).padStart(2, '0')}`;
}

export function str_count(s, c) {
    return s.split(c).length - 1;
}