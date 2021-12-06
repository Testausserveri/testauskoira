**Tämä projekti sammuu lopullisesti 1.1.2022. Koodikantaa ei enää tueta eikä uusia ominaisuuksia oteta vastaan.**

Korvaavat projektit:
- Throwaway-sähköpostipalvelu: [koirameili](https://github.com/Testausserveri/koirameili)
- Yleishyödyllinen yhteisöbotti: [testauskoira-rs](https://github.com/Testausserveri/testauskoira-rs)
- Rajapinnat: [testausapis](https://github.com/Testausserveri/testausapis)

---

<p align="center">
<img src="https://i.imgur.com/dT8RLvv.png" height="150" alt="Testauskoira">
</p>

**Testauskoira** on yleisbotti, jota käytetään erilaisissa [Testausserverin](https://testausserveri.fi) kylmää konetta vaativissa tehtävissä Discordin puolella. Botin tarkoituksena on tukea palvelimen toimintaa.

Botin toimintaa ja sen tietoturvallisuutta voi tutkia tässä repositoriossa, johon on sen lähdekoodi julkaistuna kokonaisuudessaan läpinäkyvyyttä varten.

## Ominaisuudet ja tehtävät

### Sähköpostien ohjaaminen oikeille vastaanottajille Discord-yksityisviestinä
<p align="center">
<img src="https://i.imgur.com/zO9nhXV.png" height="300">
</p>

Testauskoira kuuntelee saapuneita määritetylle sähköpostiviestejä IMAP-palvelimelle, selvittää rekisteröidyn `@testausserveri.fi`-sähköpostiosoitteen vastaanottajan Discord-käyttäjän ID:n tietokannasta, ja välittää saapuneen sähköpostiviestin tälle yksityisviestitse Discordiin. Testauskoira [poistaa](https://github.com/ahnl/testauskoira/blob/master/src/mail/imap.js#L55) samantien saapuneen sähköpostiviestin. 

Ominaisuudesta voi lukea lisää [Testausserverin](https://testausserveri.fi) keskustelukanavalla.

### Sähköpostilaatikoiden manuaalinen rekisteröinti jäsenille

<p align="center">
<img src="https://i.imgur.com/OzsO2M7.png">
</p>

Testauskoira tarjoaa valtuutetuille käyttäjille hallintapaneelin, jossa voi rekisteröidä jäsenille sähköpostilaatikoita tietokantaan. Rekisteröinti myös lähettää käyttäjälle tervetuloa-viestin kampanjasta Discordissa yksityisviestitse.

Järjestelmää on suunniteltu kätevää operointia näppäimistöllä varten, jotta monien rivien käsitteleminen sujuisi nopeasti.

Käyttäjille luonnollisesti ohjeistetaan, että myönnetty sähköpostiosoite on esimerkiski uutiskirjeiden, roskapostin, turhien palveluiden kirjautumisten, jne. vastaanottamista varten, eikä sillä kuulu rekisteröityä sen kriittisempiin palveluihin.

Hallintapaneeli on toteutettu Reactilla, ja se löytyy [`control/`](https://github.com/ahnl/testauskoira/tree/master/control) kansion takaa.

### Viestistatistiikan kerääminen lukuina tietokantaan

Testauskoira tallentaa tietokantaan viestien määrä/päivä/käyttäjä-dataa. Dataa käytetään analytiikkaan, statistiikan esittämiseen julkisesti kokonaisuutena (viestejä koko palvelimella päivän aikana), tai tulevaisuudessa aktiivisten käyttäjien palkitsemiseen. Käyttäjien viestien sisältöjä ei tallenneta.

### Roolien myöntäminen jäsenille

Testausserverin tarpeiden mukaan Testauskoira toimii apulaisbottina, joka myöntää rooleja jäsenille erilaisten ehtojen täyttyessä. Esimerkiksi itsepalveluna pyytäessä tai jokaiselle jäsenelle palvelimelle liittyessä.

### Rajapinnat muiden Testausserverin palveluiden yhteentoimivuutta varten

Testauskoira avaa minimaalisia rajapintoja, joita voivat muut Testausserverin palvelut käyttää kommunikoidakseen Testauskoiran kanssa.

### GitHub-organisaatioon kutsuminen

Käyttäjät voivat kutsua itsensä Testausserverin GitHub-organisaatioon sisään itsepalveluna.
