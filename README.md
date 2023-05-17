# Nuxt Api Error doesn't work

## Install
```
npm install
npm run dev
```

## How to test

Click on submit, we receive an Event and not the Error of the Api

I wouldlike to receive the real Error :
```
{
    "errors": [
        {
            "user": {
                "invitation_token": "invalid"
            }
        }
    ]
}
```

So for that I have add `__h3_error__: true` in the response of error in my configuration **Api**


## How ?

Go to `api/http-service.js` and decomment this line :

```
// constructor: { __h3_error__: true },
```

Click on submit, I receive the Api error
