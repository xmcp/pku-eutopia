import {useContext, useState} from 'react';

import {STATUS_MAGIC_NUMBER, STATUS_DESC, is_time_nearby_for_signin} from '../data/shuttle_parser';
import {reserve, revoke} from '../api/action';
import {ConfigCtx} from '../data/config_ctx';
import {DataCtx} from '../data/data_ctx';
import {hhmm_to_int} from '../utils';

import './ShuttleDetail.css';

export function ShuttleDetail({cell, close, navigate}) {
    let data = useContext(DataCtx);
    let {config} = useContext(ConfigCtx);
    let [loading, set_loading] = useState(false);

    function get_action(track) {
        function action_do_fn(verb, fn) {
            return async ()=>{
                set_loading(true);
                try {
                    await fn();
                    close();
                    data.reload_all(true);
                } catch(e) {
                    console.error(e);
                    window.alert(`${verb}失败，${e}`);
                }
                set_loading(false);
            }
        }

        function action_show_temp_qrcode() {
            navigate('qrcode', {type: 'temp', track_id: track.track_id, time_text: track.time_text});
        }

        let action_cmd = action_do_fn('预约', async ()=>{
            let res = await reserve(track.track_id, track.date, track.time_id);
            if(is_time_nearby_for_signin(hhmm_to_int(cell.time_str)))
                navigate('qrcode', {type: 'reservation', reservation: {
                    res_id: res.appointment_id,
                    revokable: true,
                    datetime: `${cell.date_str} ${cell.time_str}`,
                }});
        });
        let action_semantic = 'default';
        let action_text = '预约';

        if(track.picked) {
            if(track.picked.status==='finished') {
                action_cmd = action_show_temp_qrcode;
                action_semantic = 'disabled';
                action_text = '已签到';
            } else if(track.picked.status==='pending_revokable') {
                action_cmd = action_do_fn('撤销', ()=>revoke(track.picked.res_id));
                action_semantic = 'danger';
                action_text = '撤销';
            } else if(track.picked.status==='pending_signable' || track.picked.status==='pending') {
                action_cmd = () => navigate('qrcode', {type: 'reservation', reservation: track.picked});
                action_semantic = 'primary';
                action_text = '签到';
            } else if(track.picked.status==='finished_absent') {
                action_cmd = action_show_temp_qrcode;
                action_semantic = 'disabled';
                action_text = '已违约';
            } else if(track.picked.status==='revoked') {
                // do nothing, because revoked tracks can be reserved again
            }
        } else { // not revoked
            if(track.status_id!==STATUS_MAGIC_NUMBER.AVAILABLE) {
                action_cmd = action_show_temp_qrcode;
                action_semantic = 'disabled';
                action_text = STATUS_DESC[track.status_id];
            }
        }

        return [action_cmd, action_semantic, action_text];
    }

    return (<>
        <div className="eu-fullscreen-shadow" style={{zIndex: 51000}} onClick={()=>close()} />
        <div className="eu-shuttle-detail eu-drop-shadow">
            <h1 className="eu-title">{cell.title_long}</h1>
            {cell.tracks.map(track => {
                let [action_cmd, action_semantic, action_text] = get_action(track);
                if(loading)
                    action_semantic = 'disabled';

                return (
                    <div key={track.track_id} className="eu-shuttle-detail-row">
                        <div className="eu-shuttle-detail-name">
                            #{track.track_id}：
                            {track.track_name}
                        </div>
                        <div
                            className={'eu-shuttle-detail-action eu-shuttle-detail-action-'+action_semantic}
                            onClick={()=>{if(!loading) action_cmd();}}
                        >
                            <div className="eu-shuttle-detail-action-title">{action_text}{loading ? '中' : ''}</div>
                            <div className="eu-shuttle-detail-action-desc">
                                {config.showtext==='picked' ? <>已约 {track.capacity - track.left}</> : <>剩余 {track.left}</>}
                                {' / '}{track.capacity}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </>);
}