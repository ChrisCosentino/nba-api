const express = require('express');
const puppeteer = require('puppeteer');



const router = express.Router();

const nbaBaseUrl = 'https://www.basketball-reference.com/';


// @Route   GET api/teams/alltime/standings
// @desc    Get all time team standings 
// @access  Public
router.get('/standings/alltime', (req, res) => {

    (async () => {
        const browser = await puppeteer.launch({
            headless: true
        });
        try{
            const page = await browser.newPage();
            await page.goto(nbaBaseUrl, {
                waitUntil: 'domcontentloaded'
            })

            await page.click('#teams > h2 > a');

            //wait for the teams to show before proceeding
            await page.waitForSelector('#teams_active', {
                visible: true
            })

            var teams = await page.evaluate(() => {
            
                let teamRows = Array.from(document.querySelectorAll('#teams_active tr.full_table'));
                let teamName = Array.from(document.querySelectorAll('#teams_active .full_table th a'));
                let minYears = Array.from(document.querySelectorAll('#teams_active .full_table td[data-stat=year_min]'));
                let maxYears = Array.from(document.querySelectorAll('#teams_active .full_table td[data-stat=year_max]'));
                let teamYears = Array.from(document.querySelectorAll('#teams_active .full_table td[data-stat=years]'));
                let games = Array.from(document.querySelectorAll('#teams_active .full_table td[data-stat=g]'));
                let wins = Array.from(document.querySelectorAll('#teams_active .full_table td[data-stat=wins]'));
                let losses = Array.from(document.querySelectorAll('#teams_active .full_table td[data-stat=losses]'));
                let win_loss_pct = Array.from(document.querySelectorAll('#teams_active .full_table td[data-stat=win_loss_pct]'));
                let years_playoffs = Array.from(document.querySelectorAll('#teams_active .full_table td[data-stat=years_playoffs]'));
                let years_div_champ = Array.from(document.querySelectorAll('#teams_active .full_table td[data-stat=years_division_champion]'));
                let years_conf_champ = Array.from(document.querySelectorAll('#teams_active .full_table td[data-stat=years_conference_champion]'));
                let years_league_champ = Array.from(document.querySelectorAll('#teams_active .full_table td[data-stat=years_league_champion]'));
                
                var teamArray = [];
                for(var i = 0; i < teamRows.length; i++){
                    teamArray[i] = {
                        name: teamName[i].innerText,
                        minYear: minYears[i].innerText,
                        maxYear: maxYears[i].innerText,
                        years: teamYears[i].innerText,
                        games: games[i].innerText,
                        wins: wins[i].innerText,
                        losses: losses[i].innerText,
                        win_loss_pct: win_loss_pct[i].innerText,
                        years_playoffs: years_playoffs[i].innerText,
                        years_div_champ: years_div_champ[i].innerText,
                        years_conf_champ: years_conf_champ[i].innerText,
                        years_league_champ: years_league_champ[i].innerText
                    }
                }
                return teamArray;
            })
            await browser.close();
            res.json(teams)

            console.log('teams: ', teams)
        }catch(err){
            res.send(err.message);
            console.error(err.message);
        }
    })();
});

// @Route   GET api/teams/standings/conference/:year
// @desc    Get stats from 2019 season
// @param   year - must be greater than 2016 and equal to current year
// @access  Public
router.get('/standings/conf/:year', (req, res) => {
    const standingsUrl = `${nbaBaseUrl}leagues/NBA_${req.params.year}.html`;

    (async () => {
        const browser = await puppeteer.launch({
            headless: true
        });

        try {
            const page = await browser.newPage();
            await page.goto(standingsUrl, {
                waitUntil: 'domcontentloaded'
            })
            
            //wait for the teams to show before proceeding
            await page.waitForSelector('#confs_standings_E', {
                visible: true
            });

            var eastTeams = await page.evaluate(() => {

                let teamNames = Array.from(document.querySelectorAll('#confs_standings_E .full_table th[data-stat=team_name] a'));
                let teamRankings = Array.from(document.querySelectorAll('#confs_standings_E .full_table th[data-stat=team_name] span'));

                let teamWins = Array.from(document.querySelectorAll('#confs_standings_E .full_table td[data-stat=wins]'));
                let teamLosses = Array.from(document.querySelectorAll('#confs_standings_E .full_table td[data-stat=losses]'));
                let win_loss_pct = Array.from(document.querySelectorAll('#confs_standings_E .full_table td[data-stat=win_loss_pct]'));
                let gb = Array.from(document.querySelectorAll('#confs_standings_E .full_table td[data-stat=gb]'));
                let ppg = Array.from(document.querySelectorAll('#confs_standings_E .full_table td[data-stat=pts_per_g]'));
                let oppg = Array.from(document.querySelectorAll('#confs_standings_E .full_table td[data-stat=opp_pts_per_g]'));
            
                let eastArray = [];
                for(var i = 0; i < teamNames.length; i++){
                    const rankString = teamRankings[i].innerText.trim();
                    console.log(rankString)
                    eastArray[i] = {
                        name: teamNames[i].innerText.trim(),
                        rank: i + 1,
                        wins: Number(teamWins[i].innerText.trim()),
                        losses: Number(teamLosses[i].innerText.trim()),
                        win_loss_pct: parseFloat(win_loss_pct[i].innerText.trim()),
                        gb: parseFloat(gb[i].innerText.trim()),
                        ppg: parseFloat(ppg[i].innerText.trim()),
                        oppg: parseFloat(oppg[i].innerText.trim()),
                    }
                }

                return eastArray;
            })

            var westTeams = await page.evaluate(() => {

                let teamNames = Array.from(document.querySelectorAll('#confs_standings_W .full_table th[data-stat=team_name] a'));
                let teamRankings = Array.from(document.querySelectorAll('#confs_standings_W .full_table th[data-stat=team_name] span'));

                let teamWins = Array.from(document.querySelectorAll('#confs_standings_W .full_table td[data-stat=wins]'));
                let teamLosses = Array.from(document.querySelectorAll('#confs_standings_W .full_table td[data-stat=losses]'));
                let win_loss_pct = Array.from(document.querySelectorAll('#confs_standings_W .full_table td[data-stat=win_loss_pct]'));
                let gb = Array.from(document.querySelectorAll('#confs_standings_W .full_table td[data-stat=gb]'));
                let ppg = Array.from(document.querySelectorAll('#confs_standings_W .full_table td[data-stat=pts_per_g]'));
                let oppg = Array.from(document.querySelectorAll('#confs_standings_W .full_table td[data-stat=opp_pts_per_g]'));
            
                let westArray = [];
                for(var i = 0; i < teamNames.length; i++){
                    const rankString = teamRankings[i].innerText.trim();
                    console.log(rankString)
                    westArray[i] = {
                        name: teamNames[i].innerText.trim(),
                        rank: i + 1,
                        wins: Number(teamWins[i].innerText.trim()),
                        losses: Number(teamLosses[i].innerText.trim()),
                        win_loss_pct: parseFloat(win_loss_pct[i].innerText.trim()),
                        gb: parseFloat(gb[i].innerText.trim()),
                        ppg: parseFloat(ppg[i].innerText.trim()),
                        oppg: parseFloat(oppg[i].innerText.trim()),
                    }
                }

                return westArray;
            })

            const conferenceStandings = {
                eastern_conf: eastTeams,
                western_conf: westTeams
            }
            await browser.close();
            res.json(conferenceStandings);
        } catch (err) {
            res.send(err.message);
            console.error(err.message);
        }
    })();
})

