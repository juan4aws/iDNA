$(document).ready(function(){

    function CognitoUtil () {

        //idToken, accessToken, refreshToken
        this.accessToken = '';
        this.idToken = '';
        this.refreshToken = '';
        this._REGION = 'us-east-1';
        this._USER_POOL = null;
        this.cognitoCreds = null;

        /**
         * TODO: replace Ids with values from cloud formation outputs
         * @type {{identityPoolId: string, userPoolId: string, clientId: string}}
         */
        this.cognitoData = {

            identityPoolId: 'us-east-1:dca4d20c-31a7-0000-1234-XXXXYYYYZZZZ',
            clientId: 'AAAABBBBCCCCl8tm0nohup1234',
            userPoolId: 'us-east-1_AAAABBBBC'

        };
        
        this.init = function(){

            this._USER_POOL = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool({
                UserPoolId : this.cognitoData.userPoolId,
                ClientId : this.cognitoData.clientId
            });
            
        };

        this.setTokens = function(result) {

            this.accessToken = result.getAccessToken().getJwtToken();
            this.idToken = result.getIdToken().getJwtToken();
            // this.refreshToken = result.getRefreshToken().getJwtToken();

            // this.accessToken = jwtToken.split('.')[0];
            // this.idToken = jwtToken.split('.')[1];
            // this.refreshToken = jwtToken.split('.')[2];


        };

        this.getExpiration = function() {

            const idToken = this.idToken.split('.')[1];

            const decoded = JSON.parse((window.atob(idToken)).toString('utf8'));
            return decoded.exp;

        };

        this.setCognitoCreds = function(creds) {
            this.cognitoCreds = creds;
        };

        this.buildCognitoCreds = function(idTokenJwt) {

            let url = 'cognito-idp.' + this._REGION.toLowerCase() + '.amazonaws.com/' + this.cognitoData.userPoolId;
            // if (environment.cognito_idp_endpoint) {
            //     url = environment.cognito_idp_endpoint + '/' + this.cognitoData.userPoolId;
            // }
            // let logins: CognitoIdentity.LoginsMap = {};

            let logins = {};
            logins[url] = idTokenJwt;

            let params = {
                IdentityPoolId: this.cognitoData.identityPoolId, /* required */
                Logins: logins
            };
            // let serviceConfigs : awsservice.ServiceConfigurationOptions = {};
            let serviceConfigs = {};

            // if (environment.cognito_identity_endpoint) {
            //     serviceConfigs.endpoint = environment.cognito_identity_endpoint;
            // }

            let creds = new AWS.CognitoIdentityCredentials(params, serviceConfigs);
            this.setCognitoCreds(creds);
            return creds;
        };

        this.getCurrentUser = function() {

            let cognitoUser = this._USER_POOL.getCurrentUser();

            if (cognitoUser !== null) {
                cognitoUser.getSession(function (err, session) {
                    if (err)
                        console.log("UserParametersService: Couldn't retrieve the user");
                    else {
                        cognitoUser.getUserAttributes(function (err, result) {
                            if (err) {
                                console.log("UserParametersService: in getParameters: " + err);
                            } else {
                                console.log(result);
                            }
                        });
                    }

                });
            } else {
                console.log("No user!!")
            }
        };
        
        this.getTemporaryCredentials = function (){

            // Configure the credentials provider to use your identity pool
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: this.cognitoData.identityPoolId
            });

            // Make the call to obtain credentials
            AWS.config.credentials.get(function(){

                // Credentials will be available when this function is called.
                let accessKeyId = AWS.config.credentials.accessKeyId;
                let secretAccessKey = AWS.config.credentials.secretAccessKey;
                let sessionToken = AWS.config.credentials.sessionToken;

                console.log(accessKeyId, secretAccessKey, sessionToken);

            });
        }
    }

    const cognitoUtil = new CognitoUtil();
    cognitoUtil.init();

    // Set the region where your identity pool exists (us-east-1, eu-west-1)
    AWS.config.update({region: cognitoUtil._REGION});


    /**
     *
     */
    function registerUser() {

        let username =      $('#txtUsername').val();
        let password =      $('#txtPassword').val();
        let email =         $('#txtEmail').val();
        let phoneNumber =   $('#txtPhoneNumber').val();

        let attributeList = [];

        let dataEmail = {
            Name : 'email',
            Value : email
        };

        let dataPhoneNumber = {
            Name : 'phone_number',
            Value : phoneNumber //'+15555550000'
        };

        let attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
        let attributePhoneNumber = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataPhoneNumber);

        attributeList.push(attributeEmail);
        attributeList.push(attributePhoneNumber);

        cognitoUtil._USER_POOL.signUp(username, password, attributeList, null, function(err, result){

            if (err) {
                alert(err);
                return;
            }

            cognitoUser = result.user;

            $('#msgRegistered').text('Registered user: ' + cognitoUser.getUsername());

            $('#txtUsernameConfirm').val(cognitoUser.getUsername());
        });

    }

    function confirmUser(e){

        e.preventDefault();

        let username =          $('#txtUsernameConfirm').val();
        let confirmationCode =  $('#txtConfirmationCode').val();

        const userData = {
            Username: username,
            Pool: cognitoUtil._USER_POOL
        };

        const cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        cognitoUser.confirmRegistration(confirmationCode, true, function (err, result) {
            if (err) {
                $('#msgConfirmed').text('Error confirming user: ' + err.message);
            } else {
                $('#msgConfirmed').text('Confirmed user: ' + result);
            }
        });
    }

    /**
     *
     */
    function authenticate(){

        let username = $('#txtUsernameLogin').val();
        let password = $('#txtPasswordLogin').val();

        // Need to provide placeholder keys unless unauthorised user access is enabled for user pool
        AWSCognito.config.update({accessKeyId: 'anything', secretAccessKey: 'anything'});

        const authenticationData = {
            Username: username,
            Password: password
        };

        // const authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
        //const authenticationDetails = new AuthenticationDetails(authenticationData);
        const authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);


        const userData = {
            Username: username,
            Pool: cognitoUtil._USER_POOL
        };

        const cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {

            onSuccess: function (result) {

                const jwtToken = result.getIdToken().getJwtToken();

                cognitoUtil.setTokens(result);

                cognitoUtil.buildCognitoCreds(jwtToken);

                const logins = {};

                logins['cognito-idp.' + cognitoUtil._REGION + '.amazonaws.com/' + cognitoUtil.cognitoData.userPoolId]
                    = jwtToken;

                // Add the User's Id Token to the Cognito credentials login map.
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: cognitoUtil.cognitoData.identityPoolId,
                    Logins: logins
                });

                // Instantiate aws sdk service objects now that the credentials have been updated.
                // example: let s3 = new AWS.S3();

                console.log('AWS credentials - ' + JSON.stringify(AWS.config.credentials));

                console.log('AWS Cognito credentials - ' + JSON.stringify(AWSCognito.config.credentials));

                AWS.config.credentials.get(function (err) {
                    if (!err) {
                        let jsonPretty = JSON.stringify(result, null, '\t');
                        $('#modalBody').text(jsonPretty);
                        $('#exampleModalLong').modal({})
                    } else {
                        $('#msgLogin').text(err.message);
                    }
                });

            },

            onFailure: function (err) {
                $('#msgLogin').text(err.message);
            }
        });

    }

    /**
     *
     */
    function faceBookLogin(){

        FB.login(function (response) {

            // Check if the user logged in successfully.
            if (response.authResponse) {

                console.log('You are now logged in.');

                // Add the Facebook access token to the Cognito credentials login map.
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: cognitoUtil.cognitoData.identityPoolId,
                    Logins: {
                        'graph.facebook.com': response.authResponse.accessToken
                    }
                });

                // Obtain AWS credentials
                AWS.config.credentials.get(function(err){
                    // Access AWS resources here.
                    if (!err) {
                        let jsonPretty = JSON.stringify(response, null, '\t');
                        $('#modalBody').text(jsonPretty);
                        $('#exampleModalLong').modal({})
                    } else {
                        $('#msgLogin').text(err.message);
                    }
                });

                console.log('Welcome!  Fetching your information.... ');
                FB.api('/me', {fields: 'name, email'}, function(response) {
                    console.log('Good to see you, ' + response.name + '.');
                });

            } else {
                console.log('There was a problem logging you in.');
            }

        }, {scope: 'email, public_profile', return_scopes: true});
    }

    function amazonLogin(){
        options = { scope : 'profile' };
        amazon.Login.authorize(options, function(response) {
            if ( response.error ) {
                alert('oauth error ' + response.error);
                return;
            }
            alert('success: ' + response.access_token);
        });
        return false;
    }

    /**
     * This can be called once we exchange CUP credentials for identity pool credentials
     */
    function listInstances() {

        // Create an S3 client
        let s3 = new AWS.S3();

        let ec2 = new AWS.EC2();

        ec2.describeInstances({}, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                $('#msgEC2').text(err);
            } else {

                let jsonPretty = JSON.stringify(data.Reservations, null, '\t');
                $('#modalBody').text(jsonPretty);
                $('#exampleModalLong').modal({})
            }
        });
    }


    // ----- listener registration -------

    $("#btnRegisterUser").on("click", function(){
        registerUser();
    });

    $("#btnConfirmUser").on("click", function(e){
        confirmUser(e);
    });

    $("#btnLogin").on("click", function(){
        authenticate();
    });

    $("#btnListEC2Instances").on("click", function(){
        listInstances();
    });

    $("#btnListuserInfo").on("click", function(){
        cognitoUtil.getCurrentUser();
    });

    $("#btnLoginFacebook").on("click", function(){
        faceBookLogin();
    });

    $("#LoginWithAmazon").on("click", function(){
        amazonLogin();
    });




});