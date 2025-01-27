var ctx = document.getElementById('myChart').getContext('2d');
var sockets = [];
var ticks_current = [];

const isLaptop =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) === false &&
    screen.width >= 768 &&
    screen.height >= 768;

var myChart = new Chart(ctx, {
    type: 'bar',
    plugins: [ChartDataLabels],

    data: {
        labels: ['Even', 'Odd'],
        datasets: [
            {
                data: [0, 0],
                backgroundColor: ['rgba(255, 99, 132, 1)', 'rgba(0, 179, 0, 1)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(0, 179, 0, 1)'],
                borderWidth: 1,
                borderRadius: 5,
            },
        ],
    },
    options: {
        indexAxis: 'y',
        legend: {
            display: false,
        },
        responsive: true,
        maintainAspectRatio: 0,
        plugins: {
            datalabels: {
                formatter: function (value, context) {
                    return value + '%';
                },
                clamp: true,
                anchor: 'end',
                align: 'start',
                labels: {
                    value: {
                        color: 'white',
                        font: {
                            weight: 'bold',
                            size: 18,
                        },
                    },
                },
            },
        },
    },
});

function changeContractType() {
    // Hide the 'over_under' section in all cases
    document.getElementById('over_under').style.display = 'none';

    // Hide or show the 'last_ticks_row' based on the selected contract type
    const lastTicksRow = document.getElementById('last_ticks_row');
    const contractType = document.getElementById('contract_type').value;

    if (contractType == '0') {
        // Show the last ticks row for Even/Odd
        lastTicksRow.style.display = 'none'; // block
        even_odd(); // Call the function to update the chart for Even/Odd
    } else if (contractType == '1') {
        // Hide the last ticks row and call rise_fall function
        lastTicksRow.style.display = 'none';
        rise_fall(); // Call the function for Rise/Fall
    } else {
        // Show the 'over_under' section and hide the last ticks row
        lastTicksRow.style.display = 'none';
        document.getElementById('over_under').style.display = 'flex';
        over_under(); // Call the function for Over/Under
    }
}

function countDecimals(value) {
    // Convert to String
    const numStr = String(value);
    // String Contains Decimal
    if (numStr.includes('.')) {
        return numStr.split('.')[1].length;
    }
    // String Does Not Contain Decimal
    return 0;
}

