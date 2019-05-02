import React, {Component} from 'react';
import './League.css';

export default class League extends Component {
    constructor(props) {
        super(props);
        this.state = {
            weekNumber: 0,
        };

        this.teams = Object.keys(this.props.teams).map((key, index) => {
            return {
                name: key,
                pts: 0,
                p: 0,               // played
                w: 0,               // win
                d: 0,               // draw
                l: 0,               // lose
                gd: 0,              // goal difference
                cmpVal: 3,          // compare value, used for ordering the teams
                chmpFactor: 0,      // championship factor, used for calculating the probability of championship
                chmpPercentage: 0,  // probability of being the championship
                power: this.props.teams[key],  // the power of the team, used for determining the matchs' results
            }
        });
        this.teamsOrdered = [];
        this.fixture = [[0, 1, 2, 3], [0, 2, 1, 3], [0, 3, 1, 2], [3, 0, 2, 1], [2, 0, 3, 1], [1, 0, 3, 2]];
        this.timedID = 0;
    }

    /**
     * Orders the teams' standing by using
     * their 'cmpVal', compare value, based
     * on their points, if they have the
     * same points the method checks their
     * goal difference and insert the teams
     * into 'this.teamsOrdered' array.
     */
    orderTeams = () => {
        for (let i = 0; i < this.teams.length; i++) {
            for (let j = i + 1; j < this.teams.length; j++) {
                if (this.teams[i].pts > this.teams[j].pts || ((this.teams[i].pts === this.teams[j].pts) && this.teams[i].gd > this.teams[j].gd)) {
                    this.teams[i].cmpVal--;
                } else if (this.teams[i].pts < this.teams[j].pts || ((this.teams[i].pts === this.teams[j].pts) && this.teams[i].gd < this.teams[j].gd)) {
                    this.teams[j].cmpVal--;
                } else {
                    this.teams[i].cmpVal--;
                }
            }
        }

        this.teams.forEach(team => {
            this.teamsOrdered[team.cmpVal] = team;
            team.cmpVal = 3;
        });
    }

    /**  Simulates the matches every time
     *   weekNumber changes and calculates
     *   the goals of both home and away team
     *   by using Math.random() method, home team
     *   advantage factor,1.2, and the power of
     *   the teams, set the necessary statistics
     *   of teams like points, matches played, win,
     *   lose,draw, and goal difference.
     *   And finally puts the results
     *   into localStorage and changes the state
     *   of weekNumber to invoke render() method.
     */
    playMatches = () => {
        if (this.state.weekNumber < 6) {
            const teamIndexes = this.fixture[this.state.weekNumber];
            for (var i = 0; i < teamIndexes.length; i += 2) {
                const indexHomeTeam = teamIndexes[i];
                const indexAwayTeam = teamIndexes[i + 1];
                const homeTeam = this.teams[indexHomeTeam];
                const awayTeam = this.teams[indexAwayTeam];
                const homeTeamGoals = Math.round((Math.random() * 10 * 1.2 * homeTeam.power) / 4); // multiplying the goals of the home team by "1.2" and the team's power
                const awayTeamGoals = Math.round((Math.random() * 10 * awayTeam.power) / 4); // just multiplying by the team's power
                if (homeTeamGoals > awayTeamGoals) {
                    homeTeam.pts += 3;
                    homeTeam.p += 1;
                    homeTeam.w += 1;
                    homeTeam.gd += (homeTeamGoals - awayTeamGoals);

                    awayTeam.p += 1;
                    awayTeam.l += 1;
                    awayTeam.gd += (awayTeamGoals - homeTeamGoals);
                } else if (homeTeamGoals < awayTeamGoals) {
                    awayTeam.pts += 3;
                    awayTeam.p += 1;
                    awayTeam.w += 1;
                    awayTeam.gd += (awayTeamGoals - homeTeamGoals);

                    homeTeam.p += 1;
                    homeTeam.l += 1;
                    homeTeam.gd += (homeTeamGoals - awayTeamGoals);
                } else {
                    homeTeam.pts += 1;
                    homeTeam.p += 1;
                    homeTeam.d += 1;

                    awayTeam.pts += 1;
                    awayTeam.p += 1;
                    awayTeam.d += 1;
                }
                const indexResult = (this.state.weekNumber * 2) + (i / 2);
                localStorage.setItem(indexResult, (homeTeam.name + " " + homeTeamGoals + " - " + awayTeamGoals + " " + awayTeam.name)); // Match results inserted into the local storage
            }
            this.setState({weekNumber: this.state.weekNumber + 1});
            return true;
        } else {
            return false;
        }
    }

