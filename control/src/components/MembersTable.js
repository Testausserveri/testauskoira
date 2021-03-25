import { useCallback, useEffect } from 'react';
import {memberTableColumns, memberKeys, formatting} from '../configuration';
function MembersTable(props) {
    const handleKeyPress = useCallback(event => {
        const key = event.key; 
        
        if (key === 'ArrowUp' || key === 'ArrowDown') {
            let index = props.members.findIndex(member => member.id === props.memberData.id);
            console.log(props.members)
            if (key === 'ArrowUp') {
                index -= 1;
                if (index <= 0) index = 0;
            } else if (key === 'ArrowDown') {
                index += 1;
                if (index >= props.members.length - 1) index = props.members.length - 1;
            }
            console.log(index, props.members[index])
            if (props.members[index]) {
                props.setMemberData(props.members[index]);
            }
            setTimeout(()=>{document.querySelector('#memberEmailInput').focus();}, 5);
        }
    }, [props]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);

        return () => {
          window.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    const selectMember = (member) => {
        props.setMemberData(member)
        setTimeout(()=>{document.querySelector('#memberEmailInput').focus();}, 5);

    };

    return (
        <table className="membersTable">
            <thead>
                <tr>
                    {memberTableColumns.map((column) => {
                        return (
                            <th key={column}>{memberKeys[column] || column}</th>
                        )
                    })}
                </tr>
            </thead>
            <tbody>
                {props.data.map(member => {
                    return (
                        <tr key={member.id} className={[
                            (member.registered ? 'registeredMemberRow' : ''), 
                            (props.memberData.id === member.id ? 'selectedMemberRow': '')
                            ].join(' ')} onClick={() => {selectMember(member)}}>
                                {memberTableColumns.map((column) => {
                                    return (
                                        <td key={member.id + column}>
                                            {member[column] ? (formatting[column] ? formatting[column](member[column]) : member[column]) : '-'}
                                        </td>
                                    )
                                })}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

export default MembersTable;