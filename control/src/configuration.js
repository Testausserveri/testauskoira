export const apiServer = '';

export const memberKeys = {
    "id": "ID",
    "username": "Käyttäjänimi",
    "registered": "Postilaatikko",
    "joinedTimestamp": "Liittynyt",
    "createdAt": "Luotu"
};
export const memberTableColumns = [
    "id",
    "createdAt",
    "joinedTimestamp",
    "username",
    "registered"
];

function formatDate(str) {
    const date = new Date(str);
    return `${(date.getDate()).toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
}
export const formatting = {
    "createdAt": formatDate,
    "joinedTimestamp": formatDate
}