import { createElement } from 'preact';
import {useState, useEffect, useContext} from 'preact/hooks';
import * as hooks from 'preact/hooks';
import { generate } from 'lean-qr';
import { makeAsyncComponent } from 'lean-qr/extras/react';

import {get_res_qrcode, get_temp_qrcode} from '../api/get_qrcode';
import {with_retry} from '../data/common';
import {revoke} from '../api/action';
import {DataCtx} from '../data/data_ctx';

import './QrcodePage.css';
import hdr_trigger from './hdr_trigger.webm?inline';

const QR = makeAsyncComponent({ createElement, ...hooks }, generate);

function QrcodeWidget({load_fn, text_processing, navigate}) {
    let [status, set_status] = useState('loading');
    let [res, set_res] = useState(null);
    let data = useContext(DataCtx);

    async function load() {
        set_status('loading');
        let r = null;
        try {
            r = await load_fn();
        } catch(e) {
            set_res(''+e);
            set_status('error');
            return;
        }
        set_res(r);
        set_status('done');
    }

    useEffect(()=>{
        load();
    //eslint-disable-next-line
    }, []);

    if(status==='loading')
        return (
            <div className="eu-qrcode-widget-frame">
                <p>加载中……</p>
            </div>
        );

    if(status==='error')
        return (
            <div className="eu-qrcode-widget-frame">
                <p>{res}</p>
                <p>
                    <button onClick={load}>重新加载</button>
                </p>
            </div>
        )

    return (
        <div className="eu-qrcode-widget-frame">
            {text_processing(res)}
            <div className="eu-qrcode-img">
                <video src={hdr_trigger} className="eu-qrcode-hdr"></video>
                <QR content={res.code}/>
            </div>
            <p>
                <button onClick={()=>{
                    navigate('reservation');
                    data.reload_all();
                }}>关 闭</button>
            </p>
        </div>
    )
}

function QrcodeReservation({reservation, navigate}) {
    let data = useContext(DataCtx);
    let [loading, set_loading] = useState(false);

    return (
        <div className="eu-width-container eu-drop-shadow" style={{height: '100%'}}>
            <div className="eu-paper eu-paper-pku">
                <br />
                <h1 className="eu-title eu-title-pku">
                    预约签到
                    {!!reservation.revokable &&
                        <small>
                            {/* eslint-disable-next-line */}
                            <a onClick={async () => {
                                if(loading) return;

                                if(window.confirm('要撤销预约吗？')) {
                                    set_loading(true);
                                    try {
                                        await revoke(reservation.res_id);
                                        data.reload_all(true);
                                        navigate('shuttle_table');
                                    } catch(e) {
                                        console.error(e);
                                        window.alert(`撤销预约失败，${e}`);
                                    }
                                    set_loading(false);
                                }
                            }}>
                                &emsp;→ 撤销预约
                            </a>
                        </small>
                    }
                    {/*reservation.status==='pending_signable' &&
                        <small>
                            <a onClick={async () => {
                                if(loading) return;

                                if(window.confirm('将弹出旧版签到页面。此功能的唯一作用是将此行程标记为 “已签到” 而不是 “已违约”，之后将无法再展示二维码。')) {
                                    set_loading(true);
                                    try {
                                        await manual_signin(reservation.res_id);
                                        data.reload_all(true);
                                        navigate('shuttle_table');
                                    } catch(e) {
                                        console.error(e);
                                        window.alert(`手动签到失败，${e}`);
                                    }
                                    set_loading(false);
                                }
                            }}>
                                &emsp;→ 手动签到
                            </a>
                        </small>
                    */}
                </h1>

                <QrcodeWidget
                    load_fn={()=>with_retry(()=>get_res_qrcode(reservation))}
                    navigate={navigate}
                    text_processing={(d)=><p>
                        【{d.name}】<br />
                        预约时段：{reservation.datetime}
                    </p>}
                />
            </div>
        </div>
    );
}

function QrcodeTemp({track_id, time_text, navigate}) {
    function make_table(text, titles) {
        let lines = text.split('\n');
        return (
            <table className="eu-qrcode-table">
                <tbody>
                    {lines.map((l, idx)=><tr>
                        <td>{titles[idx] || ''}</td>
                        <td>{l}</td>
                    </tr>)}
                </tbody>
            </table>
        )
    }

    return (
        <div className="eu-width-container eu-drop-shadow" style={{height: '100%'}}>
            <div className="eu-paper eu-paper-pku">
                <br/>
                <h1 className="eu-title eu-title-pku">
                    临时登记码
                    <small>
                        &emsp;{time_text}，路线 #{track_id}
                    </small>
                </h1>

                <QrcodeWidget
                    load_fn={()=>with_retry(()=>get_temp_qrcode(track_id, time_text))}
                    navigate={navigate}
                    text_processing={(d)=>
                        make_table(d.name, ['姓名:', '工号:', '单位/学院:'])
                    }
                />
            </div>
        </div>
    )
}

export function QrcodePage({route, navigate}) {
    if(route.type==='reservation')
        return <QrcodeReservation reservation={route.reservation} navigate={navigate} />;
    else if(route.type==='temp')
        return <QrcodeTemp track_id={route.track_id} time_text={route.time_text} navigate={navigate} />;
    else
        return `?? QrcodePage ${route.type}`;
}