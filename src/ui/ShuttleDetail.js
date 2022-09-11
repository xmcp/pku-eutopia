import {useState, useContext} from 'react';

import {DescribeDirectionLong} from '../data/shuttle_parser';
import {reserve, revoke, signin} from '../api/action';
import {DataCtx} from '../data/data_ctx';
import {ConfigCtx} from '../data/config_ctx';

import './ShuttleDetail.css';

function TitleFormatter({cell}) {
    return (<>
        {cell.date} {cell.time} <DescribeDirectionLong dir={cell.direction} />
    </>);
}

export function ShuttleDetail({cells, close}) {
    let data = useContext(DataCtx);
    let {config} = useContext(ConfigCtx);
    let [loading, set_loading] = useState(false);

    if(cells.length===0)
        return null;

    let title = <TitleFormatter cell={cells[0]} />;

    function get_action(cell) {
        let action_cmd = async () => await reserve(cell.track_id, cell.date, cell.time_id);
        let action_semantic = 'primary';
        let action_text = '预约';

        if(cell.picked) {
            if(cell.picked.status==='finished') {
                action_cmd = null;
                action_semantic = 'disabled';
                action_text = '已签到';
            } else if(cell.picked.status==='pending_revokable') {
                action_cmd = async () => await revoke(cell.picked.id);
                action_semantic = 'danger';
                action_text = '撤销';
            } else if(cell.picked.status==='finished_absent') {
                action_cmd = null;
                action_semantic = 'disabled';
                action_text = '已违约';
            } else if(cell.picked.status==='pending_signable') {
                action_cmd = async () => await signin(cell.track_id);
                action_semantic = 'primary';
                action_text = '签到';
            } else if(cell.picked.status==='pending' || cell.picked.status==='pending_unkown') {
                action_cmd = null;
                action_semantic = 'disabled';
                action_text = '已预约';
            } else if(cell.picked.status==='revoked') {
                // do nothing, because revoked tracks can be reserved again
            }
        } else { // not revoked
            if(!cell.available) {
                action_cmd = null;
                action_semantic = 'disabled';
                action_text = cell.why_unavailable;
            }
        }

        return [action_cmd, action_semantic, action_text];
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
                    close();
                    data.reload_all(true);
                } catch(e) {
                    console.error(e);
                    window.alert(`${action}失败，${e}`);
                }
                set_loading(false);
            }
        };
    }

    return (<>
        <div className="eu-fullscreen-shadow" style={{zIndex: 51000}} onClick={()=>close()} />
        <div className="eu-shuttle-detail eu-drop-shadow">
            <h1 className="eu-title">{title}</h1>
            {cells.map(cell => {
                let [action_cmd, action_semantic, action_text] = get_action(cell);
                if(loading)
                    action_semantic = 'disabled';

                return (
                    <div key={cell.track_id} className="eu-shuttle-detail-row">
                        <div className="eu-shuttle-detail-name">
                            #{cell.track_id}：
                            {cell.track_name}
                        </div>
                        <div
                            className={'eu-shuttle-detail-action eu-shuttle-detail-action-'+action_semantic}
                            onClick={wrapped(action_text, cell.track_name, action_cmd, action_semantic==='danger')}
                        >
                            <div className="eu-shuttle-detail-action-title">{action_text}</div>
                            <div className="eu-shuttle-detail-action-desc">
                                {config.showtext==='picked' ? <>已约 {cell.capacity - cell.left}</> : <>剩余 {cell.left}</>}
                                {' / '}{cell.capacity}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </>);
}