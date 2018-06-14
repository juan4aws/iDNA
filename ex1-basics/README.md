# About

This exercise will walk you through simple scenario of using Cognito to maintain a user pool and hosted UI to allow 
users to your new application to register, confirm their registration, and authenticate into your application. We will 
also show how to create your own UI using the cognito api to perform the same function - register, confirm, and 
authenticate. 




# Setup - Manual

TODO


# Setup - Cloud Formation

* execute the cloudformation template. 
* when finished go to the outputs seciton of the template and note the keys displayed by the template. 
* use these keys to populate the TODO section of idna_workshop_ex1_app.js
* serve index.html using your IDE or local http server. I use http-server, a cli http server available here: 
https://github.com/indexzero/http-server




    
    
# Junk

Domain: https://idna.auth.us-east-1.amazoncognito.com

To Sign In: https://idna.auth.us-east-1.amazoncognito.com/login?response_type=token&client_id=1ga8qjvieiuias7h163f4tqp0j&redirect_uri=https://node-alb-one-1981137585.us-east-1.elb.amazonaws.com/api/echo/get



https://your_domain/login?response_type=[code|token]&client_id=your_app_client_id&redirect_uri=your_callback_url

https://node-alb-one-1981137585.us-east-1.elb.amazonaws.com/api/echo/get


URL REQUEST Made usin callback url