# eq-activity
Activity logger module for Eq application


## Example

```JavaScript
const activity = require('eq-activity'),
    options = {
        api_key: 'API_KEY',
        secret:  'API_SECRET',
        url: 'http://localhsot:3000/api'
    },
    activity_logger = activity(options);

activity_logger.log('KEY', {
    value: {},
    extra: {}
}, callback);
```
