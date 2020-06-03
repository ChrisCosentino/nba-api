  
const express = require('express');
const puppeteer = require('puppeteer');


const router = express.Router();

// @Route   GET api/players
// @desc    Get list of all players
// @access  Public
router.get('/', (req, res) => {
    const baseUrl = 'https://www.basketball-reference.com/players/';

    (async () => {
        const browser = await puppeteer.launch({
            headless: false
        });

        try {
            const page = await browser.newPage();
            await page.goto(baseUrl, {
                waitUntil: 'domcontentloaded'
            })
            //const urls = await page.evaluate(() => Array.from(document.querySelectorAll('#div_alphabet li a[href]')));
            const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
            var playerArray = [];
            for(var i = 0; i < alphabet.length; i++){
                var alphabetUrl = `https://www.basketball-reference.com/players/${alphabet[i]}`;
                await page.goto(alphabetUrl, {
                    waitUntil: 'domcontentloaded'
                });

                var players = await page.evaluate(() => {
                    const names = Array.from(document.querySelectorAll('#players th[data-stat=player] a'));

                    
                    const yearMin = Array.from(document.querySelectorAll('#players td[data-stat=year_min]'));
                    const yearMax = Array.from(document.querySelectorAll('#players td[data-stat=year_max]'));
                    const pos = Array.from(document.querySelectorAll('#players td[data-stat=pos]'));
                    const height = Array.from(document.querySelectorAll('#players td[data-stat=height]'));
                    const weight = Array.from(document.querySelectorAll('#players td[data-stat=weight]'));
                    const birthDate = Array.from(document.querySelectorAll('#players td[data-stat=birth_date]'));
                    const colleges = Array.from(document.querySelectorAll('#players td[data-stat=colleges]'));

                    var playerArray = [];
                    for(var i = 0; i < names.length; i++){
                        playerArray[i] = {
                            name: names[i].innerText.trim(),
                            yearMin: yearMin[i].innerText.trim(),
                            yearMax: yearMax[i].innerText.trim(),
                            position: pos[i].innerText.trim(),
                            height: height[i].innerText.trim(),
                            weight: weight[i].innerText.trim(),
                            birthDate: birthDate[i].innerText.trim(),
                            colleges: colleges[i].innerText.trim()
                        }
                    }

                    return playerArray;
                })
                playerArray.push(players);
            }
            browser.close();
            res.json(playerArray);
        } catch (err) {
            res.send(err.message);
            console.error(err.message);
        }
    })()
});

// @Route   GET api/players
// @desc    Get list of all players
// @access  Public
router.get('/:player', (req, res) => {
    const queryUrl = `https://www.basketball-reference.com/search/search.fcgi?search=${req.params.player}`;

    (async () => {
        const browser = await puppeteer.launch({
            headless: false
        });

        try {
            const page = await browser.newPage();
            await page.goto(queryUrl, {
                waitUntil: 'domcontentloaded'
            });

            if(await page.$('.search-results')){ //PLayer list found 

                const urls = await page.evaluate(() => {
                    const u = Array.from(document.querySelectorAll('#players .search-item-url'));

                    var urlArray = [];
                    for(var i = 0; i < u.length; i++){
                        urlArray.push(u[i].innerText.trim())
                    }
                    return urlArray;
                })

                var playerStats = [];
                for(var i = 0; i < urls.length; i++){
                    var urlStr = `https://www.basketball-reference.com${urls[i]}`;
                    await page.goto(urlStr, {
                        waitUntil: 'domcontentloaded'
                    })
                    
                    var players = await page.evaluate(() => {
                        const season = Array.from(document.querySelectorAll('#per_game th[data-stat=season] a'));

                        var statsArray = [];
                        for(var j = 0; j < season.length; i++){
                            statsArray[j] = {
                                season: season[j].innerText.trim()
                            }
                        }
                        return statsArray;
                    })


                    playerStats.push(players)
                }
                
                res.json(playerStats)
            }else{ //Invidual player found
                
            }

            await browser.close();
        } catch (err) {
            res.send(err.message);
            console.error(err.message);
        }
    })()
})

module.exports = router;