function even_odd() {
    removeAllClients();
    if (myChart) {
        myChart.destroy();
    }

    const ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'bar',
        plugins: [ChartDataLabels],
        data: {
            labels: ['Even', 'Odd'],
            datasets: [
                {
                    data: [0, 0],
                    backgroundColor: ['rgba(0, 179, 0, 1)', 'rgba(255, 99, 132, 1)'],
                    borderColor: ['rgba(0, 179, 0, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                    borderRadius: 5,
                },
            ],
        },
        options: {
            indexAxis: 'y',
            legend: {
                display: false,
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                datalabels: {
                    formatter: function (value) {
                        return value + '%';
                    },
                    clamp: true,
                    anchor: 'end',
                    align: 'start',
                    labels: {
                        value: {
                            color: 'white',
                            font: {
                                weight: 'bold',
                                size: 18,
                            },
                        },
                    },
                },
            },
        },
    });

    document.getElementById('current').innerHTML = '0';
    myChart.data.datasets[0].data[0] = 0;
    myChart.data.datasets[0].data[1] = 0;
    myChart.update();

    const market = document.getElementById('market').value;
    const lastTicks = []; // To store the last 50 ticks
    const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
    sockets.push(ws);

    ws.onopen = function () {
        ws.send(JSON.stringify({ authorize: document.getElementById('token').value }));
    };

    ws.onmessage = function (msg) {
        const data = JSON.parse(msg.data);

        if (data.msg_type === 'authorize') {
            ws.send(JSON.stringify({ forget_all: 'ticks' }));
        } else if (data.msg_type === 'forget_all') {
            ws.send(JSON.stringify({ forget: document.getElementById('subid').value }));
        } else if (data.msg_type === 'forget') {
            document.getElementById('even').value = 0;
            document.getElementById('odd').value = 0;
            ws.send(
                JSON.stringify({
                    ticks_history: market,
                    count: 60, // Request the last 50 ticks
                    end: 'latest',
                    adjust_start_time: 1,
                    style: 'ticks',
                })
            );
        } else if (data.msg_type === 'history') {
            let evenCount = 0;
            let oddCount = 0;

            data.history.prices.forEach(price => {
                const digit = determineDigit(price, market);
                lastTicks.push(digit);

                if (digit % 2 === 0) {
                    evenCount++;
                } else {
                    oddCount++;
                }
            });

            // Update the UI
            updateTickDisplay(lastTicks);
            updateCounts(evenCount, oddCount);
            updateChart(evenCount, oddCount);

            ws.send(JSON.stringify({ ticks: market, subscribe: 1 }));
        } else if (data.msg_type === 'tick') {
            if (data.echo_req.ticks === market) {
                const digit = determineDigit(data.tick.quote, market);
                document.getElementById('current').innerHTML = formatTick(data.tick.quote);

                // Update last 50 ticks
                if (lastTicks.length >= 60) {
                    lastTicks.shift(); // Remove the oldest tick
                }
                lastTicks.push(digit);

                // Generate letter representation
                updateTickDisplay(lastTicks);

                // Update counts and chart
                const evenCount = lastTicks.filter(t => t % 2 === 0).length;
                const oddCount = lastTicks.length - evenCount;
                updateCounts(evenCount, oddCount);
                updateChart(evenCount, oddCount);
            }
        } else {
            alert(data.error.message);
        }
    };

    function determineDigit(price, market) {
        if (market === 'RDBEAR' || market === 'RDBULL' || market === 'R_50' || market === 'R_75') {
            return (price * 10000) % 10;
        } else if (market === 'R_10' || market === 'R_25') {
            return (price * 1000) % 10;
        } else {
            return (price * 100) % 10;
        }
    }

    function updateTickDisplay(ticks) {
        const ticksRow = document.getElementById('last_ticks_row');
        ticksRow.innerHTML = ''; // Clear the current row

        ticks.forEach(tick => {
            const letter = tick % 2 === 0 ? 'E' : 'O';
            const className = tick % 2 === 0 ? 'even' : 'odd';
            ticksRow.innerHTML += `<span class="${className}">${letter}</span>`;
        });
    }

    function updateCounts(evenCount, oddCount) {
        document.getElementById('even').value = evenCount;
        document.getElementById('odd').value = oddCount;
        document.getElementById('even_label').innerHTML = 'Even: ' + evenCount;
        document.getElementById('odd_label').innerHTML = 'Odd: ' + oddCount;
    }

    function updateChart(even, odd) {
        const total = even + odd;
        myChart.data.datasets[0].data[0] = ((even / total) * 100).toFixed(1);
        myChart.data.datasets[0].data[1] = ((odd / total) * 100).toFixed(1);
        myChart.update();
    }

    function formatTick(tick) {
        const decimals = countDecimals(tick);
        return decimals === 0 ? tick + '.00' : decimals === 1 ? tick + '0' : tick;
    }

    function countDecimals(value) {
        return Math.floor(value) === value ? 0 : value.toString().split('.')[1]?.length || 0;
    }
}

