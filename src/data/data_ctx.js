import {createContext, useState, useEffect, useCallback} from 'react';

import {get_list_shuttle} from '../api/list_shuttle';
import {get_list_reservation} from '../api/list_reservation';

export const SYMBOL_FAILED = Symbol('failed');

export const DataCtx = createContext({
    shuttle_thisweek: null,
    shuttle_nextweek: null,
    reservation: null,

    loading: false,
    last_update: {},
    reload_all: (_soft=false)=>{},
});

export function with_fallback(d) {
    return d===null || d===SYMBOL_FAILED ? [] : d;
}

export function loaded(d) {
    return d!==null && d!==SYMBOL_FAILED;
}

export function DataProvider({children}) {
    let [shuttle_thisweek, set_shuttle_thisweek] = useState(null);
    let [shuttle_nextweek, set_shuttle_nextweek] = useState(null);
    let [reservation, set_reservation] = useState(null);

    let [last_update, set_last_update] = useState({});
    let [loading, set_loading] = useState(false);

    async function reload(promise, setter, label, soft) {
        if(!soft)
            setter(null);

        try {
            let list = await promise;
            console.log('loaded', label, list);
            setter(list);
            set_last_update(u => ({
                ...u,
                [label]: new Date(),
            }));
        } catch(e) {
            console.error(e);
            setter(SYMBOL_FAILED);
            set_last_update(u => ({
                ...u,
                [label]: null,
            }));
        }
    }

    const reload_all = useCallback((soft=false)=>{
        console.log('reload_all', soft);

        set_loading(true);
        set_last_update({});

        Promise.allSettled([
            reload(get_list_shuttle(0), set_shuttle_thisweek, 'shuttle_thisweek', soft),
            reload(get_list_shuttle(1), set_shuttle_nextweek, 'shuttle_nextweek', soft),
            reload(get_list_reservation(), set_reservation, 'reservation', soft),
        ])
            .then(()=>{
                set_loading(false);
            });
    }, []);

    useEffect(()=>{
        reload_all();
    }, [reload_all]);

    // auto reload
    useEffect(()=>{
        function on_focus() {
            let now = +new Date();
            let last = Math.max(
                ...Object.values(last_update).filter(x => x!==null).map(x => +x)
            );
            if(now-last > 1000*60*5) {
                reload_all(true);
            }
        }

        window.addEventListener('focus', on_focus);
        return ()=>{
            window.removeEventListener('focus', on_focus);
        }
    },[reload_all, last_update]);

    return (
        <DataCtx.Provider value={{
            shuttle_thisweek,
            shuttle_nextweek,
            reservation,

            loading,
            last_update,
            reload_all,
        }}>
            {children}
        </DataCtx.Provider>
    )
}