    /** Simulates all the matches each second
     *  and get invoked when "Play All" button
     * is clicked.
     */
    playAllMatches = () => {
        this.timedID = setInterval(() => {
            this.playMatches();
            if (this.state.weekNumber > 6) {
                clearInterval(this.timedID);
            }
        }, 1000);
        return true;
    }

    /**
     * Calculates the prediction of the teams'
     * championships by the difference between
     * the teams' point after 3 three weeks
     * and gives the percentage of the chance
     * of the teams being the championof the league.
     */
    calculate = () => {
        this.teamsOrdered[0].chmpFactor = 100;
        let totalChance = this.teamsOrdered[0].chmpFactor;
        if (this.state.weekNumber === 4 || this.state.weekNumber === 5) {
            let currentWeek = [];
            this.teamsOrdered.slice(1).map((team, index) => {
                const ptsDiff = this.teamsOrdered[0].pts - team.pts;
                if (ptsDiff - 1 < (this.fixture.length - this.state.weekNumber) * 3) {
                    if (ptsDiff === 0) {
                        team.chmpFactor = this.teamsOrdered[0].chmpFactor;
                    } else {
                        team.chmpFactor = this.teamsOrdered[0].chmpFactor / (ptsDiff + 1);
                    }
                } else {
                    team.chmpFactor = 0;
                }
                totalChance += team.chmpFactor;
                return true;
            });

            this.teamsOrdered.forEach(team => {
                if (team.chmpFactor) {
                    team.chmpPercentage = Math.round((team.chmpFactor / totalChance) * 100);
                    currentWeek.push(team.chmpPercentage);
                } else {
                    team.chmpPercentage = 0;
                    currentWeek.push(team.chmpPercentage);
                }
            });
        } else if (this.state.weekNumber === 6) {
            this.teamsOrdered.map((team, index) => {
                team.chmpPercentage = 0;
                return true;
            });
            this.teamsOrdered[0].chmpPercentage = 100;
        }
        return true;
    }

    render() {
        this.orderTeams();
        this.calculate();

        return (
            <div>
                <div id="firstDiv">
                    <table>
                        <thead>
                        <tr style={{backgroundColor: "white"}} id="homeTeamRow">
                            <th id="leagueTable" colSpan="7">League Table</th>
                            <th id="result">Match Results</th>
                        </tr>
                        </thead>
                        <thead>
                        <tr style={{backgroundColor: "white"}}>
                            <th id="teams">Teams</th>
                            <th>PTS</th>
                            <th>P</th>
                            <th>W</th>
                            <th>D</th>
                            <th>L</th>
                            <th>GD</th>
                            <th style={{
                                width: 300,
                                border: 0,
                                display: this.state.weekNumber === 0 ? "none" : "block"
                            }}>{this.state.weekNumber}th Week Match Results
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.teamsOrdered.map((team, index) => {
                            return <tr style={{backgroundColor: index % 2 === 1 ? "white" : "#f2f2f2"}} key={index}>
                                <td>{team.name}</td>
                                <td>{team.pts}</td>
                                <td>{team.p}</td>
                                <td>{team.w}</td>
                                <td>{team.d}</td>
                                <td>{team.l}</td>
                                <td>{team.gd}</td>
                                <td style={{
                                    width: 300,
                                    display: index < 2 ? "block" : "none"
                                }}>{localStorage.getItem(index + (this.state.weekNumber - 1) * 2)}</td>
                            </tr>
                        })}
                        </tbody>
                    </table>
                    <button id="playAll" onClick={this.playAllMatches}>Play All</button>
                    <button onClick={this.playMatches}>Next Week</button>
                </div>
                <div style={{float: "none"}}>
                    <table id="secondTable" style={{display: this.state.weekNumber > 3 ? "block" : "none"}}>
                        <thead>
                        <tr>
                            <th style={{backgroundColor: "white"}} id="prediction" colSpan="2">{this.state.weekNumber}th
                                Week Predictions of Championship
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.teamsOrdered.map((team, index) => {
                            return <tr style={{backgroundColor: index % 2 === 1 ? "white" : "#f2f2f2"}} key={index}>
                                <td>{team.name}</td>
                                <td>%{team.chmpPercentage}</td>
                            </tr>
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}