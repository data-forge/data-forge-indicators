# data-forge-indicators

Financial and quantitative trading indicators for use with [Data-Forge](http://www.data-forge-js.com/).

Need to learn data wrangling? See my book [Data Wrangling with JavaScript](http://bit.ly/2t2cJu2) or blog [The Data Wrangler](http://www.the-data-wrangler.com/).

Do prototyping and data analysis in JavaScript with [Data-Forge Notebook](http://www.data-forge-notebook.com/).

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

## Simple moving average 

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

![Input data merged with moving average](https://raw.githubusercontent.com/data-forge/data-forge-indicators/master/images/sma-preview.pngsma-preview.png)

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

![Simple moving average chart](https://raw.githubusercontent.com/data-forge/data-forge-indicators/masterhttps://raw.githubusercontent.com/data-forge/data-forge-indicators/master/images/sma-preview.pngsma-preview.pngsma.png)

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

![Bollinger bands table preview](https://raw.githubusercontent.com/data-forge/data-forge-indicators/master/images/sma-preview.pngbollinger-preview.png)

To compare Bollinger Bands to the closing price, merge the closing price data series into the bollinger bands dataframe:

```javascript
const withBollingerBands = bollingerBands
    .withSeries("close",
        inputSeries.deflate(row => row.close)
    );
```

You can render a chart using Data-Forge Plot or [Data-Forge Notebook](http://www.data-forge-notebook.com/).

The chart looks like this:

![Bollinger bands chart](https://raw.githubusercontent.com/data-forge/data-forge-indicators/master/images/sma-preview.pngbollinger-chart.png)