function rise_fall() {
    removeAllClients();
    myChart.destroy();
    // document.getElementById('contract_type_title').innerHTML = 'Rise Fall Analysis';
    ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'bar',
        plugins: [ChartDataLabels],

        data: {
            labels: ['Rise', 'Fall'],
            datasets: [
                {
                    data: [0, 0],
                    backgroundColor: ['rgba(0, 179, 0, 1)', 'rgba(255, 99, 132, 1)'],
                    borderColor: ['rgba(0, 179, 0, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                    borderRadius: 5,
                },
            ],
        },
        options: {
            indexAxis: 'y',
            legend: {
                display: false,
            },
            responsive: true,
            maintainAspectRatio: 0,
            plugins: {
                datalabels: {
                    formatter: function (value, context) {
                        return value + '%';
                    },
                    clamp: true,
                    anchor: 'end',
                    align: 'start',
                    labels: {
                        value: {
                            color: 'white',
                            font: {
                                weight: 'bold',
                                size: 18,
                            },
                        },
                    },
                },
            },
        },
    });
    document.getElementById('current').innerHTML = 0;
    myChart.data.datasets[0].data[0] = 0;
    myChart.data.datasets[0].data[1] = 0;
    myChart.options.plugins.legend.display = false;
    myChart.update();
    let market = document.getElementById('market').value;
    var ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
    sockets.push(ws);
    ws.onopen = function (evt) {
        ws.send(JSON.stringify({ authorize: document.getElementById('token').value }));
    };
    ws.onmessage = function (msg) {
        var data = JSON.parse(msg.data);
        if (data.msg_type == 'authorize') {
            ws.send(JSON.stringify({ forget_all: 'ticks' }));
        } else if (data.msg_type == 'forget_all') {
            ws.send(JSON.stringify({ forget: document.getElementById('subid').value }));
        } else if (data.msg_type == 'forget') {
            document.getElementById('rise').value = 0;
            document.getElementById('fall').value = 0;
            document.getElementById('previous').value = 0;
            ws.send(
                JSON.stringify({
                    ticks_history: document.getElementById('market').value,
                    count: document.getElementById('ticks').value,
                    end: 'latest',
                })
            );
        } else if (data.msg_type == 'history') {
            let counter = 0;
            let rise = 0;
            let fall = 0;
            let previous = 0;
            ticks_current.length = 0;
            let market = document.getElementById('market').value;
            while (counter < data.history.prices.length) {
                previous = parseFloat(previous);
                let digit = 0;
                if (market == 'RDBEAR' || market == 'RDBULL' || market == 'R_50' || market == 'R_75') {
                    digit = (data.history.prices[counter] * 10000) % 10;
                } else if (market == 'R_10' || market == 'R_25') {
                    digit = (data.history.prices[counter] * 1000) % 10;
                } else {
                    digit = (data.history.prices[counter] * 100) % 10;
                }
                ticks_current.push(data.history.prices[counter]);
                if (previous > data.history.prices[counter]) {
                    //fall
                    fall = fall + parseInt(document.getElementById('fall').value);
                    fall++;
                } else if (previous < data.history.prices[counter]) {
                    //rise
                    rise = rise + parseInt(document.getElementById('rise').value);
                    rise++;
                }
                previous = data.history.prices[counter];
                counter++;
            }
            document.getElementById('fall').value = fall;
            document.getElementById('rise').value = rise;
            document.getElementById('odd_label').innerHTML = 'Fall: ' + fall;
            document.getElementById('even_label').innerHTML = 'Rise: ' + rise;
            let total = rise + fall;
            myChart.data.datasets[0].data[0] = ((rise / total) * 100).toFixed(1);
            myChart.data.datasets[0].data[1] = ((fall / total) * 100).toFixed(1);
            myChart.update();
            ws.send(
                JSON.stringify({
                    ticks: document.getElementById('market').value,
                    subscribe: 1,
                })
            );
        } else if (data.msg_type == 'tick') {
            if (data.echo_req.ticks == document.getElementById('market').value) {
                document.getElementById('current').innerHTML = data.tick.quote;
                document.getElementById('subid').value = data.subscription.id;
                let rise = 0;
                let fall = 0;
                let digit = 0;
                if (
                    data.echo_req.ticks == 'RDBEAR' ||
                    data.echo_req.ticks == 'RDBULL' ||
                    data.echo_req.ticks == 'R_50' ||
                    data.echo_req.ticks == 'R_75'
                ) {
                    digit = (data.tick.quote * 10000) % 10;
                    let temp = countDecimals(data.tick.quote);
                    if (temp == 0) {
                        document.getElementById('current').innerHTML = data.tick.quote + '.0000';
                    } else if (temp == 1) {
                        document.getElementById('current').innerHTML = data.tick.quote + '000';
                    } else if (temp == 2) {
                        document.getElementById('current').innerHTML = data.tick.quote + '00';
                    } else if (temp == 3) {
                        document.getElementById('current').innerHTML = data.tick.quote + '0';
                    } else {
                        document.getElementById('current').innerHTML = data.tick.quote;
                    }
                } else if (data.echo_req.ticks == 'R_10' || data.echo_req.ticks == 'R_25') {
                    digit = (data.tick.quote * 1000) % 10;
                    let temp = countDecimals(data.tick.quote);
                    if (temp == 0) {
                        document.getElementById('current').innerHTML = data.tick.quote + '.000';
                    } else if (temp == 1) {
                        document.getElementById('current').innerHTML = data.tick.quote + '00';
                    } else if (temp == 2) {
                        document.getElementById('current').innerHTML = data.tick.quote + '0';
                    } else {
                        document.getElementById('current').innerHTML = data.tick.quote;
                    }
                } else {
                    digit = (data.tick.quote * 100) % 10;
                    let temp = countDecimals(data.tick.quote);
                    if (temp == 0) {
                        document.getElementById('current').innerHTML = data.tick.quote + '.00';
                    } else if (temp == 1) {
                        document.getElementById('current').innerHTML = data.tick.quote + '0';
                    } else {
                        document.getElementById('current').innerHTML = data.tick.quote;
                    }
                }

                document.getElementById('previous').value = ticks_current[0];

                let previous = ticks_current.length - 1;
                previous = parseFloat(previous);
                if (ticks_current[previous] > data.tick.quote) {
                    document.getElementById('current').classList.remove('text-primary');
                    document.getElementById('current').classList.remove('text-danger');
                    document.getElementById('current').classList.remove('text-secondary');
                    document.getElementById('current').classList.add('text-danger');
                } else if (ticks_current[previous] < data.tick.quote) {
                    document.getElementById('current').classList.remove('text-primary');
                    document.getElementById('current').classList.remove('text-danger');
                    document.getElementById('current').classList.remove('text-secondary');
                    document.getElementById('current').classList.add('text-primary');
                } else {
                    document.getElementById('current').classList.remove('text-primary');
                    document.getElementById('current').classList.remove('text-danger');
                    document.getElementById('current').classList.remove('text-secondary');
                    document.getElementById('current').classList.add('text-secondary');
                }

                for (var i = 0; i < ticks_current.length; i++) {
                    let j = i + 1;
                    if (j == ticks_current.length) {
                        ticks_current[i] = data.tick.quote;
                    } else {
                        ticks_current[i] = ticks_current[j];
                    }
                }

                for (var i = 0; i < ticks_current.length; i++) {
                    let j = i - 1;
                    if (j < 0) {
                        let prev = parseFloat(document.getElementById('previous').value);
                        if (prev > ticks_current[i]) {
                            fall++;
                        } else if (prev < ticks_current[i]) {
                            rise++;
                        }
                    } else {
                        if (ticks_current[j] > ticks_current[i]) {
                            fall++;
                        } else if (ticks_current[j] < ticks_current[i]) {
                            rise++;
                        }
                    }
                }

                document.getElementById('fall').value = fall;
                document.getElementById('rise').value = rise;
                document.getElementById('previous').value = data.tick.quote;
                document.getElementById('odd_label').innerHTML = 'Fall: ' + fall;
                document.getElementById('even_label').innerHTML = 'Rise: ' + rise;
                let total = rise + fall;
                myChart.data.datasets[0].data[0] = ((rise / total) * 100).toFixed(1);
                myChart.data.datasets[0].data[1] = ((fall / total) * 100).toFixed(1);
                myChart.update();
            }
        } else {
            alert(data.error.message);
        }
    };
}
function over_under() {
    myChart.destroy();
    removeAllClients();
    // document.getElementById('contract_type_title').innerHTML = 'Over Under Analysis';
    ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'bar',
        plugins: [ChartDataLabels],

        data: {
            labels: ['Over', 'Under'],
            datasets: [
                {
                    data: [0, 0],
                    backgroundColor: ['rgba(0, 179, 0, 1)', 'rgba(255, 99, 132, 1)'],
                    borderColor: ['rgba(0, 179, 0, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                    borderRadius: 5,
                },
            ],
        },
        options: {
            indexAxis: 'y',
            legend: {
                display: false,
            },
            responsive: true,
            maintainAspectRatio: 0,
            plugins: {
                datalabels: {
                    formatter: function (value, context) {
                        return value + '%';
                    },
                    clamp: true,
                    anchor: 'end',
                    align: 'start',
                    labels: {
                        value: {
                            color: 'white',
                            font: {
                                weight: 'bold',
                                size: 18,
                            },
                        },
                    },
                },
            },
        },
    });
    document.getElementById('current').innerHTML = 0;
    myChart.data.datasets[0].data[0] = 0;
    myChart.data.datasets[0].data[1] = 0;
    myChart.options.plugins.legend.display = false;
    myChart.update();
    let market = document.getElementById('market').value;
    var ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
    sockets.push(ws);
    ws.onopen = function (evt) {
        ws.send(JSON.stringify({ authorize: document.getElementById('token').value }));
    };
    ws.onmessage = function (msg) {
        var data = JSON.parse(msg.data);
        if (data.msg_type == 'authorize') {
            ws.send(JSON.stringify({ forget_all: 'ticks' }));
        } else if (data.msg_type == 'forget_all') {
            ws.send(JSON.stringify({ forget: document.getElementById('subid').value }));
        } else if (data.msg_type == 'forget') {
            document.getElementById('over').value = 0;
            document.getElementById('under').value = 0;
            ws.send(
                JSON.stringify({
                    ticks_history: document.getElementById('market').value,
                    count: document.getElementById('ticks').value,
                    end: 'latest',
                })
            );
        } else if (data.msg_type == 'history') {
            let counter = 0;
            let over = 0;
            let under = 0;
            let market = document.getElementById('market').value;
            ticks_current.length = 0;
            while (counter < data.history.prices.length) {
                let digit = 0;
                if (market == 'RDBEAR' || market == 'RDBULL' || market == 'R_50' || market == 'R_75') {
                    digit = (data.history.prices[counter] * 10000) % 10;
                } else if (market == 'R_10' || market == 'R_25') {
                    digit = (data.history.prices[counter] * 1000) % 10;
                } else {
                    digit = (data.history.prices[counter] * 100) % 10;
                }
                ticks_current.push(digit);
                if (digit > document.getElementById('over_input').value) {
                    over = over + parseInt(document.getElementById('over').value);
                    over++;
                }
                if (digit < document.getElementById('under_input').value) {
                    under = under + parseInt(document.getElementById('under').value);
                    under++;
                }
                counter++;
            }
            document.getElementById('over').value = over;
            document.getElementById('under').value = under;
            document.getElementById('even_label').innerHTML = 'Over: ' + over;
            document.getElementById('odd_label').innerHTML = 'Under: ' + under;
            let total = over + under;
            myChart.data.datasets[0].data[0] = ((over / total) * 100).toFixed(1);
            myChart.data.datasets[0].data[1] = ((under / total) * 100).toFixed(1);
            myChart.update();
            ws.send(
                JSON.stringify({
                    ticks: document.getElementById('market').value,
                    subscribe: 1,
                })
            );
        } else if (data.msg_type == 'tick') {
            if (data.echo_req.ticks == document.getElementById('market').value) {
                document.getElementById('current').innerHTML = data.tick.quote;
                document.getElementById('subid').value = data.subscription.id;
                let over = 0;
                let under = 0;
                let digit = 0;
                if (
                    data.echo_req.ticks == 'RDBEAR' ||
                    data.echo_req.ticks == 'RDBULL' ||
                    data.echo_req.ticks == 'R_50' ||
                    data.echo_req.ticks == 'R_75'
                ) {
                    digit = (data.tick.quote * 10000) % 10;
                    let temp = countDecimals(data.tick.quote);
                    if (temp == 0) {
                        document.getElementById('current').innerHTML = data.tick.quote + '.0000';
                    } else if (temp == 1) {
                        document.getElementById('current').innerHTML = data.tick.quote + '000';
                    } else if (temp == 2) {
                        document.getElementById('current').innerHTML = data.tick.quote + '00';
                    } else if (temp == 3) {
                        document.getElementById('current').innerHTML = data.tick.quote + '0';
                    } else {
                        document.getElementById('current').innerHTML = data.tick.quote;
                    }
                } else if (data.echo_req.ticks == 'R_10' || data.echo_req.ticks == 'R_25') {
                    digit = (data.tick.quote * 1000) % 10;
                    let temp = countDecimals(data.tick.quote);
                    if (temp == 0) {
                        document.getElementById('current').innerHTML = data.tick.quote + '.000';
                    } else if (temp == 1) {
                        document.getElementById('current').innerHTML = data.tick.quote + '00';
                    } else if (temp == 2) {
                        document.getElementById('current').innerHTML = data.tick.quote + '0';
                    } else {
                        document.getElementById('current').innerHTML = data.tick.quote;
                    }
                } else {
                    digit = (data.tick.quote * 100) % 10;
                    let temp = countDecimals(data.tick.quote);
                    if (temp == 0) {
                        document.getElementById('current').innerHTML = data.tick.quote + '.00';
                    } else if (temp == 1) {
                        document.getElementById('current').innerHTML = data.tick.quote + '0';
                    } else {
                        document.getElementById('current').innerHTML = data.tick.quote;
                    }
                }
                document.getElementById('current').classList.add('text-primary');
                for (var i = 0; i < ticks_current.length; i++) {
                    let j = i + 1;
                    if (j == ticks_current.length) {
                        ticks_current[i] = digit;
                    } else {
                        ticks_current[i] = ticks_current[j];
                    }
                }

                for (var i = 0; i < ticks_current.length; i++) {
                    if (ticks_current[i] > document.getElementById('over_input').value) {
                        over++;
                    }
                    if (ticks_current[i] < document.getElementById('under_input').value) {
                        under++;
                    }
                }

                document.getElementById('over').value = over;
                document.getElementById('under').value = under;
                document.getElementById('odd_label').innerHTML = 'Under: ' + under;
                document.getElementById('even_label').innerHTML = 'Over: ' + over;
                let total = over + under;
                myChart.data.datasets[0].data[0] = ((over / total) * 100).toFixed(1);
                myChart.data.datasets[0].data[1] = ((under / total) * 100).toFixed(1);
                myChart.update();
            }
        } else {
            alert(data.error.message);
        }
    };
}

