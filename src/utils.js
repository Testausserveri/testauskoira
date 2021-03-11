/**
 * Turns message string into beautiful HTML page
 * @param {String} message 
 * @returns {String} HTML code
 */
const prettyHtml = (message) => {
    return `
<style>body {background: #121212;} h1{font-family: 'Roboto', 'Noto Sans', sans-serif; color: #bbb; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);font-weight: normal;}b{color:dodgerblue;}</style><meta charset="utf8">
<h1>${message}</h1>`;
};

/**
 * Pretty-print address object into string
 * @param {Object} addr Address object
 * @returns {String} Address string
 */
const formatAddress = (addr) => {
    let out = '';
    /*
    Address object looks like this:
        {
            value: [
                {
                    name: 'Sam',
                    address: 'sam@sam.com'
                },
                {
                    name: 'Matt',
                    address: 'matt@matt.com'
                }
            ]
        }

    This function will turn it into:
        Sam <sam@sam.com>; Matt <matt@matt.com>;
    */
    addr.value.forEach(contact => {
        out += `${(contact.name ? contact.name + ' ' : '')}<${contact.address}>; `
    });
    return out.trim();
}

const createBlockLink = ({from, mailbox}) => {
    return `https://koira.testausserveri.fi/posti/${mailbox.key}/block?from=${encodeURIComponent(from.value[0].address)}` + (mailbox.sub ? `&sub=${encodeURIComponent(mailbox.sub)}` : '');
};

const chunkString = (string, size, multiline = true) => {
    let matchAllToken = (multiline == true) ? '[^]' : '.';
    let re = new RegExp(matchAllToken + '{1,' + size + '}', 'g');
    return string.match(re);
};

module.exports = { prettyHtml, formatAddress, createBlockLink, chunkString};