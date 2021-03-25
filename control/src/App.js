import { useEffect, useState } from 'react';
import './styles/App.css';
import MailboxCard from './components/MailboxCard';
import MemberCard from './components/MemberCard';
import MembersTable from './components/MembersTable';
import { apiServer } from './configuration';

function App() {
    const [members, setMembers] = useState([]);
    const [memberData, setMemberData] = useState({});
    useEffect(() => {
        console.log('Fetching data...');
        fetch(apiServer + '/api/users')
        .then(res => res.json())
        .then(data => {
            console.log('Member keys available', Object.keys(data[0]))
            setMembers(data);
            setMemberData(data[0]);
        })
    }, []);

    return (
        <div className="app">
            <div className="membersList">
                <MembersTable data={members} setMemberData={setMemberData} memberData={memberData} members={members} />
            </div>
            <div className="controlView">
                <div className="fixed">
                    <h1>Jäsenkortti</h1>
                    <MemberCard memberData={memberData} />
                    <h2>Postilaatikko</h2>
                    <MailboxCard setMembers={setMembers} members={members} setMemberData={setMemberData} memberData={memberData} />
                </div>
            </div>
        </div>
    );
}
export default App;
