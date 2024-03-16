import {useContext, useMemo, useState, useEffect, useCallback} from 'react';

import {DataProvider, DataCtx, with_fallback, loaded, SYMBOL_FAILED} from '../data/data_ctx';
import {parse_shuttle} from '../data/shuttle_parser';
import {ShuttleTable} from './ShuttleTable';
import {ReservationView} from './ReservationView';
import {parse_reservation, got_res_id} from '../data/reservation_parser';
import {ConfigProvider, ConfigCtx} from '../data/config_ctx';
import {eu_sys_version} from '../utils';
import {About} from './About';
import {QrcodePage} from './QrcodePage';

import './App.css';

function Skeleton() {
    return (
        <div className="eu-width-container eu-drop-shadow" style={{height: '100%'}}>
            <div className="eu-paper" style={{backgroundColor: '#f7f7f7'}}>
            </div>
        </div>
    );
}

function AlertBanner() {
    if(window.USERSCRIPT_COMPAT_VER!=='compat.v2')
        return (
            <div className="eu-alert-banner" onClick={()=>{
                window.location.href = 'https://xmcp.ltd/pku-eutopia/';
            }}>
                更新用户脚本来使用新系统预约，点击查看方法
            </div>
        );

    if(eu_sys_version()<2)
        return (
            <div className="eu-alert-banner" onClick={()=>{
                window.location.href = '/site/pku-seal/login?targetAppId=wproc&redirect_url=https://wproc.pku.edu.cn/v2/site/index';
            }}>
                点击前往 wproc.pku.edu.cn 使用新预约系统
            </div>
        );

    return null;
}

function Router() {
    let data = useContext(DataCtx);
    let {config} = useContext(ConfigCtx);

    let [route, set_route] = useState(config.auto_popup==='on' ? {view: 'shuttle_table'} : {view: 'off'});

    let shuttle_table_data = useMemo(()=>
        loaded(data.shuttle_thisweek) ?
            parse_shuttle(
                data.shuttle_thisweek.concat(with_fallback(data.shuttle_nextweek)),
                with_fallback(data.reservation),
                config.show_yesterday==='on',
            ) :
            null
    , [data.shuttle_thisweek, data.shuttle_nextweek, data.reservation, config.show_yesterday]);

    let reservation_data = useMemo(()=>
        loaded(data.reservation) && (got_res_id() || loaded(data.shuttle_thisweek)) ?
            parse_reservation(data.shuttle_thisweek, data.reservation) :
            null
    , [data.shuttle_thisweek, data.reservation]);

    const navigate = useCallback((target, args)=>{
        set_route(r => {
            let new_r = {...args, view: target};
            return r.view===new_r.view ? {view: 'off'} : new_r;
        });
    }, []);

    function sel_cls(target) {
        return route.view===target ? ' eu-pill-item-selected' : '';
    }

    useEffect(()=>{
        if(route.view!=='off') {
            window.EUTOPIA_RENDER_ROOT.classList.add('eu-open');
            return ()=>{
                window.EUTOPIA_RENDER_ROOT.classList.remove('eu-open');
            }
        }
    }, [route.view]);

    useEffect(()=>{
        if(window._eu_signin_popped) return;
        if(reservation_data) {
            window._eu_signin_popped = true;
            if(config.auto_popup) {
                let target = null;
                for(let r of reservation_data.pending) {
                    if(r.status==='pending_signable') {
                        if(target) // ignore auto signin if multiple targets
                            return;
                        target = r;
                    }
                }
                if(target)
                    navigate('qrcode', {type: 'reservation', reservation: target});
            }
        }
    }, [config.auto_popup, reservation_data, navigate]);

    let loaded_cnt = 0;
    let has_failure = false;

    for(let d of Object.values(data.last_update)) {
        if(d)
            loaded_cnt++;
    }

    for(let d of [
        data.shuttle_thisweek,
        data.shuttle_nextweek,
        data.reservation,
    ]) {
        if(d===SYMBOL_FAILED)
            has_failure = true;
    }

    let about_text = (
        has_failure ? '失败' :
        loaded_cnt===3 ? '关于' :
            `${loaded_cnt}/3…`
    );

    return (
        <>
            {route.view==='shuttle_table' &&
                (shuttle_table_data ? <ShuttleTable data={shuttle_table_data} navigate={navigate} /> : <Skeleton />)
            }
            {route.view==='reservation' &&
                (reservation_data ? <ReservationView data={reservation_data} navigate={navigate} /> : <Skeleton />)
            }
            {route.view==='about' &&
                <About />
            }
            {route.view==='qrcode' &&
                <QrcodePage route={route} navigate={navigate} />
            }

            {route.view!=='off' && <>
                <AlertBanner />
                <div className="eu-fullscreen-shadow" style={{zIndex: -1}} onClick={()=>navigate('off')} />
            </>}

            <div className="eu-router-panel">
                <div className="eu-width-container">
                    <div className="eu-pill">
                        <div className={'eu-pill-item' + sel_cls('shuttle_table')} onClick={()=>navigate('shuttle_table')}>
                            班车时刻
                        </div>
                        <div className={'eu-pill-item' + sel_cls('reservation')} onClick={()=>navigate('reservation')}>
                            预约记录
                        </div>
                        <div className={'eu-pill-item eu-pill-item-about' + sel_cls('about')} onClick={()=>navigate('about')}>
                            {about_text}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export function App() {
    return (
        <ConfigProvider>
            <DataProvider>
                <Router />
            </DataProvider>
        </ConfigProvider>
    )
}