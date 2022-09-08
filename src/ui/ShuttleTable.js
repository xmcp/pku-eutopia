import {DIR_KEYS_LIST, DIR_KEYS_DESC_SHORT} from '../data/shuttle_parser';
import {useState} from 'react';
import {ShuttleDetail} from './ShuttleDetail';

import './ShuttleTable.css';

function DateDescriptor({date_str}) {
    let date = new Date(date_str);

    let is_today = date.toDateString() === (new Date()).toDateString();
    let is_yesterday = date.toDateString() === (new Date((+new Date()) - 86400*1000)).toDateString();
    let weekday_desc = '周' + '日一二三四五六日'[date.getDay()];

    return (
        <div className="eu-table-datedesc">
            <b>{
                is_today ? '今天' :
                is_yesterday ? '昨天' :
                    weekday_desc
            }</b>{' '}
            <small>
                {date.getMonth()+1}-{date.getDate()}
            </small>
        </div>
    );
}

function CellDescriptor({celldesc, open_detail}) {
    if(celldesc===null)
        return null;

    let dirs = [];

    for(let dir of DIR_KEYS_LIST) {
        if(!Object.prototype.hasOwnProperty.call(celldesc, dir)) {
            dirs.push(<div key={dir} className="eu-pill-item eu-color-empty" />);
            continue;
        }

        let tracks = celldesc[dir];

        let picked = false;
        let available = false;
        let tot_left = 0;
        let passed = false;

        for(let track of tracks) {
            if(track.picked)
                picked = true;

            if(track.available)
                available = true;

            if(track.passed)
                passed = true;

            tot_left += track.left;
        }

        dirs.push(
            <div
                key={dir} onClick={()=>open_detail(tracks)}
                className={'eu-pill-item eu-color-'+(picked ? 'picked' : available ? 'available' : (!passed && tot_left===0) ? 'full' : 'disabled')}
            >
                <div className="eu-pill-itemtitle">{DIR_KEYS_DESC_SHORT[dir]}</div>
                <div className="eu-pill-itemdesc">{tot_left}</div>
            </div>
        );
    }

    return (
        <div className="eu-pill">
            {dirs}
        </div>
    )
}

export function ShuttleTable({data}) {
    let [detail, set_detail] = useState(null);

    if(data===null)
        return null;

    return (<>
        <div className="eu-width-container eu-drop-shadow" style={{height: '100%'}}>
            <div className="eu-table-scroller">
                <table className="eu-table">
                    <thead>
                        <tr>
                            <th className="eu-table-timecell" />
                            {data.date_keys.map(date=>
                                <th key={date} className="eu-table-pillcell">
                                    <DateDescriptor date_str={date} />
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="eu-table-padding">
                            <th className="eu-table-timecell" />
                            <td colSpan={2} className="eu-legend-row">
                                <span className="eu-legend-box eu-color-available" /> 可预约
                                <span className="eu-legend-box eu-color-picked" /> 已预约
                                <span className="eu-legend-box eu-color-full" /> 已约满
                                <span className="eu-legend-box eu-color-disabled" /> 已过期
                            </td>
                            <td></td> {/* <- last-child gets `padding-right: 1em` */}
                        </tr>
                        {data.time_keys.map(time=>
                            <tr key={time}>
                                <th className="eu-table-timecell">
                                    {time}
                                </th>

                                {data.date_keys.map(date=>
                                    <td key={date} className="eu-table-pillcell">
                                        <CellDescriptor celldesc={data.cells[`${date}/${time}`] || null} open_detail={set_detail} />
                                    </td>
                                )}
                            </tr>
                        )}
                        <tr className="eu-table-padding">
                            <th className="eu-table-timecell" />
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {detail!==null &&
            <ShuttleDetail cells={detail} close={()=>set_detail(null)} />
        }
    </>)
}