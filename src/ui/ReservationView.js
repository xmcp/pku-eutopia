import {useContext, useState} from 'react';

import {DataCtx} from '../data/data_ctx';
import {revoke} from '../api/action';

import './ReservationView.css';

function ReservationItem({r, navigate}) {
    let data = useContext(DataCtx);
    let [loading, set_loading] = useState(false);

    let action_cmd = null;
    let action_semantic = 'disabled';
    let action_text = '已预约';

    if(r.status==='revoked') {
        action_text = '已撤销';
    } else if(r.status==='finished') {
        action_text = '已签到';
    } else if(r.status==='pending_revokable') {
        action_cmd = async () => {
            if(window.confirm(`要撤销【${r.datetime}】的预约吗？`)) {
                set_loading(true);
                try {
                    await revoke(r.res_id);
                    data.reload_all(true);
                } catch(e) {
                    console.error(e);
                    window.alert(`撤销失败，${e}`);
                }
                set_loading(false);
            }
        };
        action_semantic = 'danger';
        action_text = '撤销';
    } else if(r.status==='pending_signable' || r.status==='pending') {
        action_cmd = ()=>navigate('qrcode', {type: 'reservation', reservation: r});
        action_semantic = 'primary';
        action_text = '签到';
    } else if(r.status==='finished_absent') {
        action_text = '已违约';
    }

    return (
        <div className={'eu-resitem eu-resitem-'+action_semantic} onClick={()=>{if(!loading && action_cmd) action_cmd();}}>
            <div className="eu-resitem-desc">
                <div style={{fontSize: '1.1em', fontWeight: 'bold'}}>{r.datetime}</div>
                <div>#{r.track_id}：{r.track_name}</div>
            </div>
            <div className="eu-resitem-action">
                {action_text}{loading ? '中' : ''}
            </div>
        </div>
    );
}

export function ReservationView({data, navigate}) {
    return (
        <div className="eu-width-container eu-drop-shadow" style={{height: '100%'}}>
            <div className="eu-paper">
                {data.pending.length>0 && <>
                    <br />
                    <h1 className="eu-title">
                        进行中{' '}
                        <small>({data.pending.length})</small>
                    </h1>
                </>}
                {data.pending.map(r =>
                    <ReservationItem key={r.appointment_id} r={r} navigate={navigate} />
                )}

                {data.done.length>0 && <>
                    <br />
                    <h1 className="eu-title">
                        已完成{' '}
                        <small>({data.done.length})</small>
                    </h1>
                </>}
                {data.done.map(r =>
                    <ReservationItem key={r.appointment_id} r={r} navigate={navigate} />
                )}
            </div>
        </div>
    )
}