setInterval(function () {
    let old_ticks = document.getElementById('old_ticks').value;
    let current_ticks = document.getElementById('ticks').value;
    if (current_ticks > 5000) {
        document.getElementById('ticks').value = 5000;
    }
    if (old_ticks != current_ticks) {
        document.getElementById('old_ticks').value = current_ticks;
        changeMarket();
    }
}, 1000);

function cleanup() {
    if (document.getElementById('contract_type').value == 0) {
        let tick_data = document.getElementById('current').innerHTML;
        if (
            document.getElementById('market').value == 'RDBEAR' ||
            document.getElementById('market').value == 'RDBULL' ||
            document.getElementById('market').value == 'R_50' ||
            document.getElementById('market').value == 'R_75'
        ) {
            digit = (tick_data * 10000) % 10;
            if (digit % 2 == 0) {
                document.getElementById('current').classList.remove('text-primary');
                document.getElementById('current').classList.remove('text-danger');
                document.getElementById('current').classList.remove('text-secondary');
                document.getElementById('current').classList.add('text-primary');
            } else {
                document.getElementById('current').classList.remove('text-primary');
                document.getElementById('current').classList.remove('text-danger');
                document.getElementById('current').classList.remove('text-secondary');
                document.getElementById('current').classList.add('text-danger');
            }
        } else if (
            document.getElementById('market').value == 'R_10' ||
            document.getElementById('market').value == 'R_25'
        ) {
            digit = (tick_data * 1000) % 10;
            if (digit % 2 == 0) {
                document.getElementById('current').classList.remove('text-primary');
                document.getElementById('current').classList.remove('text-danger');
                document.getElementById('current').classList.remove('text-secondary');
                document.getElementById('current').classList.add('text-primary');
            } else {
                document.getElementById('current').classList.remove('text-primary');
                document.getElementById('current').classList.remove('text-danger');
                document.getElementById('current').classList.remove('text-secondary');
                document.getElementById('current').classList.add('text-danger');
            }
        } else {
            digit = (tick_data * 100) % 10;
            if (digit % 2 == 0) {
                document.getElementById('current').classList.remove('text-primary');
                document.getElementById('current').classList.remove('text-danger');
                document.getElementById('current').classList.remove('text-secondary');
                document.getElementById('current').classList.add('text-primary');
            } else {
                document.getElementById('current').classList.remove('text-primary');
                document.getElementById('current').classList.remove('text-danger');
                document.getElementById('current').classList.remove('text-secondary');
                document.getElementById('current').classList.add('text-danger');
            }
        }
    }
}

setInterval(function () {
    changeMarket();
}, 600000);

function removeAllClients() {
    sockets.forEach(function (s) {
        s.close();
    });
}

function changeMarket() {
    removeAllClients();
    changeContractType();

    //get previous ticks first

    //start fetching live ticks
}

// ============== Custom Functions =====================
