import {createContext, useState} from 'react';

export const ConfigCtx = createContext({
    config: {},
    update_config: ()=>{},
});

function make_default(c) {
    return {
        location: 'cp',
        ...c,
    };
}

function read_config() {
    let cfg = '{}';
    try {
        cfg = localStorage.getItem('config');
    } catch(e) {
        // maybe localStorage is disabled, warn user when writing config
    }

    try {
        return make_default(JSON.parse(cfg));
    } catch(e) {
        alert('配置格式错误，已重置');
        localStorage.setItem('config', '{}');
        return {};
    }
}

function write_config(c) {
    try {
        localStorage.setItem('config', JSON.stringify(c));
        console.log('written config', c);
    } catch(e) {
        alert('保存配置失败，浏览器可能禁用了localstorage');
    }
}

export function ConfigProvider({children}) {
    let [config, set_config] = useState(()=>read_config());

    function update_config(c) {
        set_config(c);
        write_config(c);
    }

    return (
        <ConfigCtx.Provider value={{
            config,
            update_config,
        }}>
            {children}
        </ConfigCtx.Provider>
    );
}