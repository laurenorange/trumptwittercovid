"use strict"

/* Define dimensions for visualization and to generate drawing canvas - Code adapted from class file: "hw7_starter" by Jay Taylor-Laird */
let width = 1200;
let height = 700;
let margin = {
    top: 160,
    right: 300,
    bottom: 100,
    left: 100
};

let svg = d3.select("#vis")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

/* Code to load data - by Jay Taylor-Laird.
Data collected on Excel file, saved to CSV and converted to JSON using https://www.convertcsv.com/csv-to-json.htm. Data last updated on February 18, 2021. */
let origData;
(async function () {
    origData = await d3.json("data.json").then(createVis);
})();

function createVis(origData) {

    /*** CODE TO MANIPULATE DATA.JSON FILE FOR VISUALIZATION ***/

    origData.sort(function (a, b) {
        return a.date - b.date;
    });

    /*************************************************
    Convert dates to months and create a new array of months.

    References:
        "Description" & "When not to use map()":
            https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
    
        "Examples using getMonth()": 
            https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMonth
    
        "Using Locales": 
            https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat

    *************************************************/

    let monthNamesArray = d3.map(origData, function (d) {
        let day = new Date(d.date);
        let monthNum = day.getMonth();
        let options = {
            month: "short"
        };
        let monthText = new Intl.DateTimeFormat("en-US", options).format(day);
        return monthText;
    }).keys();

    /* Uncomment to view result of above code to create an array of months */
    // console.log("monthsArray: " + monthNamesArray);


    /* Declare arrays separating monthly data for createMonthlyDataArray function */
    let monthlyApprovalArray = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ];

    let monthlyNewCovidArray = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ];

    let monthlyTweetsAndRetweetsArray = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ];

    /********************* createMonthlyDataArray *********************
    Description:
        Create arrays separating data by category and by month

    Parameters:
        array           Name of the array to assign data into

    Return:
        none

    Reference:
        "Syntax" and "Parameters" section:
            https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach

    ***********************************************/
    function createMonthlyDataArray(array) {
        let makeArray = origData.forEach(function (d) {
            let day = new Date(d.date);
            let monthNum = day.getMonth();
            let options = {
                month: "short"
            };
            let monthText = new Intl.DateTimeFormat("en-US", options).format(day);

            /* Loop goes through all data in JSON file and organizes data into specific categorical array declared above */
            for (let i = 0; i < 12; i++) {

                /* Organizes data to the correct month array within the categorical array */
                if (monthText == monthNamesArray[i]) {

                    /* These if, else if, and else statements put daily data into the correct month and array categories */
                    if (array == monthlyApprovalArray) {
                        array[i].push(d.approve);
                    } else if (array == monthlyNewCovidArray) {
                        array[i].push(d.newCovid);
                    } else {
                        array[i].push(d.tweets + d.retweets);
                    }
                }
            }
        })
    } // end of function createMonthlyDataArray

    /* Call functions to create arrays of specific monthly data */
    createMonthlyDataArray(monthlyApprovalArray);
    createMonthlyDataArray(monthlyNewCovidArray);
    createMonthlyDataArray(monthlyTweetsAndRetweetsArray);

    /* Uncomment to view monthly data arrays created with createMonthlyDataArray function */
    // console.log(monthlyApprovalArray);
    // console.log(monthlyNewCovidArray);
    // console.log(monthlyTweetsAndRetweetsArray);

    /* Declare arrays for monthly averages of data */
    let avgMonthlyApproval = [];
    let avgNewCovid = [];
    let avgTweetsAndRetweets = [];

    /********************* calcMonthlyAvg ********************* 
    Description:
        Create an array of monthly averages for data

    Parameters:
        monthlyDataArray        Enter name of array containing monthly data
        monthlyAvgArray         Enter name of new array to store monthly averages
        boolean                 true if array averages should be rounded
                                false if array averages should be left in decimal

    Return:
        none
    
    ***********************************************************/
    function calcMonthlyAvg(monthlyDataArray, monthlyAvgArray, boolean) {
        for (let i = 0; i < 12; i++) {

            /* Round average to nearest whole number if 'true' */
            if (boolean == true) {
                let monthlyAvg = d3.mean(monthlyDataArray[i]);
                monthlyAvg = Math.round(monthlyAvg);
                monthlyAvgArray.push(monthlyAvg);

                /* Leave average in decimal if 'false' */
            } else {
                let monthlyAvg = d3.mean(monthlyDataArray[i]);
                monthlyAvgArray.push(monthlyAvg);
            }
        }
    } // end of function calcMonthlyAvg

    /* Call functions to create monthly average arrays */
    calcMonthlyAvg(monthlyApprovalArray, avgMonthlyApproval, false);
    calcMonthlyAvg(monthlyNewCovidArray, avgNewCovid, true);
    calcMonthlyAvg(monthlyTweetsAndRetweetsArray, avgTweetsAndRetweets, false);

    /* Uncomment to view monthly average arrays created with calcMonthlyAvg function */
    // console.log(avgMonthlyApproval);
    // console.log(avgNewCovid);
    // console.log(avgTweetsAndRetweets);

    /* Combine monthly average arrays into an array of objects */
    let newMonthlyData = [];

    /********************* combineMonthlyData ********************* 
    Description:
        Create an array of monthly averages for data

    Parameters:
        none

    Return:
        none
    **************************************************************/
    function combineMonthlyData() {
        monthNamesArray.forEach(function (item, index) {
            let combineData = {};
            combineData.month = item;
            combineData.approval = avgMonthlyApproval[index];
            combineData.newCovid = avgNewCovid[index];
            combineData.twitter = avgTweetsAndRetweets[index];
            newMonthlyData.push(combineData);
        });
    } // end of function combineMonthlyData

    combineMonthlyData(); // call function to create an array combining monthly averages

    /* Uncomment to view new array of combined averages for approval rating, new COVID cases, and tweets and retweets created with combineMonthlyData function */
    // console.table(newMonthlyData);

    /*** CREATE VISUALIZATION. Code referenced and adapted from class file: "hw7_starter" by Jay Taylor-Laird ***/
    /* Define scales */
    let xScale = d3.scalePoint()
        .domain(monthNamesArray)
        .padding(1)
        .range([margin.left, width - margin.right]);

    /* Use origData approval rating min and max to give viewer better picture of overall approval ratings */
    let yScale = d3.scaleLinear()
        .domain([d3.min(origData, function (d) {
            return d.approve;
        }), d3.max(origData, function (d) {
            return d.approve - 1; // subtract 1 from max to give molecules a little more space
        })])
        .nice()
        .range([height - margin.bottom, margin.top]);

    let rScale = d3.scaleLinear()
        .domain([d3.min(newMonthlyData, function (d) {
            return d.twitter;
        }), d3.max(newMonthlyData, function (d) {
            return d.twitter;
        })])
        .range([5, 25]);

    /* Draw triangles scaled to average monthly COVID cases */
    let tScale = d3.scaleLinear()
        .domain([d3.min(newMonthlyData, function (d) {
            return d.newCovid;
        }), d3.max(newMonthlyData, function (d) {
            return d.newCovid;
        })])
        .range([0, 50]);

    /*** DRAW X-AXIS ***/
    /* Draw x-axis line, ticks, and text */
    let xAxis = svg.append("g")
        .attr("class", "xaxis") // changed class to "xaxis" to rotate labels
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    /* Rotate x-axis text. - Code by Phoebe Bright: http://bl.ocks.org/phoebebright/3059392 */
    svg.selectAll(".xaxis text")
        .attr("transform", function (d) {
            return "translate(" + this.getBBox().height * -1.25 + "," + this.getBBox().height + ")rotate(-45)"; // rotates and centers text under tick marks
        });

    /* Draw x-axis label */
    let xAxisLabel = svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", width / 2)
        .attr("y", height - margin.bottom / 3)
        .attr("text-anchor", "middle")
        .text("Month (2020)");

    /*** DRAW Y-AXIS ***/
    /* Draw y-axis line, ticks, and text */
    let yAxis = svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));

    /* Draw y-axis label and move to position */
    let yAxisLabel = svg.append("text")
        .attr("class", "axisLabel")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", (margin.left * 1 / 2))
        .attr("text-anchor", "middle")
        .text("Approval Rating");

    /*** DRAW COVID MOLECULES ***/
    /* Draw COVID spikes for January. */
    let covidSpikesMo0 = svg.append("g")
        .data(newMonthlyData.slice(0, 1)) // only show data for specific month using slice method. Reference: https://www.w3schools.com/jsref/jsref_slice_array.asp
        .join("g")
        .attr("transform", function (d) {
            return `translate(${xScale(d.month)}, ${yScale(d.approval)})`;
        });

    /* Draw lines. Reference code from class 9 file: "4_cleveland_dot_plot.zip" by Jay Taylor-Laird */
    monthlyNewCovidArray[0].forEach(function (item, index) {
        covidSpikesMo0.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", function (d) {
                return -rScale(d.twitter); // begin drawing line for covid spike from outside of the circle
            })
            .attr("y2", function (d) {
                return -rScale(d.twitter) - item * .001; // draw line based on daily tweets and retweets
            })
            .attr("stroke", "black")
            .attr("transform", function (d) {
                return `rotate(${360/31 * index})`
            });

        /* Reference transform syntax from class 9 file: "2_d3_symbols_multiple_call_demo" and https://stackoverflow.com/questions/33881962/triangle-scatter-plot-with-d3-js to move triangles */
        covidSpikesMo0.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle).size(function (d) {
                return tScale(d.newCovid);
            }))
            .attr("fill", "red")
            .attr("transform", function (d) {
                return `rotate(${360/31 * (index+7.75)})translate(${-rScale(d.twitter)-item*.001})`
            });
    })

    /* Draw COVID spikes for February */
    let covidSpikesMo1 = svg.append("g")
        .data(newMonthlyData.slice(1, 2))
        .join("g")
        .attr("transform", function (d) {
            return `translate(${xScale(d.month)}, ${yScale(d.approval)})`;
        });

    /* Draw lines */
    monthlyNewCovidArray[1].forEach(function (item, index) {
        covidSpikesMo1.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", function (d) {
                return -rScale(d.twitter); // begin drawing line for covid spike from outside of the circle
            })
            .attr("y2", function (d) {
                return -rScale(d.twitter) - item * .001; // draw line based on daily tweets and retweets
            })
            .attr("stroke", "black")
            .attr("transform", function (d) {
                return `rotate(${360/29 * index})`
            });

        /* Draw triangles */
        covidSpikesMo1.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle).size(function (d) {
                return tScale(d.newCovid);
            }))
            .attr("fill", "red")
            .attr("transform", function (d) {
                return `rotate(${360/29 * (index+7.25)})translate(${-rScale(d.twitter)-item*.001})`
            });
    })

    /* Draw COVID spikes for March */
    let covidSpikesMo2 = svg.append("g")
        .data(newMonthlyData.slice(2, 3))
        .join("g")
        .attr("transform", function (d) {
            return `translate(${xScale(d.month)}, ${yScale(d.approval)})`;
        });

    /* Draw lines */
    monthlyNewCovidArray[2].forEach(function (item, index) {
        covidSpikesMo2.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", function (d) {
                return -rScale(d.twitter); // begin drawing line for covid spike from outside of the circle
            })
            .attr("y2", function (d) {
                return -rScale(d.twitter) - item * .001; // draw line based on daily tweets and retweets
            })
            .attr("stroke", "black")
            .attr("transform", function (d) {
                return `rotate(${360/31 * index})`
            });

        /* Draw triangles */
        covidSpikesMo2.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle).size(function (d) {
                return tScale(d.newCovid);
            }))
            .attr("fill", "red")
            .attr("transform", function (d) {
                return `rotate(${360/31 * (index+7.75)})translate(${-rScale(d.twitter)-item*.001})`
            });
    })

    /* Draw COVID spikes for April */
    let covidSpikesMo3 = svg.append("g")
        .data(newMonthlyData.slice(3, 4))
        .join("g")
        .attr("transform", function (d) {
            return `translate(${xScale(d.month)}, ${yScale(d.approval)})`;
        });

    /* Draw lines */
    monthlyNewCovidArray[3].forEach(function (item, index) {
        covidSpikesMo3.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", function (d) {
                return -rScale(d.twitter); // begin drawing line for covid spike from outside of the circle
            })
            .attr("y2", function (d) {
                return -rScale(d.twitter) - item * .001; // draw line based on daily tweets and retweets
            })
            .attr("stroke", "black")
            .attr("transform", function (d) {
                return `rotate(${360/30 * index})`
            });

        /* Draw triangles */
        covidSpikesMo3.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle).size(function (d) {
                return tScale(d.newCovid);
            }))
            .attr("fill", "red")
            .attr("transform", function (d) {
                return `rotate(${360/30 * (index+7.50)})translate(${-rScale(d.twitter)-item*.001})`
            });
    })

    /* Draw COVID spikes for May */
    let covidSpikesMo4 = svg.append("g")
        .data(newMonthlyData.slice(4, 5))
        .join("g")
        .attr("transform", function (d) {
            return `translate(${xScale(d.month)}, ${yScale(d.approval)})`;
        });

    /* Draw lines */
    monthlyNewCovidArray[4].forEach(function (item, index) {
        covidSpikesMo4.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", function (d) {
                return -rScale(d.twitter); // begin drawing line for covid spike from outside of the circle
            })
            .attr("y2", function (d) {
                return -rScale(d.twitter) - item * .001; // draw line based on daily tweets and retweets
            })
            .attr("stroke", "black")
            .attr("transform", function (d) {
                return `rotate(${360/31 * index})`
            });

        /* Draw triangles */
        covidSpikesMo4.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle).size(function (d) {
                return tScale(d.newCovid);
            }))
            .attr("fill", "red")
            .attr("transform", function (d) {
                return `rotate(${360/31 * (index+7.75)})translate(${-rScale(d.twitter)-item*.001})`
            });
    })

    /* Draw COVID spikes for June */
    let covidSpikesMo5 = svg.append("g")
        .data(newMonthlyData.slice(5, 6))
        .join("g")
        .attr("transform", function (d) {
            return `translate(${xScale(d.month)}, ${yScale(d.approval)})`;
        });

    /* Draw lines */
    monthlyNewCovidArray[5].forEach(function (item, index) {
        covidSpikesMo5.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", function (d) {
                return -rScale(d.twitter); // begin drawing line for covid spike from outside of the circle
            })
            .attr("y2", function (d) {
                return -rScale(d.twitter) - item * .001; // draw line based on daily tweets and retweets
            })
            .attr("stroke", "black")
            .attr("transform", function (d) {
                return `rotate(${360/30 * index})`
            });

        /* Draw triangles */
        covidSpikesMo5.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle).size(function (d) {
                return tScale(d.newCovid);
            }))
            .attr("fill", "red")
            .attr("transform", function (d) {
                return `rotate(${360/30 * (index+7.50)})translate(${-rScale(d.twitter)-item*.001})`
            });
    })

    /* Draw COVID spikes for July */
    let covidSpikesMo6 = svg.append("g")
        .data(newMonthlyData.slice(6, 7))
        .join("g")
        .attr("transform", function (d) {
            return `translate(${xScale(d.month)}, ${yScale(d.approval)})`;
        });

    /* Draw lines */
    monthlyNewCovidArray[6].forEach(function (item, index) {
        covidSpikesMo6.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", function (d) {
                return -rScale(d.twitter); // begin drawing line for covid spike from outside of the circle
            })
            .attr("y2", function (d) {
                return -rScale(d.twitter) - item * .001; // draw line based on daily tweets and retweets
            })
            .attr("stroke", "black")
            .attr("transform", function (d) {
                return `rotate(${360/31 * index})`
            });

        /* Draw triangles */
        covidSpikesMo6.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle).size(function (d) {
                return tScale(d.newCovid);
            }))
            .attr("fill", "red")
            .attr("transform", function (d) {
                return `rotate(${360/31 * (index+7.75)})translate(${-rScale(d.twitter)-item*.001})`
            });
    })

    /* Draw COVID spikes for August */
    let covidSpikesMo7 = svg.append("g")
        .data(newMonthlyData.slice(7, 8))
        .join("g")
        .attr("transform", function (d) {
            return `translate(${xScale(d.month)}, ${yScale(d.approval)})`;
        });

    /* Draw lines */
    monthlyNewCovidArray[7].forEach(function (item, index) {
        covidSpikesMo7.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", function (d) {
                return -rScale(d.twitter); // begin drawing line for covid spike from outside of the circle
            })
            .attr("y2", function (d) {
                return -rScale(d.twitter) - item * .001; // draw line based on daily tweets and retweets
            })
            .attr("stroke", "black")
            .attr("transform", function (d) {
                return `rotate(${360/31 * index})`
            });

        /* Draw triangles */
        covidSpikesMo7.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle).size(function (d) {
                return tScale(d.newCovid);
            }))
            .attr("fill", "red")
            .attr("transform", function (d) {
                return `rotate(${360/31 * (index+7.75)})translate(${-rScale(d.twitter)-item*.001})`
            });
    })

    /* Draw COVID spikes for September */
    let covidSpikesMo8 = svg.append("g")
        .data(newMonthlyData.slice(8, 9))
        .join("g")
        .attr("transform", function (d) {
            return `translate(${xScale(d.month)}, ${yScale(d.approval)})`;
        });

    /* Draw lines */
    monthlyNewCovidArray[8].forEach(function (item, index) {
        covidSpikesMo8.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", function (d) {
                return -rScale(d.twitter); // begin drawing line for covid spike from outside of the circle
            })
            .attr("y2", function (d) {
                return -rScale(d.twitter) - item * .001; // draw line based on daily tweets and retweets
            })
            .attr("stroke", "black")
            .attr("transform", function (d) {
                return `rotate(${360/30 * index})`
            });

        /* Draw triangles */
        covidSpikesMo8.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle).size(function (d) {
                return tScale(d.newCovid);
            }))
            .attr("fill", "red")
            .attr("transform", function (d) {
                return `rotate(${360/30 * (index+7.50)})translate(${-rScale(d.twitter)-item*.001})`
            });
    })

    /* Draw COVID spikes for October */
    let covidSpikesMo9 = svg.append("g")
        .data(newMonthlyData.slice(9, 10))
        .join("g")
        .attr("transform", function (d) {
            return `translate(${xScale(d.month)}, ${yScale(d.approval)})`;
        });

    /* Draw lines */
    monthlyNewCovidArray[9].forEach(function (item, index) {
        covidSpikesMo9.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", function (d) {
                return -rScale(d.twitter); // begin drawing line for covid spike from outside of the circle
            })
            .attr("y2", function (d) {
                return -rScale(d.twitter) - item * .001; // draw line based on daily tweets and retweets
            })
            .attr("stroke", "black")
            .attr("transform", function (d) {
                return `rotate(${360/31 * index})`
            });

        /* Draw triangles */
        covidSpikesMo9.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle).size(function (d) {
                return tScale(d.newCovid);
            }))
            .attr("fill", "red")
            .attr("transform", function (d) {
                return `rotate(${360/31 * (index+7.75)})translate(${-rScale(d.twitter)-item*.001})`
            });
    })

    /* Draw COVID spikes for November */
    let covidSpikesMo10 = svg.append("g")
        .data(newMonthlyData.slice(10, 11))
        .join("g")
        .attr("transform", function (d) {
            return `translate(${xScale(d.month)}, ${yScale(d.approval)})`;
        });

    /* Draw lines */
    monthlyNewCovidArray[10].forEach(function (item, index) {
        covidSpikesMo10.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", function (d) {
                return -rScale(d.twitter); // begin drawing line for covid spike from outside of the circle
            })
            .attr("y2", function (d) {
                return -rScale(d.twitter) - item * .001; // draw line based on daily tweets and retweets
            })
            .attr("stroke", "black")
            .attr("transform", function (d) {
                return `rotate(${360/30 * index})`
            });

        /* Draw triangles */
        covidSpikesMo10.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle).size(function (d) {
                return tScale(d.newCovid);
            }))
            .attr("fill", "red")
            .attr("transform", function (d) {
                return `rotate(${360/30 * (index+7.50)})translate(${-rScale(d.twitter)-item*.001})`
            });
    })

    /* Draw COVID spikes for December */
    let covidSpikesMo11 = svg.append("g")
        .data(newMonthlyData.slice(11, 12))
        .join("g")
        .attr("transform", function (d) {
            return `translate(${xScale(d.month)}, ${yScale(d.approval)})`;
        });

    /* Draw lines */
    monthlyNewCovidArray[11].forEach(function (item, index) {
        covidSpikesMo11.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", function (d) {
                return -rScale(d.twitter); // begin drawing line for covid spike from outside of the circle
            })
            .attr("y2", function (d) {
                return -rScale(d.twitter) - item * .001; // draw line based on daily tweets and retweets
            })
            .attr("stroke", "black")
            .attr("transform", function (d) {
                return `rotate(${360/31 * index})`
            });

        /* Draw triangles */
        covidSpikesMo11.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle).size(function (d) {
                return tScale(d.newCovid);
            }))
            .attr("fill", "red")
            .attr("transform", function (d) {
                return `rotate(${360/31 * (index+7.75)})translate(${-rScale(d.twitter)-item*.001})`
            });
    })

    /* Draw covid molecule body */
    let circles = svg.selectAll("circle")
        .data(newMonthlyData)
        .join("circle")
        .attr("cx", function (d) {
            return xScale(d.month);
        })
        .attr("cy", function (d) {
            return yScale(d.approval);
        })
        .attr("r", function (d) {
            return rScale(d.twitter);
        })
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("opacity", ".5");

    /*** VISUALIZATION TITLE ***/
    svg.append("text")
        .attr("class", "title")
        .text("Trump's Twitter Presence and How It")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", 30)

    svg.append("text")
        .attr("class", "title")
        .text("Affects His Approval Rating in the Time of COVID-19")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", 65)

    /*** DRAW LEGEND ***/
    /* Create a group for legend objects */
    let legend = svg.append("g")
        .attr("transform", `translate(0, ${height-295})`)

    /* Legend box */
    legend.append("rect")
        .attr("height", 140)
        .attr("width", 284)
        .attr("fill", "lightgray")
        .attr("stroke", "black")
        .attr("stroke-width", "1px")
        .attr("x", width - 285)
        .attr("y", 110);

    /* Legend title */
    legend.append("text")
        .attr("class", "legend")
        .text("Legend")
        .attr("x", width - 275)
        .attr("y", 130)
        .attr("font-weight", "bold");

    /* Legend triangle */
    legend.append("path")
        .attr("d", d3.symbol().type(d3.symbolTriangle).size(50))
        .attr("fill", "red")
        .attr("transform", `translate(${width-265},146)`);

    legend.append("text")
        .attr("class", "legend")
        .text("Triangle = Avg COVID cases for given month")
        .attr("x", width - 250)
        .attr("y", 149);

    /* Legend line */
    legend.append("line")
        .attr("x1", width - 265)
        .attr("y1", 149)
        .attr("x2", width - 265)
        .attr("y2", 205)
        .attr("stroke", "black");

    legend.append("text")
        .attr("class", "legend")
        .text("Line length = Total daily new COVID cases")
        .attr("x", width - 250)
        .attr("y", 175);

    legend.append("text")
        .attr("class", "legend sub")
        .text("* Lines coincide with day of the month in a clock-wise rotation,")
        .attr("x", width - 275)
        .attr("y", 230);

    legend.append("text")
        .attr("class", "legend sub")
        .text("starting with 12 o'clock/North being the 1st of the month.")
        .attr("x", width - 270)
        .attr("y", 240);

    /* Legend circle */
    legend.append("circle")
        .attr("x", 10)
        .attr("y", 10)
        .attr("r", 10)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("cx", width - 265)
        .attr("cy", 195);

    legend.append("text")
        .attr("class", "legend")
        .text("Radius = Avg tweets and retweets for given")
        .attr("x", width - 250)
        .attr("y", 200);

    legend.append("text")
        .attr("class", "legend")
        .text("month")
        .attr("x", width - 200)
        .attr("y", 215);

    return origData;
}