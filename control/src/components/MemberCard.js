import { memberKeys, formatting } from '../configuration';

function MemberCard(props) {
    return (
        <table>
            <tbody>
                {Object.keys(props.memberData).map(memberDataKey => {
                    return (
                        <tr key={memberDataKey} className="memberCard">
                            <td>{memberKeys[memberDataKey] || memberDataKey}</td>
                            <td>{formatting[memberDataKey] ? formatting[memberDataKey](props.memberData[memberDataKey]) : props.memberData[memberDataKey]}</td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

export default MemberCard;