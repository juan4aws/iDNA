$(document).ready(function(){

    function CognitoUtil () {

        this.accessToken = '';
        this.idToken = '';
        this.refreshToken = '';
        this._REGION = 'us-east-1';
        this._USER_POOL = null;
        this.cognitoCreds = null;

        /**
         * TODO: replace Ids with values from cloud formation outputs tab
         * @type {{cognitoIdentityPoolId: string, cognitoUserPoolId: string, cognitoUserPoolClientId: string}}
         */
        this.cognitoConfigProperties = {

            cognitoIdentityPoolId: 'us-east-1:2f35bde3-085d-49fa-a8b3-de6006eede4b',
            cognitoUserPoolClientId: '5l0q88ltkjtnf14inqp0vjvu9',
            cognitoUserPoolId: 'us-east-1_NhUUIiA42',

        };
        
        this.init = function(){

            this._USER_POOL = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool({
                UserPoolId : this.cognitoConfigProperties.cognitoUserPoolId,
                ClientId : this.cognitoConfigProperties.cognitoUserPoolClientId
            });
            
        };

        this.setTokens = function(result) {

            this.accessToken = result.getAccessToken().getJwtToken();
            this.idToken = result.getIdToken().getJwtToken();
            // this.refreshToken = result.getRefreshToken().getJwtToken();
        };

        this.getExpiration = function() {

            const idToken = this.idToken.split('.')[1];

            const decoded = JSON.parse((window.atob(idToken)).toString('utf8'));
            return decoded.exp;

        };

        this.setCognitoCreds = function(creds) {
            this.cognitoCreds = creds;
        };

        /**
         *
         * @param idTokenJwt
         * @returns {*}
         */
        this.buildCognitoCreds = function(idTokenJwt) {

            let url = 'cognito-idp.' + this._REGION.toLowerCase() + '.amazonaws.com/' + this.cognitoConfigProperties.cognitoUserPoolId;
            // if (environment.cognito_idp_endpoint) {
            //     url = environment.cognito_idp_endpoint + '/' + this.cognitoConfigProperties.cognitoUserPoolId;
            // }
            // let logins: CognitoIdentity.LoginsMap = {};

            let logins = {};
            logins[url] = idTokenJwt;

            let params = {
                IdentityPoolId: this.cognitoConfigProperties.cognitoIdentityPoolId, /* required */
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

        /**
         *
         */
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
                IdentityPoolId: this.cognitoConfigProperties.cognitoIdentityPoolId
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

    // create and init
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

            $('#msgRegistered').text('Registered user: ' + result.user.getUsername());

            $('#txtUsernameConfirm').val(result.user.getUsername());
        });

    }

    /**
     *
     */
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

                logins['cognito-idp.' + cognitoUtil._REGION + '.amazonaws.com/' + cognitoUtil.cognitoConfigProperties.cognitoUserPoolId]
                    = jwtToken;

                // Add the User's Id Token to the Cognito credentials login map.
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: cognitoUtil.cognitoConfigProperties.cognitoIdentityPoolId,
                    Logins: logins
                });

                // Instantiate aws sdk service objects now that the credentials have been updated.
                // example: let s3 = new AWS.S3();

                console.log('AWS credentials - ' + JSON.stringify(AWS.config.credentials));

                console.log('AWS Cognito credentials - ' + JSON.stringify(AWSCognito.config.credentials));

                AWS.config.credentials.get(function (err) {
                    if (!err) {
                        let jsonPretty = JSON.stringify(result, null, '\t');

                        //$('#txtaDebug').val( $("#txtaDebug").val() + jsonPretty);
                        // $('#txtaDebug').val( $("#txtaDebug").val() + "\n\n ***************************** \n\n");
                        // $('#txtaDebug').val( function(index, old) { return "\n\n ***************************** \n\n"; });
                        $('#txtaDebug').val( function(index, old) { return jsonPretty + old; } );

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

    $("#btnClear").on("click", function(){
        $('#txtaDebug').val('');
    });

});