# data-forge-indicators

Financial and quantitative trading indicators for use with [Data-Forge](http://www.data-forge-js.com/).

[Please click here for a graphical example of all indicators](https://data-forge.github.io/data-forge-indicators/).

Need to learn data wrangling? See my book [Data Wrangling with JavaScript](http://bit.ly/2t2cJu2) or blog [The Data Wrangler](http://www.the-data-wrangler.com/).

Do prototyping and data analysis in JavaScript with [Data-Forge Notebook](http://www.data-forge-notebook.com/).

## Indicators supported

- Simple moving average (`sma`)
- Exponential moving average (`ema`)
- Bollinger bands (`bollinger`) (including `percentB` and `bandwidth`)
- Gaps (`gaps`)
- Market direction (`direction`)
- Market extrema (`extrema`)
- Market trends (`trends`)
- Momentum (`momentum`)
- Rate of change (`roc`)
- Relative strength index (`rsi`)
- Streaks (`streaks`)
- Connor's RSI (`crsi`)
- Stochastic (`stochasticSlow` and `stochasticFast`)

MORE INDICATORS COMING SOON

## Setup

Install Data-Forge, Data-Forge Indicators and auxilary modules via npm:

    npm install --save data-forge data-forge-fs data-forge-plot data-forge-indicators 

Import into your script (JavaScript):

```javascript
const dataForge = require('data-forge');
require('data-forge-fs'); // Add file system functions to Data-Forge.
require('data-forge-plot'); // Add chart plotting functions to Data-Forge.
require('data-forge-indicators'); // Add financial indicator functions to Data-Forge.
```

Import into your script (TypeScript):

```typescript
import * as dataForge from 'data-forge';
import 'data-forge-fs'; // Add file system functions to Data-Forge.
import 'data-forge-plot'; // Add chart plotting functions to Data-Forge.
import 'data-forge-indicators'; // Add financial indicator functions to Data-Forge.
```

## Loading some data

To compute some indicators you'll need to load some data. You can load your data from whatever source you want, you might load it from a database or a REST API. For this example we'll load our data from a [CSV](https://en.wikipedia.org/wiki/Comma-separated_values) data file:

```javascript
let inputSeries = dataForge.readFileSync("STW.csv")
    .parseCSV()
    .parseDates("date", "DD/MM/YYYY")
    .parseFloats(["open", "high", "low", "close", "volume"])
    .setIndex("date") // Index so we can later merge on date.
    .bake();
```

## Moving average 

Use the `sma` function to compute a simple moving average of a data series:

```javascript
const movingAverage = inputSeries
    .deflate(bar => bar.close)  // Extract closing price series from input data.
    .sma(30)                    // 30 day moving average.
    .bake();                    // Force lazy evaluation to complete.
```

To compare the moving average against your input data you'll need to merge it back into your source data:

```javascript
const withMovingAverage = inputSeries
    .skip(30)                           // Skip blank sma entries.
    .withSeries("sma", movingAverage)   // Integrate moving average into data, indexed on date.
    .bake();
```

You can preview your data in [Data-Forge Notebook](http://www.data-forge-notebook.com/) using the `display` function:

```javascript
display(withMovingAverage.tail(5));
```

![Input data merged with moving average](https://raw.githubusercontent.com/data-forge/data-forge-indicators/master/images/sma-preview.png)

You can plot the moving average and compare to the source data using Data-Forge Plot:

```javascript
const plot = withMovingAverage.plot({}, { y: ["close", "sma"] }));
plot.renderImage("sma.png");
```

Or plot with the [Data-Forge Notebook](http://www.data-forge-notebook.com/) `display` function:

```javascript
display(plot);
```

The rendered chart looks like this: 

![Simple moving average chart](https://raw.githubusercontent.com/data-forge/data-forge-indicators/master/images/sma.png)

Also available is an `ema` function that works in the same way as `sma`.

## Bollinger bands

Use the `bollinger` function to compute [Bollinger Bands](https://en.wikipedia.org/wiki/Bollinger_Bands) from a data series:

```javascript
const bollingerBands = inputSeries
    .deflate(bar => bar.close)  // Extract closing price series from input data.
    .bollinger(20, 2, 2)        // 20 days with bands at 2 standard deviations.
    .bake();
```

You can preview your data in [Data-Forge Notebook](http://www.data-forge-notebook.com/) using the `display` function:

```javascript
display(bollingerBands.tail(5));
```

![Bollinger bands table preview](https://raw.githubusercontent.com/data-forge/data-forge-indicators/master/images/bollinger-preview.png)

To compare Bollinger Bands to the closing price, merge the closing price data series into the bollinger bands dataframe:

```javascript
const withBollingerBands = bollingerBands
    .withSeries("close",
        inputSeries.deflate(row => row.close)
    );
```

You can render a chart using Data-Forge Plot or [Data-Forge Notebook](http://www.data-forge-notebook.com/).

The chart looks like this:

![Bollinger bands chart](https://raw.githubusercontent.com/data-forge/data-forge-indicators/master/images/bollinger-chart.png)

## Percent b and bandwidth

Percent b (%b) and bandwidth are indicators [derived from Bollinger Bands](https://en.wikipedia.org/wiki/Bollinger_Bands#Indicators_derived_from_Bollinger_Bands). 

%b shows where price is in relation to the bands with values at 1 for the upper band and 0 for the lower band:

```javascript
const percentB = = inputSeries
    .deflate(bar => bar.close)
    .bollinger(20, 2, 2)        // Need Bollinger Bands first.
    .percentB();
```

Bandwidth shows the normalised width of the bands:

```javascript
const bandwidth = = inputSeries
    .deflate(bar => bar.close)
    .bollinger(20, 2, 2)        // Need Bollinger Bands first.
    .bandwidth();
```

## Gaps

Use the gaps function to compute percentage gap between close and open of subsequent days/bars.

To use this functon your input dataframe must have open, high, low and close (OHLC) fields.

```javascript
const gaps = inputSeries.gaps();
console.log(gaps.toArray());
```

## Market direction

The `direction` function allows you test the direction of a series.

```javascript
const dailyDirection = inputSeries
    .deflate(row => row.close)
    .direction(2);
```

```javascript
const monthlyDirection = inputSeries
    .deflate(row => row.close)
    .direction(30);
```

The result is a series of -1, 0 and 1 values that indicate the direction of the value (down, flat or up) for the particular time period.

## Market extrema

The `extrema` function builds on the `direction` function to pick out minima (troughs) and maxima (peaks) in the series.

```javascript
const extrema = inputSeries
    .deflate(row => row.close)
    .extrema();
```

## Market trends

The `trends` function builds on the `extrema` function to detect trends in the market. It returns a series of -1 and 1 values to tell you when the series is in downtrend or uptrend.

```javascript
const trends = inputSeries
    .deflate(row => row.close)
    .trends();
```

An uptrend is defined as a series of higher troughs.

A downtrend is defined as a series of lower peaks.

## Momentum

Compute [momentum](https://en.wikipedia.org/wiki/Momentum_(technical_analysis)) using the `momentum` function.

```javascript
const momentum = inputSeries.deflate(row => row.close).momentum(30);
```

## Rate of change

Compute [rate of change](https://en.wikipedia.org/wiki/Momentum_(technical_analysis)) using the `rateOfChange` function.

```javascript
const rateOfChange = inputSeries.deflate(row => row.close).roc(30);
```

## Relative strength index

Use the `rsi` function to compute relative strength.

```javascript
const rsi = inputSeries.deflate(row => row.close).rsi(14);
```

## Streaks

Use the `streaks` function to count streaks of up days and down days.

Up day streaks are counted with positive numbers, down day streaks with negative numbers.

This function is used by Connor's RSI (`csri`).

```javascript
const streaks = inputSeries.deflate(row => row.close).streaks();
display(streaks.plot());
```

## Connor's RSI

Use the `csri` function for Connor's updated RSI indicator.

```javascript
const crsi = inputSeries.deflate(row => row.close).crsi(3, 2, 100);
display(crsi.plot({ y: { min: 0, max: 99 } }));
```

## MACD

Use the `macd` function to compute *moving average convergence divergence*:

```javascript
const macd = inputSeries.deflate(row => row.close).macd(12, 26, 9); // Inputs are short ema period, long ema period and signal line period.
display(macd.plot({}, { y: "histogram" }));
```

## Stochastic

Compute Stochastic using the `stochasticSlow`  or `stochasticFast`  function.

```javascript
const stochasticSlow = inputSeries.stochasticSlow(20, 12, 12)
    .withSeries('stoch slow', stochasticSlow)

const stochasticFast = inputSeries.stochasticSlow(20, 12)
    .withSeries('stoch fast', stochasticFast)

```
