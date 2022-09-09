import {useState, useContext} from 'react';

import {revoke, signin} from '../api/action';
import {DataCtx} from '../data/data_ctx';

import './ReservationView.css';

function ReservationItem({r}) {
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
        action_cmd = async () => await revoke(r.res_id);
        action_semantic = 'danger';
        action_text = '撤销';
    } else if(r.status==='finished_absent') {
        action_text = '已违约';
    } else if(r.status==='pending_signable') {
        action_cmd = async () => await signin(r.track_id);
        action_semantic = 'primary';
        action_text = '签到';
    }

    function wrapped(action, target, fn, need_confirm) {
        return async ()=>{
            if(loading)
                return;
            if(fn===null)
                return;

            if(!need_confirm || window.confirm(`要【${action}】${target} 的班车吗？`)) {
                set_loading(true);
                try {
                    await fn();
                    data.reload_all();
                } catch(e) {
                    console.error(e);
                    window.alert(`${action}失败，${e}`);
                }
                set_loading(false);
            }
        };
    }

    return (
        <div className={'eu-resitem eu-resitem-'+action_semantic} onClick={wrapped(action_text, r.datetime, action_cmd, action_semantic==='danger')}>
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

export function ReservationView({data}) {
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
                    <ReservationItem key={r.res_id} r={r} />
                )}

                {data.done.length>0 && <>
                    <br />
                    <h1 className="eu-title">
                        已完成{' '}
                        <small>({data.done.length})</small>
                    </h1>
                </>}
                {data.done.map(r =>
                    <ReservationItem key={r.res_id} r={r} />
                )}
            </div>
        </div>
    )
}