// @Route   GET api/teams/stats/:year
// @desc    Get stats from different seasons
// @param   year - must be greater than 2016 and equal to current year
// @access  Public
router.get('/stats/:year', (req, res) => {
    const statsUrl = `${nbaBaseUrl}leagues/NBA_${req.params.year}.html`;

    (async () => {
        const browser = await puppeteer.launch({
            headless: true
        });

        try {
            const page = await browser.newPage();
            await page.goto(statsUrl, {
                waitUntil: 'domcontentloaded'
            })
            
            //wait for the teams to show before proceeding
            await page.waitForSelector('#team-stats-per_game', {
                visible: true
            });

            var teams = await page.evaluate(() => {
                let teamNames = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=team_name'));
                let teamRanks = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=ranker'));
                let games = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=g'));
                let mp = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=mp'));

                let fg = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=fg'));
                let fga = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=fga'));
                let fg_pct = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=fg_pct'));

                let fg3 = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=fg3'));
                let fg3a = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=fg3a'));
                let fg3_pct = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=fg3_pct'));

                let fg2 = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=fg2'));
                let fg2a = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=fg2a'));
                let fg2_pct = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=fg2_pct'));

                let ft = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=ft'));
                let fta = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=fta'));
                let ft_pct = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=ft_pct'));

                let orb = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=orb'));
                let drb = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=drb'));
                let trb = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=trb'));

                let ast = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=ast'));
                let stl = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=stl'));
                let blk = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=blk'));
                let tov = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=tov'));
                let pf = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=pf'));
                let pts = Array.from(document.querySelectorAll('#team-stats-per_game td[data-stat=pts'));


                let teamArray = [];
                for(var i = 0; i < teamNames.length-1; i++){
                    teamArray[i] = {
                        name: teamNames[i].innerText.trim(),
                        // rank: Number(teamRanks[i].innerText.trim()),
                        rank: i + 1,
                        g: Number(games[i].innerText.trim()),
                        mp: parseFloat(mp[i].innerText.trim()),
                        fg: parseFloat(fg[i].innerText.trim()),
                        fga: parseFloat(fga[i].innerText.trim()),
                        fg_pct: parseFloat(fg_pct[i].innerText.trim()),
                        fg3: parseFloat(fg3[i].innerText.trim()),
                        fg3a: parseFloat(fg3a[i].innerText.trim()),
                        fg3_pct: parseFloat(fg3_pct[i].innerText.trim()),
                        fg2: parseFloat(fg2[i].innerText.trim()),
                        fg2a: parseFloat(fg2a[i].innerText.trim()),
                        fg2_pct: parseFloat(fg2_pct[i].innerText.trim()),
                        ft: parseFloat(ft[i].innerText.trim()),
                        fta: parseFloat(fta[i].innerText.trim()),
                        ft_pct: parseFloat(ft_pct[i].innerText.trim()),
                        orb: parseFloat(orb[i].innerText.trim()),
                        drb: parseFloat(drb[i].innerText.trim()),
                        trb: parseFloat(trb[i].innerText.trim()),
                        ast: parseFloat(ast[i].innerText.trim()),
                        blk: parseFloat(blk[i].innerText.trim()),
                        stl: parseFloat(stl[i].innerText.trim()),
                        tov: parseFloat(tov[i].innerText.trim()),
                        pf: parseFloat(pf[i].innerText.trim()),
                        pts: parseFloat(pts[i].innerText.trim()),
                    }
                }
                return teamArray;
            })

            res.json(teams);
        } catch (err) {
            console.log(err.message);
            res.send(err.message);
        }
    })();

})




module.exports = router;