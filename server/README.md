# Item level completeness calculated on the server

This nodejs application can be used to calculate the item level completeness for REDCap. In our project we run this program at regular intervals (every 2 hours) using a cronjob with the following pattern:

```
0 */2 * * * ../completeness/server/index.js create ../completeness/server/dataCache.json --timepoint 6_month_follow_up_arm_1
```

The parent directory uses the generated dataCache.json file as a data source.

