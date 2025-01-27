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
        lastTicksRow.style.display = 'block';
        even_odd(); // Call the function to update the chart for Even/Odd
    } else if (contractType == '1') {
        // Hide the last ticks row and call rise_fall function
        lastTicksRow.style.display = 'none';
        rise_fall(); // Call the function for Rise/Fall
    } else if (contractType == '3') {
        // Hide the last ticks row and call match_differs function
        lastTicksRow.style.display = 'none';
        match_differs(); // Call the function for Match/Differs
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
function match_differs() {
    myChart.destroy();
    removeAllClients();
    // document.getElementById('contract_type_title').innerHTML = 'Match Differs Analysis';
    ctx = document.getElementById('myChart').getContext('2d');

    if (isLaptop) {
        myChart = new Chart(ctx, {
            type: 'bar',
            plugins: [ChartDataLabels],

            data: {
                labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
                datasets: [
                    {
                        data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                        backgroundColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                        ],
                        borderWidth: 1,
                        borderRadius: 5,
                    },
                ],
            },
            options: {
                indexAxis: 'x',
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
    } else {
        myChart = new Chart(ctx, {
            type: 'bar',
            plugins: [ChartDataLabels],

            data: {
                labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
                datasets: [
                    {
                        data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                        backgroundColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                        ],
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
    }

    document.getElementById('current').innerHTML = 0;
    myChart.data.datasets[0].data[0] = 0;
    myChart.data.datasets[0].data[1] = 0;
    myChart.data.datasets[0].data[2] = 0;
    myChart.data.datasets[0].data[3] = 0;
    myChart.data.datasets[0].data[4] = 0;
    myChart.data.datasets[0].data[5] = 0;
    myChart.data.datasets[0].data[6] = 0;
    myChart.data.datasets[0].data[7] = 0;
    myChart.data.datasets[0].data[8] = 0;
    myChart.data.datasets[0].data[9] = 0;
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
            document.getElementById('digit0').value = 0;
            document.getElementById('digit1').value = 0;
            document.getElementById('digit2').value = 0;
            document.getElementById('digit3').value = 0;
            document.getElementById('digit4').value = 0;
            document.getElementById('digit5').value = 0;
            document.getElementById('digit6').value = 0;
            document.getElementById('digit7').value = 0;
            document.getElementById('digit8').value = 0;
            document.getElementById('digit9').value = 0;
            ws.send(
                JSON.stringify({
                    ticks_history: document.getElementById('market').value,
                    count: document.getElementById('ticks').value,
                    end: 'latest',
                })
            );
        } else if (data.msg_type == 'history') {
            let counter = 0;
            let digit0 = 0;
            let digit1 = 0;
            let digit2 = 0;
            let digit3 = 0;
            let digit4 = 0;
            let digit5 = 0;
            let digit6 = 0;
            let digit7 = 0;
            let digit8 = 0;
            let digit9 = 0;
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
                if (digit == 0) {
                    digit0++;
                } else if (digit == 1) {
                    digit1++;
                } else if (digit == 2) {
                    digit2++;
                } else if (digit == 3) {
                    digit3++;
                } else if (digit == 4) {
                    digit4++;
                } else if (digit == 5) {
                    digit5++;
                } else if (digit == 6) {
                    digit6++;
                } else if (digit == 7) {
                    digit7++;
                } else if (digit == 8) {
                    digit8++;
                } else if (digit == 9) {
                    digit9++;
                }
                counter++;
            }
            document.getElementById('digit0').value = digit0;
            document.getElementById('digit1').value = digit1;
            document.getElementById('digit2').value = digit2;
            document.getElementById('digit3').value = digit3;
            document.getElementById('digit4').value = digit4;
            document.getElementById('digit5').value = digit5;
            document.getElementById('digit6').value = digit6;
            document.getElementById('digit7').value = digit7;
            document.getElementById('digit8').value = digit8;
            document.getElementById('digit9').value = digit9;
            document.getElementById('even_label').innerHTML = '';
            document.getElementById('odd_label').innerHTML = '';
            let total = digit0 + digit1 + digit2 + digit3 + digit4 + digit5 + digit6 + digit7 + digit8 + digit9;

            let arr = [];
            arr.push(digit0, digit1, digit2, digit3, digit4, digit5, digit6, digit7, digit8, digit9);
            let resultS = findSmallest(arr);
            let resultL = findLargest(arr);

            document.getElementById('odd_label').innerHTML = 'Lowest Digit: ' + resultS.index;
            document.getElementById('even_label').innerHTML = 'Highest Digit: ' + resultL.index;

            myChart.data.datasets[0].data[0] = ((digit0 / total) * 100).toFixed(1);
            myChart.data.datasets[0].data[1] = ((digit1 / total) * 100).toFixed(1);
            myChart.data.datasets[0].data[2] = ((digit2 / total) * 100).toFixed(1);
            myChart.data.datasets[0].data[3] = ((digit3 / total) * 100).toFixed(1);
            myChart.data.datasets[0].data[4] = ((digit4 / total) * 100).toFixed(1);
            myChart.data.datasets[0].data[5] = ((digit5 / total) * 100).toFixed(1);
            myChart.data.datasets[0].data[6] = ((digit6 / total) * 100).toFixed(1);
            myChart.data.datasets[0].data[7] = ((digit7 / total) * 100).toFixed(1);
            myChart.data.datasets[0].data[8] = ((digit8 / total) * 100).toFixed(1);
            myChart.data.datasets[0].data[9] = ((digit9 / total) * 100).toFixed(1);
            myChart.data.datasets[0].backgroundColor[resultS.index] = 'rgba(255, 99, 132, 1)';
            myChart.data.datasets[0].borderColor[resultS.index] = 'rgba(255, 99, 132, 1)';
            myChart.data.datasets[0].backgroundColor[resultL.index] = 'rgba(0, 255, 0, 1)';
            myChart.data.datasets[0].borderColor[resultL.index] = 'rgba(0, 255, 0, 1)';
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
                let digit0 = 0;
                let digit1 = 0;
                let digit2 = 0;
                let digit3 = 0;
                let digit4 = 0;
                let digit5 = 0;
                let digit6 = 0;
                let digit7 = 0;
                let digit8 = 0;
                let digit9 = 0;
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
                    if (ticks_current[i] == 0) {
                        digit0++;
                    } else if (ticks_current[i] == 1) {
                        digit1++;
                    } else if (ticks_current[i] == 2) {
                        digit2++;
                    } else if (ticks_current[i] == 3) {
                        digit3++;
                    } else if (ticks_current[i] == 4) {
                        digit4++;
                    } else if (ticks_current[i] == 5) {
                        digit5++;
                    } else if (ticks_current[i] == 6) {
                        digit6++;
                    } else if (ticks_current[i] == 7) {
                        digit7++;
                    } else if (ticks_current[i] == 8) {
                        digit8++;
                    } else if (ticks_current[i] == 9) {
                        digit9++;
                    }
                }

                document.getElementById('digit0').value = digit0;
                document.getElementById('digit1').value = digit1;
                document.getElementById('digit2').value = digit2;
                document.getElementById('digit3').value = digit3;
                document.getElementById('digit4').value = digit4;
                document.getElementById('digit5').value = digit5;
                document.getElementById('digit6').value = digit6;
                document.getElementById('digit7').value = digit7;
                document.getElementById('digit8').value = digit8;
                document.getElementById('digit9').value = digit9;
                document.getElementById('odd_label').innerHTML = '';
                document.getElementById('even_label').innerHTML = '';
                let total = digit0 + digit1 + digit2 + digit3 + digit4 + digit5 + digit6 + digit7 + digit8 + digit9;

                let arr = [];
                arr.push(digit0, digit1, digit2, digit3, digit4, digit5, digit6, digit7, digit8, digit9);
                let resultS = findSmallest(arr);
                let resultL = findLargest(arr);

                document.getElementById('odd_label').innerHTML = 'Lowest Digit: ' + resultS.index;
                document.getElementById('even_label').innerHTML = 'Highest Digit: ' + resultL.index;

                myChart.data.datasets[0].data[0] = ((digit0 / total) * 100).toFixed(1);
                myChart.data.datasets[0].data[1] = ((digit1 / total) * 100).toFixed(1);
                myChart.data.datasets[0].data[2] = ((digit2 / total) * 100).toFixed(1);
                myChart.data.datasets[0].data[3] = ((digit3 / total) * 100).toFixed(1);
                myChart.data.datasets[0].data[4] = ((digit4 / total) * 100).toFixed(1);
                myChart.data.datasets[0].data[5] = ((digit5 / total) * 100).toFixed(1);
                myChart.data.datasets[0].data[6] = ((digit6 / total) * 100).toFixed(1);
                myChart.data.datasets[0].data[7] = ((digit7 / total) * 100).toFixed(1);
                myChart.data.datasets[0].data[8] = ((digit8 / total) * 100).toFixed(1);
                myChart.data.datasets[0].data[9] = ((digit9 / total) * 100).toFixed(1);
                myChart.data.datasets[0].backgroundColor[resultS.index] = 'rgba(255, 99, 132, 1)';
                myChart.data.datasets[0].borderColor[resultS.index] = 'rgba(255, 99, 132, 1)';
                myChart.data.datasets[0].backgroundColor[resultL.index] = 'rgba(0, 255, 0, 1)';
                myChart.data.datasets[0].borderColor[resultL.index] = 'rgba(0, 255, 0, 1)';
                for (var i = 0; i < arr.length; i++) {
                    if (resultS.index == i || resultL.index == i) {
                        continue;
                    } else {
                        myChart.data.datasets[0].backgroundColor[i] = 'rgba(54, 162, 235, 1)';
                        myChart.data.datasets[0].borderColor[i] = 'rgba(54, 162, 235, 1)';
                    }
                }
                myChart.update();
            }
        } else {
            alert(data.error.message);
        }
    };
}

function findSmallest(arr) {
    let smallest = arr[0];
    let index = 0;

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] < smallest) {
            smallest = arr[i];
            index = i;
        }
    }

    return { smallest: smallest, index: index };
}

function findLargest(arr) {
    let largest = arr[0];
    let index = 0;

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > largest) {
            largest = arr[i];
            index = i;
        }
    }

    return { largest: largest, index: index };
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
