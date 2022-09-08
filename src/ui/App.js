import {useContext, useMemo, useState, useEffect} from 'react';

import {DataProvider, DataCtx, SYMBOL_FAILED} from '../data/ctx';
import {parse_shuttle} from '../data/shuttle_parser';
import {ShuttleTable} from './ShuttleTable';
import {ReservationView} from './ReservationView';
import {About} from './About';

import './App.css';
import {parse_reservation} from '../data/reservation_parser';

function with_fallback(d) {
    return d===null || d===SYMBOL_FAILED ? [] : d;
}

function Router() {
    let data = useContext(DataCtx);

    let [route, set_route] = useState('off');

    let shuttle_table_data = useMemo(()=>
        with_fallback(data.shuttle_thisweek).length>0 ?
            parse_shuttle(
                data.shuttle_thisweek.concat(with_fallback(data.shuttle_nextweek)),
                with_fallback(data.reservation),
            ) :
            null
    , [data.shuttle_thisweek, data.shuttle_nextweek, data.reservation]);

    let reservation_data = useMemo(()=>
        with_fallback(data.reservation).length>0 && with_fallback(data.shuttle_thisweek).length>0 ?
            parse_reservation(data.shuttle_thisweek, data.reservation) :
            null
    , [data.shuttle_thisweek, data.reservation]);

    function navigate(target) {
        set_route(r => r===target ? 'off' : target);
    }

    function sel_cls(target) {
        return route===target ? ' eu-pill-item-selected' : '';
    }

    useEffect(()=>{
        if(route!=='off') {
            window.EUTOPIA_RENDER_ROOT.classList.add('eu-open');
            return ()=>{
                window.EUTOPIA_RENDER_ROOT.classList.remove('eu-open');
            }
        }
    }, [route]);

    return (
        <>
            {route==='shuttle_table' &&
                <ShuttleTable data={shuttle_table_data} />
            }
            {route==='reservation' &&
                <ReservationView data={reservation_data} />
            }
            {route==='about' &&
                <About />
            }

            {route!=='off' &&
                <div className="eu-fullscreen-shadow" style={{zIndex: -1}} onClick={()=>set_route('off')} />
            }

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
                            关于
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export function App() {
    return (
        <DataProvider>
            <Router />
        </DataProvider>
    )
}