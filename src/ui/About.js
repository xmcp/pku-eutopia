import {SYMBOL_FAILED, DataCtx} from '../data/data_ctx';
import {useContext} from 'react';
import {ConfigCtx} from '../data/config_ctx';

function LastUpdate({d}) {
    if(d===null)
        return '---';

    return `${d.getHours()}:${(''+d.getMinutes()).padStart(2, '0')}:${(''+d.getSeconds()).padStart(2, '0')}`;
}

const MOTD = {
    index: null,
    list: [
        '露一手给你们看看',
        'Hey. It\'s me!',
        'Your heart 連れてくよ Higher',
        'Come on! It\'s show time!',
        '我就是那么完美 Ah!',
        'もっとAddictedに Intoxicatedに',
        'もっとMajesticに Enthusiasticに',
        'Top of the top!',
        'Top of the world!',
        'Top of the top!',
        '这地球就是绕着我转',
        '我来吸引这世界',
        '怎样，不错吧 Huh?',
    ]
}

function Preference() {
    let {config, update_config} = useContext(ConfigCtx);

    return (<>
        <p><b>
            我常住在{' '}
            <select value={config.location} onInput={(e)=>update_config({
                ...config,
                location: e.target.value,
            })}>
                <option value="yy">燕园</option>
                <option value="cp">昌平</option>
            </select>
            {' '}校区
        </b></p>
        <p>
            班车方向将显示为
            “<b>{config.location==='yy' ? '回' : '去'}</b>燕园”
            和
            “<b>{config.location==='yy' ? '去' : '回'}</b>昌平”
        </p>
    </>);
}

export function About() {
    let data = useContext(DataCtx);

    if(MOTD.index===null)
        MOTD.index = Math.floor(Math.random()*MOTD.list.length);

    return (
        <div className="eu-width-container eu-drop-shadow" style={{height: '100%'}}>
            <div className="eu-paper">
                <br />

                <h1 className="eu-title">Project Eutopia by @xmcp</h1>
                <p>「{MOTD.list[MOTD.index]}」——《Eutopia》</p>
                <br />

                <h1 className="eu-title">偏好设置</h1>
                <Preference />

                <h1 className="eu-title">数据状态</h1>
                {!!(window.EUTOPIA_USE_MOCK && process.env.NODE_ENV!=='production') &&
                    <p><b>USING MOCK DATA.</b></p>
                }
                <p>
                    预约历史：
                    {data.reservation===SYMBOL_FAILED ? '加载失败' : data.reservation===null ? '加载中' : '已加载'}
                    ，最后更新于 <LastUpdate d={data.last_update['reservation'] || null} />
                </p>
                <p>
                    本周班车：
                    {data.shuttle_thisweek===SYMBOL_FAILED ? '加载失败' : data.shuttle_thisweek===null ? '加载中' : '已加载'}
                    ，最后更新于 <LastUpdate d={data.last_update['shuttle_thisweek'] || null} />
                </p>
                <p>
                    下周班车：
                    {data.shuttle_nextweek===SYMBOL_FAILED ? '加载失败' : data.shuttle_nextweek===null ? '加载中' : '已加载'}
                    ，最后更新于 <LastUpdate d={data.last_update['shuttle_nextweek'] || null} />
                </p>
                <p>
                    <button style={{minWidth: '8em', fontSize: '1.25em'}} onClick={data.reload_all} disabled={data.loading}>
                        {data.loading ? '正在加载' : '更新数据'}
                    </button>
                </p>
                <br />

                <p>Build {process.env.REACT_APP_BUILD_INFO||'---'}</p>
                <br />
            </div>
        </div>
    );
}