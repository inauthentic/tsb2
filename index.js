const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request-promise');
const config = require('./config.json');
const chalk = require('chalk');
const setTerminalTitle = require('set-terminal-title');
require('console-stamp')(console, { pattern: 'HH:MM:ss.l' });
const faker = require('faker');

const proxies = [];
fs.readFileSync(__dirname + '/proxy.txt', 'utf-8')
        .split(/\r?\n/)
        .forEach((line) => proxies.push(line));
console.log(chalk.green(" [+] Welcome to the Travis Raffle Bot."));
console.log(chalk.green(" [+] By: Inauthentic. Just give the repo a star."));

var entered = 0;
var failed = 0;
var errUnd = 0;

function genPhone() {
    var pNumber = '';
    var characters = "1234567890";
    var charLength = characters.length;

    for (var i = 0; i < 10; i++) {
        pNumber += characters.charAt(Math.floor(Math.random() * charLength)); 
    }
    return pNumber;
}
class Task {
    constructor(props) {
        this.id = props.id;
        this.firstName = faker.name.firstName();
        this.lastName = faker.name.lastName();
        this.pNumber = genPhone();

        if (!proxies.length) {
			console.error(`(ID ${this.id}) Out of Proxies!`);
			process.exit(1);
		}

        this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
		this.proxy = this.formatProxy(this.rawProxy);

        this.enterRaffle()
    }
    sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	}
	formatProxy(proxy) {
		if (!proxy || proxy.replace(/\s/g, '') == '') return null;
		let proxySplit = proxy.split(':');

		if (proxySplit.length > 2) {
			return (
				'http://' +
				proxySplit[2] +
				':' +
				proxySplit[3] +
				'@' +
				proxySplit[0] +
				':' +
				proxySplit[1]
			);
		} else {
			return 'http://' + proxySplit[0] + ':' + proxySplit[1];
		}
	}

    async enterRaffle() {
        try {
            const response = await request({
                url: `https://phr51lvaef.execute-api.us-east-1.amazonaws.com/form/submit?a=m&email=${this.firstName}${config.catchall}&first=${this.firstName}&last=${this.lastName}&zip=${config.zipcode}&telephone=${this.pNumber}&product_id=6731916411007&kind=shoe&size=${config.size}`,
                method: 'GET',
                
                headers: {
                    'accept': 'application/json, text/plain, /*/',
                    'accept-encoding': 'gzip, deflate, br',
                    'accept-language': 'en-US,en;q=0.9',
                    'cache-control': 'no-cache',
                    'origin': 'https://shop.travisscott.com',
                    'pragma': 'no-cache',
                    'referer': 'https://shop.travisscott.com/',
                    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'cross-site',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
              },

                proxy: this.proxy,
                gzip: true,
                resolveWithFullResponse: true,
                followAllRedirects: true,
            });

            if (response.statusCode == 200) {
                console.log(chalk.green(` [TS Raffle] [ID: ${this.id}]     `) +   `Entered | ${this.firstName} ${this.lastName} | Status: ${response.statusCode}. `);
                ++entered;
            }
            else if (response.statusCode == 404) {
                console.log(chalk.red(` [TS Raffle] [ID: ${this.id}]       `) +   `Error |${this.accName} ${this.lastName} | Status: ${response.statusCode}`);
                ++failed;
            }
            
        } catch (err) {
            console.log(chalk.yellow(` [TS Raffle] [ID: ${this.id}]       `) + `Error has occured! Proxy: ${this.proxy} |  Status ${response.statusCode}`);
                ++errUnd;
            console.log(rBody);
            
			if (!proxies.length) {
				console.error(`(ID ${this.id}) Out of Proxies!`);
				process.exit(1);
			}
            this.sleep(2500);
        }
        setTerminalTitle(`TS Raffle Bot by: Inauthentic | Tasks: (${config.tasks}) Submitted: (${entered}) Failed: (${failed}) Errors: (${errUnd}) `, { verbose: false });
    }
}
for (let i = 0; i < config.tasks; i++) {
    new Task({ id: i + 1});
}



